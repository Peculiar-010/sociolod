// ─── Main Client ─────────────────────────────────────────────────────────────
export { SociolodClient } from "./client.js";

// ─── Errors ───────────────────────────────────────────────────────────────────
export {
  SociolodError,
  NetworkError,
  HttpError,
  ValidationError,
  RateLimitError,
} from "./errors.js";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  // Config
  SociolodConfig,
  CacheConfig,
  // YouTube Search
  YTSearchResult,
  YTThumbnailSet,
  YTThumbnail,
  YTChannel,
  YTSearchOptions,
  YTLinksOptions,
  YTTitlesOptions,
  // YouTube Download
  YTFormat,
  YTThumbQuality,
  YTVideoInfo,
  YTFormatInfo,
  YTThumbOptions,
  YTUrlOptions,
  YTStreamOptions,
  YTDownloadOptions,
  YTSearchDownloadOptions,
  YTDownloadUrlResult,
  YTSearchDownloadResult,
  // Spotify Search
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyImage,
  SpotifySearchOptions,
  SpotifyLinksOptions,
  // Spotify Download
  SpotifyFormat,
  SpotifyTrackInfo,
  SpotifyPreviewResult,
  SpotifyMatchResult,
  SpotifyDownloadUrlResult,
  SpotifyUrlOptions,
  SpotifyStreamOptions,
  SpotifyDownloadOptions,
} from "./types/index.js";

// ─── Namespace clients (for advanced use) ────────────────────────────────────
export { YouTubeSearchClient } from "./youtube/search.js";
export { YouTubeDownloadClient } from "./youtube/download.js";
export { SpotifySearchClient } from "./spotify/search.js";
export { SpotifyDownloadClient } from "./spotify/download.js";

// ─── Convenience: default client instance ────────────────────────────────────
import { SociolodClient } from "./client.js";

/**
 * A ready-to-use default SociolodClient instance with default configuration.
 *
 * @example
 * ```ts
 * import { sociolod } from "sociolod";
 * const videos = await sociolod.youtube.search.search("lofi");
 * ```
 */
export const sociolod = new SociolodClient();
