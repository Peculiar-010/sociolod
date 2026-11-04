// ─── Client Config ───────────────────────────────────────────────────────────

export interface SociolodConfig {
  /** Base URL of the LiteType API. Default: https://apispec.litype.workers.dev */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 15000 */
  timeout?: number;
  /** Maximum retry attempts on 5xx / network errors. Default: 3 */
  retries?: number;
  /** Base delay (ms) for exponential backoff. Default: 500 */
  retryDelay?: number;
  /** Optional in-memory cache config */
  cache?: CacheConfig;
  /** Custom headers to include in every request */
  headers?: Record<string, string>;
}

export interface CacheConfig {
  /** Enable caching. Default: false */
  enabled: boolean;
  /** TTL in milliseconds. Default: 60000 (1 min) */
  ttl?: number;
  /** Max number of cached entries. Default: 100 */
  maxSize?: number;
}

// ─── YouTube Search Types ─────────────────────────────────────────────────────

export interface YTSearchResult {
  videoId: string;
  title: string;
  description: string;
  thumbnails: YTThumbnailSet;
  channel: YTChannel;
  duration: string;
  viewCount: string;
  publishedAt: string;
  url: string;
}

export interface YTThumbnailSet {
  default: YTThumbnail;
  medium?: YTThumbnail;
  high?: YTThumbnail;
  maxres?: YTThumbnail;
}

export interface YTThumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface YTChannel {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  subscriberCount?: string;
}

export interface YTSearchOptions {
  /** Number of results to return. Default: 10 */
  limit?: number;
}

export interface YTLinksOptions {
  /** Number of links to return. Default: 10 */
  limit?: number;
}

export interface YTTitlesOptions {
  /** Number of titles to return. Default: 10 */
  limit?: number;
}

// ─── YouTube Download Types ───────────────────────────────────────────────────

export type YTFormat = "mp3" | "mp4";
export type YTThumbQuality = "default" | "hq" | "maxres";

export interface YTVideoInfo {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  durationFormatted: string;
  thumbnails: YTThumbnailSet;
  channel: YTChannel;
  viewCount: string;
  likeCount?: string;
  publishedAt: string;
  formats: YTFormatInfo[];
}

export interface YTFormatInfo {
  itag: number;
  mimeType: string;
  quality: string;
  bitrate?: number;
  audioBitrate?: number;
  width?: number;
  height?: number;
  fps?: number;
  url: string;
}

export interface YTThumbOptions {
  /** Thumbnail quality. Default: "hq" */
  quality?: YTThumbQuality;
}

export interface YTUrlOptions {
  /** Media format. */
  format: YTFormat;
}

export interface YTStreamOptions {
  /** Media format. */
  format: YTFormat;
}

export interface YTDownloadOptions {
  /** Media format. */
  format: YTFormat;
  /** Output directory (Node.js only). Default: current working directory */
  outDir?: string;
}

export interface YTSearchDownloadOptions {
  /** Media format. */
  format: YTFormat;
  /** Number of results. Default: 10 */
  limit?: number;
}

export interface YTDownloadUrlResult {
  url: string;
  format: YTFormat;
  title: string;
  duration?: number;
  filesize?: number;
  mimeType?: string;
}

export interface YTSearchDownloadResult {
  videoId: string;
  title: string;
  url: string;
  downloadUrl: string;
  format: YTFormat;
  duration?: string;
}

// ─── Spotify Search Types ─────────────────────────────────────────────────────

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  durationFormatted: string;
  url: string;
  previewUrl: string | null;
  popularity?: number;
  explicit?: boolean;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  url: string;
  followers?: number;
  genres?: string[];
  images?: SpotifyImage[];
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  url: string;
  images: SpotifyImage[];
  releaseDate: string;
  totalTracks?: number;
}

export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifySearchOptions {
  /** Number of results to return. Default: 10 */
  limit?: number;
}

export interface SpotifyLinksOptions {
  /** Number of links to return. Default: 10 */
  limit?: number;
}

// ─── Spotify Download Types ───────────────────────────────────────────────────

export type SpotifyFormat = "mp3" | "mp4";

export interface SpotifyTrackInfo {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  durationFormatted: string;
  url: string;
  isrc?: string;
  previewUrl: string | null;
}

export interface SpotifyPreviewResult {
  url: string;
  trackId: string;
  trackName: string;
  durationMs: number;
}

export interface SpotifyMatchResult {
  spotifyTrack: SpotifyTrackInfo;
  youtubeMatch: {
    videoId: string;
    title: string;
    url: string;
    duration: string;
    confidence: number;
  };
}

export interface SpotifyDownloadUrlResult {
  url: string;
  format: SpotifyFormat;
  title: string;
  artist: string;
  duration?: number;
  filesize?: number;
  mimeType?: string;
}

export interface SpotifyUrlOptions {
  /** Media format. */
  format: SpotifyFormat;
}

export interface SpotifyStreamOptions {
  /** Media format. */
  format: SpotifyFormat;
}

export interface SpotifyDownloadOptions {
  /** Media format. */
  format: SpotifyFormat;
  /** Output directory (Node.js only). Default: current working directory */
  outDir?: string;
}

// ─── HTTP Internal Types ──────────────────────────────────────────────────────

export interface RequestOptions {
  method?: "GET" | "POST";
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  stream?: boolean;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
