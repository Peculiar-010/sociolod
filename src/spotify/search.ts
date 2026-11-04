import { buildUrl, fetchJson } from "../http.js";
import { validateQuery, validateLimit } from "../validate.js";
import type { LRUCache } from "../cache.js";
import type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifySearchOptions,
  SpotifyLinksOptions,
  RequestOptions,
} from "../types/index.js";

export class SpotifySearchClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultOptions: RequestOptions,
    private readonly cache: LRUCache,
  ) {}

  /**
   * Search Spotify for tracks matching a query.
   *
   * @param q - Search query string
   * @param options - Optional search options
   * @param options.limit - Number of results (1–50). Default: 10
   * @returns Array of Spotify track results
   * @throws {ValidationError} If query is empty or limit is out of range
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const tracks = await client.spotify.search.search("blinding lights", { limit: 5 });
   * console.log(tracks[0].name);
   * ```
   */
  async search(q: string, options: SpotifySearchOptions = {}): Promise<SpotifyTrack[]> {
    validateQuery(q);
    if (options.limit !== undefined) validateLimit(options.limit);

    const cacheKey = `sp:search:${q}:${options.limit ?? 10}`;
    const cached = this.cache.get<SpotifyTrack[]>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/spotsearch", { q, limit: options.limit });
    const result = await fetchJson<SpotifyTrack[]>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a single Spotify song result by search query.
   *
   * @param q - Search query string
   * @returns A single Spotify track
   * @throws {ValidationError} If query is empty
   * @example
   * ```ts
   * const song = await client.spotify.search.song("shape of you");
   * console.log(song.artists[0].name);
   * ```
   */
  async song(q: string): Promise<SpotifyTrack> {
    validateQuery(q);

    const cacheKey = `sp:song:${q}`;
    const cached = this.cache.get<SpotifyTrack>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/spotsearch/song", { q });
    const result = await fetchJson<SpotifyTrack>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a random Spotify track for a query.
   *
   * @param q - Search query string
   * @returns A random Spotify track
   * @throws {ValidationError} If query is empty
   * @example
   * ```ts
   * const track = await client.spotify.search.random("pop");
   * ```
   */
  async random(q: string): Promise<SpotifyTrack> {
    validateQuery(q);
    const url = buildUrl(this.baseUrl, "/spotsearch/random", { q });
    return fetchJson<SpotifyTrack>(url, this.defaultOptions);
  }

  /**
   * Fetch the album cover URL for a Spotify search query.
   *
   * @param q - Search query string
   * @returns Object containing the album cover URL
   * @throws {ValidationError} If query is empty
   * @example
   * ```ts
   * const cover = await client.spotify.search.cover("after hours the weeknd");
   * console.log(cover.url);
   * ```
   */
  async cover(q: string): Promise<{ url: string; trackName: string; artist: string }> {
    validateQuery(q);

    const cacheKey = `sp:cover:${q}`;
    const cached = this.cache.get<{ url: string; trackName: string; artist: string }>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/spotsearch/cover", { q });
    const result = await fetchJson<{ url: string; trackName: string; artist: string }>(
      url,
      this.defaultOptions,
    );
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a list of Spotify track URLs for a query.
   *
   * @param q - Search query string
   * @param options - Optional options
   * @param options.limit - Number of links (1–50). Default: 10
   * @returns Array of Spotify track URLs
   * @throws {ValidationError} If query is empty or limit out of range
   * @example
   * ```ts
   * const links = await client.spotify.search.links("taylor swift", { limit: 5 });
   * ```
   */
  async links(q: string, options: SpotifyLinksOptions = {}): Promise<string[]> {
    validateQuery(q);
    if (options.limit !== undefined) validateLimit(options.limit);

    const cacheKey = `sp:links:${q}:${options.limit ?? 10}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/spotsearch/links", { q, limit: options.limit });
    const result = await fetchJson<string[]>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch Spotify artist information by search query.
   *
   * @param q - Artist name or search query
   * @returns Artist metadata including followers, genres, images
   * @throws {ValidationError} If query is empty
   * @example
   * ```ts
   * const artist = await client.spotify.search.artist("Daft Punk");
   * console.log(artist.followers);
   * ```
   */
  async artist(q: string): Promise<SpotifyArtist> {
    validateQuery(q);

    const cacheKey = `sp:artist:${q}`;
    const cached = this.cache.get<SpotifyArtist>(cacheKey);
    if (cached) return cached;

    const url = buildUrl(this.baseUrl, "/spotsearch/artist", { q });
    const result = await fetchJson<SpotifyArtist>(url, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }
}
