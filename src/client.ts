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

  constructor(config: SociolodConfig = {}) {
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const timeout = config.timeout ?? DEFAULT_TIMEOUT;
    const retries = config.retries ?? DEFAULT_RETRIES;
    const retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
    const headers = config.headers ?? {};

    this.cache = config.cache != null && config.cache.enabled
      ? new LRUCache(config.cache)
      : noopCache;

    const requestOptions: RequestOptions = {
      timeout,
      retries,
      retryDelay,
      headers,
    };

    this.youtube = {
      search: new YouTubeSearchClient(baseUrl, requestOptions, this.cache),
      download: new YouTubeDownloadClient(baseUrl, requestOptions, this.cache),
    };

    this.spotify = {
      search: new SpotifySearchClient(baseUrl, requestOptions, this.cache),
      download: new SpotifyDownloadClient(baseUrl, requestOptions, this.cache),
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}
