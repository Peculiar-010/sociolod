import { buildUrl, fetchJson } from "../http.js";
import { validateQuery, validateLimit } from "../validate.js";
import type { LRUCache } from "../cache.js";
import type {
  YTSearchResult,
  YTChannel,
  YTSearchOptions,
  YTLinksOptions,
  YTTitlesOptions,
  RequestOptions,
} from "../types/index.js";

export class YouTubeSearchClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultOptions: RequestOptions,
    private readonly cache: LRUCache,
  ) {}

  /**
   * Search YouTube for videos matching a query.
   *
   * @param q - Search query string
   * @param options - Optional search options
   * @param options.limit - Number of results (1–50). Default: 10
   * @returns Array of YouTube search results
   * @throws {ValidationError} If query is empty or limit is out of range
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const results = await client.youtube.search.search("lofi hip hop", { limit: 5 });
   * console.log(results[0].title);
   * ```
   */
  async search(q: string, options: YTSearchOptions = {}): Promise<YTSearchResult[]> {
    validateQuery(q);
    if (options.limit !== undefined) validateLimit(options.limit);

    const cacheKey = `yt:search:${q}:${options.limit ?? 10}`;
    const cached = this.cache.get<YTSearchResult[]>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/ytsearch", { q, limit: options.limit });
    const result = await fetchJson<YTSearchResult[]>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a single YouTube video result by search query.
   *
   * @param q - Search query string
   * @returns A single YouTube video result
   * @throws {ValidationError} If query is empty
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const video = await client.youtube.search.video("never gonna give you up");
   * console.log(video.url);
   * ```
   */
  async video(q: string): Promise<YTSearchResult> {
    validateQuery(q);

    const cacheKey = `yt:video:${q}`;
    const cached = this.cache.get<YTSearchResult>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/ytsearch/video", { q });
    const result = await fetchJson<YTSearchResult>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a random YouTube video result for a query.
   *
   * @param q - Search query string
   * @returns A random YouTube video result
   * @throws {ValidationError} If query is empty
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const random = await client.youtube.search.random("jazz");
   * ```
   */
  async random(q: string): Promise<YTSearchResult> {
    validateQuery(q);
    const url = buildUrl(this.baseUrl, "/ytsearch/random", { q });
    return fetchJson<YTSearchResult>(url, this.defaultOptions);
  }

  /**
   * Fetch the best thumbnail URL for a YouTube search query.
   *
   * @param q - Search query string
   * @returns Object containing the thumbnail URL for the top result
   * @throws {ValidationError} If query is empty
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const thumb = await client.youtube.search.thumb("coldplay yellow");
   * console.log(thumb.url);
   * ```
   */
  async thumb(q: string): Promise<{ url: string; videoId: string; title: string }> {
    validateQuery(q);

    const cacheKey = `yt:thumb:${q}`;
    const cached = this.cache.get<{ url: string; videoId: string; title: string }>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/ytsearch/thumb", { q });
    const result = await fetchJson<{ url: string; videoId: string; title: string }>(
      url,
      this.defaultOptions,
    );
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a list of YouTube video URLs for a query.
   *
   * @param q - Search query string
   * @param options - Optional options
   * @param options.limit - Number of links (1–50). Default: 10
   * @returns Array of YouTube video URLs
   * @throws {ValidationError} If query is empty or limit is out of range
   * @example
   * ```ts
   * const links = await client.youtube.search.links("beethoven symphony", { limit: 5 });
   * ```
   */
  async links(q: string, options: YTLinksOptions = {}): Promise<string[]> {
    validateQuery(q);
    if (options.limit !== undefined) validateLimit(options.limit);

    const cacheKey = `yt:links:${q}:${options.limit ?? 10}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/ytsearch/links", { q, limit: options.limit });
    const result = await fetchJson<string[]>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a list of YouTube video titles for a query.
   *
   * @param q - Search query string
   * @param options - Optional options
   * @param options.limit - Number of titles (1–50). Default: 10
   * @returns Array of video title strings
   * @throws {ValidationError} If query is empty or limit is out of range
   * @example
   * ```ts
   * const titles = await client.youtube.search.titles("drake", { limit: 3 });
   * ```
   */
  async titles(q: string, options: YTTitlesOptions = {}): Promise<string[]> {
    validateQuery(q);
    if (options.limit !== undefined) validateLimit(options.limit);

    const cacheKey = `yt:titles:${q}:${options.limit ?? 10}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/ytsearch/titles", { q, limit: options.limit });
    const result = await fetchJson<string[]>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch YouTube channel information by search query.
   *
   * @param q - Channel name or search query
   * @returns Channel metadata
   * @throws {ValidationError} If query is empty
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const channel = await client.youtube.search.channel("MrBeast");
   * console.log(channel.subscriberCount);
   * ```
   */
  async channel(q: string): Promise<YTChannel> {
    validateQuery(q);

    const cacheKey = `yt:channel:${q}`;
    const cached = this.cache.get<YTChannel>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/ytsearch/channel", { q });
    const result = await fetchJson<YTChannel>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }
}
