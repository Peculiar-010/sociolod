/**
 * Browser Search Example
 * Demonstrates using sociolod in a browser environment.
 * Note: The API server must have CORS headers set for browser use.
 */
import { SociolodClient } from "sociolod";

const client = new SociolodClient({
  cache: { enabled: true, ttl: 30_000 },
});

export async function searchYouTube(query: string): Promise<void> {
  const resultsEl = document.getElementById("results")!;
  resultsEl.innerHTML = "Searching...";

  const videos = await client.youtube.search.search(query, { limit: 5 });
  resultsEl.innerHTML = videos
    .map(
      (v) =>
        `<div>
          <img src="${v.thumbnails.default.url}" alt="${v.title}" />
          <a href="${v.url}" target="_blank">${v.title}</a>
          <span>${v.duration}</span>
        </div>`,
    )
    .join("");
}

export async function getStreamUrl(youtubeUrl: string): Promise<string> {
  // Stream to blob URL for browser playback
  const stream = await client.youtube.download.stream(youtubeUrl, { format: "mp3" });
  const blob = await new Response(stream).blob();
  return URL.createObjectURL(blob);
}

export async function searchSpotify(query: string): Promise<void> {
  const tracks = await client.spotify.search.search(query, { limit: 5 });
  console.log(
    "Spotify results:",
    tracks.map((t) => `${t.name} — ${t.artists[0]?.name}`),
  );
}
