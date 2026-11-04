/**
 * Cloudflare Worker Example
 * Routes: GET /search?q= and GET /download?url=&format=
 * Deploy: wrangler deploy
 */
import { SociolodClient } from "sociolod";

const sociolod = new SociolodClient({
  timeout: 10_000,
  retries: 1,
  cache: { enabled: true, ttl: 30_000 },
});

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    try {
      // GET /search?q=lofi&service=youtube
      if (url.pathname === "/search") {
        const q = url.searchParams.get("q");
        const service = url.searchParams.get("service") ?? "youtube";
        const limit = Number(url.searchParams.get("limit") ?? "5");

        if (!q) {
          return new Response(JSON.stringify({ error: "q parameter required" }), {
            status: 400,
            headers,
          });
        }

        const results =
          service === "spotify"
            ? await sociolod.spotify.search.search(q, { limit })
            : await sociolod.youtube.search.search(q, { limit });

        return new Response(JSON.stringify(results), { headers });
      }

      // GET /download?url=...&format=mp3
      if (url.pathname === "/download") {
        const videoUrl = url.searchParams.get("url");
        const format = (url.searchParams.get("format") ?? "mp3") as "mp3" | "mp4";

        if (!videoUrl) {
          return new Response(JSON.stringify({ error: "url parameter required" }), {
            status: 400,
            headers,
          });
        }

        const isSpotify = videoUrl.includes("open.spotify.com");
        const result = isSpotify
          ? await sociolod.spotify.download.url(videoUrl, { format })
          : await sociolod.youtube.download.url(videoUrl, { format });

        return new Response(JSON.stringify(result), { headers });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers,
      });
    }
  },
};
