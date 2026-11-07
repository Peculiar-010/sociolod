export { SociolodClient } from "./client.js";

export {
  SociolodError,
  NetworkError,
  HttpError,
  ValidationError,
  RateLimitError,
} from "./errors.js";

export type {
  SociolodConfig,
  CacheConfig,
  YTSearchResult,
  YTThumbnailSet,
  YTThumbnail,
  YTChannel,
  YTSearchOptions,
  YTLinksOptions,
  YTTitlesOptions,
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
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyImage,
  SpotifySearchOptions,
  SpotifyLinksOptions,
  SpotifyFormat,
  SpotifyTrackInfo,
  SpotifyPreviewResult,
  SpotifyMatchResult,
  SpotifyDownloadUrlResult,
  SpotifyUrlOptions,
  SpotifyStreamOptions,
  SpotifyDownloadOptions,
} from "./types/index.js";

export { YouTubeSearchClient } from "./youtube/search.js";
export { YouTubeDownloadClient } from "./youtube/download.js";
export { SpotifySearchClient } from "./spotify/search.js";
export { SpotifyDownloadClient } from "./spotify/download.js";

import { SociolodClient } from "./client.js";

export const sociolod = new SociolodClient();
