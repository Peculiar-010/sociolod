import { LRUCache, noopCache } from "./cache.js";
import { YouTubeSearchClient } from "./youtube/search.js";
import { YouTubeDownloadClient } from "./youtube/download.js";
import { SpotifySearchClient } from "./spotify/search.js";
import { SpotifyDownloadClient } from "./spotify/download.js";
import type { SociolodConfig, RequestOptions } from "./types/index.js";

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
    const baseUrl = config.baseUrl ?? "https://apispec.litype.workers.dev";
    const timeout = config.timeout ?? 15000;
    const retries = config.retries ?? 3;
    const retryDelay = config.retryDelay ?? 500;
    const headers = config.headers ?? {};

    if (config.cache != null && config.cache.enabled === true) {
      this.cache = new LRUCache(config.cache);
    } else {
      this.cache = noopCache;
    }

    const opts: RequestOptions = { timeout, retries, retryDelay, headers };

    this.youtube = {
      search: new YouTubeSearchClient(baseUrl, opts, this.cache),
      download: new YouTubeDownloadClient(baseUrl, opts, this.cache),
    };
    this.spotify = {
      search: new SpotifySearchClient(baseUrl, opts, this.cache),
      download: new SpotifyDownloadClient(baseUrl, opts, this.cache),
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}
