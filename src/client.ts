import { LRUCache, noopCache } from "./cache.js";
import { YouTubeSearchClient } from "./youtube/search.js";
import { YouTubeDownloadClient } from "./youtube/download.js";
import { SpotifySearchClient } from "./spotify/search.js";
import { SpotifyDownloadClient } from "./spotify/download.js";
import type { SociolodConfig, RequestOptions } from "./types/index.js";

const DEFAULT_BASE_URL = "https://apispec.litype.workers.dev";
const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 500;

/**
 * The main SociolodClient class.
 *
 * Provides namespaced access to all YouTube and Spotify API endpoints:
 * - `client.youtube.search.*` — YouTube search methods
 * - `client.youtube.download.*` — YouTube download/stream methods
 * - `client.spotify.search.*` — Spotify search methods
 * - `client.spotify.download.*` — Spotify download/stream methods
 *
 * @example
 * ```ts
 * import { SociolodClient } from "sociolod";
 *
 * const client = new SociolodClient({
 *   timeout: 10_000,
 *   retries: 2,
 *   cache: { enabled: true, ttl: 30_000 },
 * });
 *
 * // YouTube search
 * const videos = await client.youtube.search.search("lofi hip hop", { limit: 5 });
 *
 * // Spotify search
 * const tracks = await client.spotify.search.search("blinding lights");
 *
 * // Download a track
 * const { url } = await client.youtube.download.url(
 *   "https://youtube.com/watch?v=dQw4w9WgXcQ",
 *   { format: "mp3" }
 * );
 * ```
 */
export class SociolodClient {
  public readonly youtube: {
    search: YouTubeSearchClient;
    download: YouTubeDownloadClient;
  };

  public readonly spotify: {
    search: SpotifySearchClient;
    download: SpotifyDownloadClient;
  };

  private readonly cache: LRUCache;
  private readonly config: Required<
    Omit<SociolodConfig, "cache" | "headers">
  > & { headers: Record<string, string> };

  constructor(config: SociolodConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      retries: config.retries ?? DEFAULT_RETRIES,
      retryDelay: config.retryDelay ?? DEFAULT_RETRY_DELAY,
      headers: config.headers ?? {},
    };

    this.cache = config.cache?.enabled
      ? new LRUCache(config.cache)
      : noopCache;

    const requestOptions: RequestOptions = {
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
      headers: this.config.headers,
    };

    this.youtube = {
      search: new YouTubeSearchClient(this.config.baseUrl, requestOptions, this.cache),
      download: new YouTubeDownloadClient(this.config.baseUrl, requestOptions, this.cache),
    };

    this.spotify = {
      search: new SpotifySearchClient(this.config.baseUrl, requestOptions, this.cache),
      download: new SpotifyDownloadClient(this.config.baseUrl, requestOptions, this.cache),
    };
  }

  /**
   * Clear the in-memory cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Returns the current client configuration (read-only copy).
   */
  getConfig(): Readonly<typeof this.config> {
    return { ...this.config };
  }
}
