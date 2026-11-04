export { YouTubeSearchClient } from "./search.js";
export { YouTubeDownloadClient } from "./download.js";

// ─── Standalone tree-shakeable functions ─────────────────────────────────────
// These let users import only what they need: import { ytSearch } from 'sociolod/youtube'

import { SociolodClient } from "../client.js";

const _defaultClient = new SociolodClient();

/** Standalone: search YouTube */
export const ytSearch = _defaultClient.youtube.search.search.bind(
  _defaultClient.youtube.search,
);

/** Standalone: get a single YouTube video result */
export const ytVideo = _defaultClient.youtube.search.video.bind(
  _defaultClient.youtube.search,
);

/** Standalone: get a random YouTube video result */
export const ytRandom = _defaultClient.youtube.search.random.bind(
  _defaultClient.youtube.search,
);

/** Standalone: get YouTube thumbnail for a search query */
export const ytThumb = _defaultClient.youtube.search.thumb.bind(
  _defaultClient.youtube.search,
);

/** Standalone: get YouTube video links */
export const ytLinks = _defaultClient.youtube.search.links.bind(
  _defaultClient.youtube.search,
);

/** Standalone: get YouTube video titles */
export const ytTitles = _defaultClient.youtube.search.titles.bind(
  _defaultClient.youtube.search,
);

/** Standalone: get YouTube channel info */
export const ytChannel = _defaultClient.youtube.search.channel.bind(
  _defaultClient.youtube.search,
);

/** Standalone: get YouTube video info */
export const ytInfo = _defaultClient.youtube.download.info.bind(
  _defaultClient.youtube.download,
);

/** Standalone: get YouTube download URL */
export const ytDownloadUrl = _defaultClient.youtube.download.url.bind(
  _defaultClient.youtube.download,
);

/** Standalone: stream YouTube media */
export const ytStream = _defaultClient.youtube.download.stream.bind(
  _defaultClient.youtube.download,
);

/** Standalone: download YouTube media to disk */
export const ytDownload = _defaultClient.youtube.download.download.bind(
  _defaultClient.youtube.download,
);
