# Contributing to sociolod

Thank you for your interest in contributing! This document explains how to get started.

## Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Build**:
   ```bash
   pnpm build
   ```
4. **Test**:
   ```bash
   pnpm test
   pnpm test:coverage
   ```
5. **Lint**:
   ```bash
   pnpm lint
   pnpm typecheck
   ```

## Project Structure

```
src/
  index.ts          # Public barrel export
  client.ts         # SociolodClient class
  http.ts           # Fetch wrapper (timeout, retry, backoff)
  errors.ts         # Error classes
  cache.ts          # LRU cache
  validate.ts       # Input validation
  types/index.ts    # All TypeScript types
  youtube/          # YouTube namespace
  spotify/          # Spotify namespace
tests/
  unit/             # Unit tests (mocked fetch)
  integration/      # Integration tests (live API, opt-in)
examples/           # Runnable example files
```

## Making Changes

- **New features** should include tests and JSDoc
- **Bug fixes** should include a test that reproduces the issue
- **All PRs** must pass `pnpm lint`, `pnpm typecheck`, and `pnpm test`
- **Coverage** must stay at ≥90%

## Releasing

Releases are managed with [changesets](https://github.com/changesets/changesets):

1. Create a changeset: `pnpm changeset`
2. Version bump: `pnpm version`
3. Publish: GitHub Actions handles `npm publish` on `v*` tags

## npm Publishing Steps (manual, from the web)

1. Push changes to `main` on GitHub
2. Create a new tag: `git tag v1.x.x && git push --tags`
3. The `publish.yml` workflow publishes to npm automatically

## Submitting to AI Coding Indexes

### Context7 (https://context7.com)
Submit the GitHub repo URL to Context7 so it indexes the README and source.

### Google Search Console
After `npm publish`, submit `https://www.npmjs.com/package/sociolod` to Google Search Console.

## Launch Day Social Media

Copy and paste for launch announcements:

**Twitter/X:**
> 🚀 Just released sociolod — a universal TypeScript SDK for YouTube & Spotify search, metadata, and MP3 downloads. Works in Node.js, browsers, Cloudflare Workers, Discord bots, and more.
> npm install sociolod
> GitHub: https://github.com/Peculiar-010/sociolod
> #TypeScript #npm #youtube #spotify #opensource

**Reddit (r/typescript, r/node):**
> I built sociolod — a fully typed SDK wrapping YouTube & Spotify search and download APIs. It supports Node 18+, browsers, Cloudflare Workers, and bots. Zero required dependencies, ESM+CJS, tree-shakeable.

**Mastodon:**
> New npm package: sociolod — TypeScript SDK for YouTube & Spotify search and audio downloads. Works everywhere: Node.js, browsers, edge runtimes, Discord/Telegram bots.
> #TypeScript #JavaScript #OpenSource
