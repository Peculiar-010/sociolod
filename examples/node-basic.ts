/**
 * Node.js Basic Example
 * Demonstrates searching YouTube and downloading an MP3 to disk.
 *
 * Run: npx tsx examples/node-basic.ts
 */
import { SociolodClient } from "sociolod";

const client = new SociolodClient({
  timeout: 15_000,
  retries: 2,
  cache: { enabled: true, ttl: 60_000 },
});

async function main(): Promise<void> {
  console.log("🔍 Searching YouTube for 'lofi hip hop'...");
  const videos = await client.youtube.search.search("lofi hip hop", { limit: 3 });
  console.log(`Found ${videos.length} results:`);
  videos.forEach((v, i) => console.log(`  ${i + 1}. ${v.title} (${v.duration})`));

  const topVideo = videos[0];
  if (!topVideo) return;

  console.log("\n📥 Fetching download URL...");
  const dl = await client.youtube.download.url(topVideo.url, { format: "mp3" });
  console.log(`Download URL: ${dl.url}`);

  console.log("\n💾 Downloading to ./downloads/...");
  const filePath = await client.youtube.download.download(topVideo.url, {
    format: "mp3",
    outDir: "./downloads",
  });
  console.log(`✅ Saved to: ${filePath}`);

  console.log("\n🎵 Searching Spotify...");
  const tracks = await client.spotify.search.search("lofi chill beats", { limit: 3 });
  tracks.forEach((t, i) =>
    console.log(`  ${i + 1}. ${t.name} — ${t.artists[0]?.name}`),
  );
}

main().catch(console.error);
