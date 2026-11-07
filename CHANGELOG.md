# Changelog

All notable changes to this project will be documented in this file.

## 1.0.1 (2026-11-07)

### Changed
- Improved README search discoverability with clearer YouTube and Spotify SDK descriptions, direct project links, and FAQs.
- Refined npm package description and keywords for relevant TypeScript, Node.js, YouTube, Spotify, and media SDK searches.


This file is maintained by [changesets](https://github.com/changesets/changesets).

## 1.0.0 (2024)

### Major Release 🎉

Initial public release of `sociolod`.

#### Features
- `client.youtube.search` — 7 endpoints: search, video, random, thumb, links, titles, channel
- `client.youtube.download` — 6 endpoints: info, thumb, url, stream, download, search
- `client.spotify.search` — 6 endpoints: search, song, random, cover, links, artist
- `client.spotify.download` — 6 endpoints: info, preview, match, url, stream, download
- Dual ESM + CJS build via `tsup`
- 100% TypeScript strict mode with JSDoc on every public method
- Exponential backoff retry with configurable attempts and base delay
- Configurable timeout via AbortController
- RateLimitError with Retry-After header parsing
- Optional in-memory LRU cache with TTL and max-size
- Input validation throwing typed ValidationError before any network call
- Node.js disk download with dynamic `node:fs` import (tree-safe)
- Sub-path exports: `sociolod/youtube`, `sociolod/spotify`
- `llms.txt` and `llms-full.txt` for AI discoverability
- Full example suite: Node, browser, Discord bot, Telegram bot, Cloudflare Worker, Next.js
