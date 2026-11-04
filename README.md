# sociolod — Universal YouTube & Spotify SDK for TypeScript

[![npm version](https://img.shields.io/npm/v/sociolod.svg?style=flat-square)](https://www.npmjs.com/package/sociolod)
[![npm downloads](https://img.shields.io/npm/dm/sociolod.svg?style=flat-square)](https://www.npmjs.com/package/sociolod)
[![license](https://img.shields.io/npm/l/sociolod.svg?style=flat-square)](https://github.com/YOUR_USERNAME/sociolod/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/sociolod/ci.yml?style=flat-square)](https://github.com/YOUR_USERNAME/sociolod/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

**sociolod** is a production-ready TypeScript SDK for the [LiteType media API](https://apispec.litype.workers.dev). It wraps YouTube search, YouTube audio/video download, Spotify search, and Spotify download into a single, fully-typed package that works in Node.js, browsers, Cloudflare Workers, Vercel Edge, Discord bots, Telegram bots, and React Native apps — with zero mandatory dependencies.

---

## ✨ Features

- **YouTube Search** — full-text search, single video, random pick, thumbnails, links, titles, channel info
- **YouTube Download** — video info, thumbnails, direct MP3/MP4 URLs, streaming, disk download, search+download in one call
- **Spotify Search** — track search, single song, random, album cover, links, artist profiles
- **Spotify Download** — track info, 30s preview, YouTube match, direct URL, streaming, disk download
- **Fully typed** — 100% TypeScript with strict mode, strong generics, JSDoc on every method
- **Resilient** — exponential backoff retry, configurable timeouts, `RateLimitError` with `Retry-After`
- **Tree-shakeable** — dual ESM + CJS build, `sideEffects: false`, sub-path exports
- **Optional caching** — in-memory LRU cache with configurable TTL
- **Universal** — works in Node 18+, browsers, Cloudflare Workers, Vercel Edge, Bun

---

## 📦 Installation

```bash
npm install sociolod
pnpm add sociolod
yarn add sociolod
bun add sociolod
```

---

## 🚀 Quick Start

### Node.js

```typescript
import { SociolodClient } from "sociolod";

const client = new SociolodClient();

// Search YouTube
const videos = await client.youtube.search.search("lofi hip hop", { limit: 5 });
console.log(videos[0].title);

// Get MP3 download URL
const { url } = await client.youtube.download.url(
  "https://youtube.com/watch?v=dQw4w9WgXcQ",
  { format: "mp3" }
);

// Download to disk
const filePath = await client.youtube.download.download(
  "https://youtube.com/watch?v=dQw4w9WgXcQ",
  { format: "mp3", outDir: "./downloads" }
);

// Search Spotify
const tracks = await client.spotify.search.search("blinding lights");
console.log(tracks[0].name, tracks[0].artists[0].name);
```

### Browser

```typescript
import { SociolodClient } from "sociolod";

const client = new SociolodClient({ cache: { enabled: true } });

// Search and get stream as blob
const video = await client.youtube.search.video("never gonna give you up");
const stream = await client.youtube.download.stream(video.url, { format: "mp3" });
const blob = await new Response(stream).blob();
const audioUrl = URL.createObjectURL(blob);
```

### Cloudflare Worker / Edge Runtime

```typescript
import { SociolodClient } from "sociolod";

const client = new SociolodClient({ timeout: 10_000, retries: 1 });

export default {
  async fetch(request: Request) {
    const q = new URL(request.url).searchParams.get("q") ?? "lofi";
    const results = await client.youtube.search.search(q, { limit: 5 });
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

### Discord Bot

```typescript
import { SociolodClient } from "sociolod";

const sociolod = new SociolodClient();

// In your slash command handler:
const video = await sociolod.youtube.search.video(query);
const { url: mp3Url } = await sociolod.youtube.download.url(video.url, { format: "mp3" });
await interaction.reply(`🎵 [${video.title}](${mp3Url})`);
```

### Tree-shakeable standalone imports

```typescript
import { ytSearch, ytDownloadUrl } from "sociolod/youtube";
import { spotSearch, spotInfo } from "sociolod/spotify";

const videos = await ytSearch("jazz piano");
const tracks = await spotSearch("coltrane");
```

---

## 📖 Full API Reference

### Configuration

```typescript
const client = new SociolodClient({
  baseUrl: "https://apispec.litype.workers.dev", // Default
  timeout: 15_000,                               // ms, default 15s
  retries: 3,                                    // default 3
  retryDelay: 500,                               // ms base, default 500ms (exponential)
  cache: {
    enabled: true,
    ttl: 60_000,     // ms, default 1 minute
    maxSize: 100,    // entries, default 100
  },
  headers: { "X-My-Header": "value" },           // custom headers
});
```

---

### `client.youtube.search`

| Method | Signature | Description |
|--------|-----------|-------------|
| `search` | `(q, { limit? }) → YTSearchResult[]` | Full search results |
| `video` | `(q) → YTSearchResult` | Single best-match video |
| `random` | `(q) → YTSearchResult` | Random video for query |
| `thumb` | `(q) → { url, videoId, title }` | Thumbnail for top result |
| `links` | `(q, { limit? }) → string[]` | Array of video URLs |
| `titles` | `(q, { limit? }) → string[]` | Array of video titles |
| `channel` | `(q) → YTChannel` | Channel info by name/query |

### `client.youtube.download`

| Method | Signature | Description |
|--------|-----------|-------------|
| `info` | `(url) → YTVideoInfo` | Full video metadata + formats |
| `thumb` | `(url, { quality? }) → { url }` | Thumbnail by quality: `"default" \| "hq" \| "maxres"` |
| `url` | `(url, { format }) → YTDownloadUrlResult` | Direct download URL |
| `stream` | `(url, { format }) → ReadableStream` | Stream media data |
| `download` | `(url, { format, outDir? }) → string \| ReadableStream` | Write to disk (Node) or stream |
| `search` | `(q, { format, limit? }) → YTSearchDownloadResult[]` | Search + download URL in one |

### `client.spotify.search`

| Method | Signature | Description |
|--------|-----------|-------------|
| `search` | `(q, { limit? }) → SpotifyTrack[]` | Full search results |
| `song` | `(q) → SpotifyTrack` | Single best-match track |
| `random` | `(q) → SpotifyTrack` | Random track for query |
| `cover` | `(q) → { url, trackName, artist }` | Album cover for top result |
| `links` | `(q, { limit? }) → string[]` | Array of Spotify track URLs |
| `artist` | `(q) → SpotifyArtist` | Artist metadata |

### `client.spotify.download`

| Method | Signature | Description |
|--------|-----------|-------------|
| `info` | `(url) → SpotifyTrackInfo` | Full track metadata |
| `preview` | `(url) → SpotifyPreviewResult` | 30-second preview URL |
| `match` | `(url) → SpotifyMatchResult` | Best YouTube match for Spotify track |
| `url` | `(url, { format }) → SpotifyDownloadUrlResult` | Direct download URL |
| `stream` | `(url, { format }) → ReadableStream` | Stream media data |
| `download` | `(url, { format, outDir? }) → string \| ReadableStream` | Write to disk (Node) or stream |

---

## 📥 Streaming & Download Examples

### Node.js — stream MP3 to file

```typescript
import { createWriteStream } from "node:fs";
import { SociolodClient } from "sociolod";

const client = new SociolodClient();

const stream = await client.youtube.download.stream(
  "https://youtube.com/watch?v=dQw4w9WgXcQ",
  { format: "mp3" }
);

// Or use the download helper (handles file writing automatically):
const path = await client.youtube.download.download(
  "https://youtube.com/watch?v=dQw4w9WgXcQ",
  { format: "mp3", outDir: "./music" }
);
console.log("Saved:", path);
```

### Browser — blob URL for audio element

```typescript
const stream = await client.spotify.download.stream(
  "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
  { format: "mp3" }
);
const blob = await new Response(stream).blob();
const audioEl = document.querySelector<HTMLAudioElement>("#player")!;
audioEl.src = URL.createObjectURL(blob);
audioEl.play();
```

---

## ⚠️ Error Handling

```typescript
import {
  SociolodClient,
  ValidationError,
  NetworkError,
  HttpError,
  RateLimitError,
} from "sociolod";

try {
  const result = await client.youtube.download.url("invalid-url", { format: "mp3" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Bad input:", error.field, error.message);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.body}`);
  } else if (error instanceof NetworkError) {
    console.error("Network error:", error.message);
  }
}
```

---

## 🔧 Use Cases

### Next.js API Route

```typescript
// app/api/music/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SociolodClient } from "sociolod";

const client = new SociolodClient({ cache: { enabled: true } });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "lofi";
  const results = await client.youtube.search.search(q, { limit: 10 });
  return NextResponse.json(results);
}
```

### React App

```typescript
import { useEffect, useState } from "react";
import { SociolodClient, type YTSearchResult } from "sociolod";

const client = new SociolodClient({ cache: { enabled: true } });

export function useYouTubeSearch(query: string) {
  const [results, setResults] = useState<YTSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    client.youtube.search.search(query, { limit: 10 })
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query]);

  return { results, loading };
}
```

### Cloudflare Worker with caching

See [`examples/cloudflare-worker.ts`](./examples/cloudflare-worker.ts)

### Discord bot with slash commands

See [`examples/discord-bot.ts`](./examples/discord-bot.ts)

### Telegram bot

See [`examples/telegram-bot.ts`](./examples/telegram-bot.ts)

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

[MIT](./LICENSE) © YOUR_NAME
