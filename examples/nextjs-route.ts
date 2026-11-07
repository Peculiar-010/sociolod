/**
 * Next.js App Router API Route Example
 * Place this at: app/api/music/route.ts
 *
 * GET /api/music?q=lofi&service=youtube
 * GET /api/music?url=https://youtube.com/watch?v=...&format=mp3
 */
import { type NextRequest, NextResponse } from "next/server";
import { SociolodClient, ValidationError, RateLimitError } from "sociolod";

// Reuse client across requests (cached at module scope)
const sociolod = new SociolodClient({
  timeout: 15_000,
  cache: { enabled: true, ttl: 60_000 },
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const url = searchParams.get("url");
  const format = (searchParams.get("format") ?? "mp3") as "mp3" | "mp4";
  const service = searchParams.get("service") ?? "youtube";
  const limit = Number(searchParams.get("limit") ?? "10");

  try {
    // Search mode
    if (q) {
      const results =
        service === "spotify"
          ? await sociolod.spotify.search.search(q, { limit })
          : await sociolod.youtube.search.search(q, { limit });

      return NextResponse.json(results);
    }

    // Download URL mode
    if (url) {
      const isSpotify = url.includes("open.spotify.com");
      const result = isSpotify
        ? await sociolod.spotify.download.url(url, { format })
        : await sociolod.youtube.download.url(url, { format });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Provide either q (search) or url (download) parameter" },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: error.retryAfter },
        { status: 429 },
      );
    }
    console.error("sociolod error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
