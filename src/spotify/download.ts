import { buildUrl, fetchJson, fetchStream } from "../http.js";
import { validateSpotifyUrl, validateSpotifyFormat } from "../validate.js";
import type { LRUCache } from "../cache.js";
import type {
  SpotifyTrackInfo,
  SpotifyPreviewResult,
  SpotifyMatchResult,
  SpotifyDownloadUrlResult,
  SpotifyUrlOptions,
  SpotifyStreamOptions,
  SpotifyDownloadOptions,
  RequestOptions,
} from "../types/index.js";

export class SpotifyDownloadClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultOptions: RequestOptions,
    private readonly cache: LRUCache,
  ) {}

  /**
   * Fetch full metadata / info for a Spotify track URL.
   *
   * @param url - Spotify track URL (https://open.spotify.com/track/...)
   * @returns Detailed track metadata
   * @throws {ValidationError} If URL is not a valid Spotify URL
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const info = await client.spotify.download.info(
   *   "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
   * );
   * console.log(info.name, info.artists[0].name);
   * ```
   */
  async info(url: string): Promise<SpotifyTrackInfo> {
    validateSpotifyUrl(url);

    const cacheKey = `sp:dl:info:${url}`;
    const cached = this.cache.get<SpotifyTrackInfo>(cacheKey);
    if (cached) return cached;

    const apiUrl = buildUrl(this.baseUrl, "/spdl/info", { url });
    const result = await fetchJson<SpotifyTrackInfo>(apiUrl, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch the 30-second Spotify preview URL for a track.
   *
   * @param url - Spotify track URL
   * @returns Preview audio URL and metadata
   * @throws {ValidationError} If URL is not a valid Spotify URL
   * @example
   * ```ts
   * const preview = await client.spotify.download.preview(
   *   "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
   * );
   * console.log(preview.url); // 30s preview MP3
   * ```
   */
  async preview(url: string): Promise<SpotifyPreviewResult> {
    validateSpotifyUrl(url);

    const cacheKey = `sp:dl:preview:${url}`;
    const cached = this.cache.get<SpotifyPreviewResult>(cacheKey);
    if (cached) return cached;

    const apiUrl = buildUrl(this.baseUrl, "/spdl/preview", { url });
    const result = await fetchJson<SpotifyPreviewResult>(apiUrl, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Match a Spotify track to its best YouTube equivalent.
   *
   * @param url - Spotify track URL
   * @returns Matched YouTube video with confidence score
   * @throws {ValidationError} If URL is not a valid Spotify URL
   * @example
   * ```ts
   * const match = await client.spotify.download.match(
   *   "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
   * );
   * console.log(match.youtubeMatch.url, match.youtubeMatch.confidence);
   * ```
   */
  async match(url: string): Promise<SpotifyMatchResult> {
    validateSpotifyUrl(url);

    const cacheKey = `sp:dl:match:${url}`;
    const cached = this.cache.get<SpotifyMatchResult>(cacheKey);
    if (cached) return cached;

    const apiUrl = buildUrl(this.baseUrl, "/spdl/match", { url });
    const result = await fetchJson<SpotifyMatchResult>(apiUrl, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Get a direct download URL for a Spotify track.
   *
   * @param url - Spotify track URL
   * @param options - Download options
   * @param options.format - "mp3" or "mp4"
   * @returns Object with the direct download URL and metadata
   * @throws {ValidationError} If URL or format is invalid
   * @example
   * ```ts
   * const { url: dlUrl } = await client.spotify.download.url(
   *   "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
   *   { format: "mp3" }
   * );
   * ```
   */
  async url(url: string, options: SpotifyUrlOptions): Promise<SpotifyDownloadUrlResult> {
    validateSpotifyUrl(url);
    validateSpotifyFormat(options.format);

    const cacheKey = `sp:dl:url:${url}:${options.format}`;
    const cached = this.cache.get<SpotifyDownloadUrlResult>(cacheKey);
    if (cached) return cached;

    const apiUrl = buildUrl(this.baseUrl, "/spdl/url", { url, format: options.format });
    const result = await fetchJson<SpotifyDownloadUrlResult>(apiUrl, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Stream a Spotify track as a ReadableStream.
   * Works in Node.js, browsers, and edge runtimes.
   *
   * @param url - Spotify track URL
   * @param options - Stream options
   * @param options.format - "mp3" or "mp4"
   * @returns A ReadableStream of the media data
   * @throws {ValidationError} If URL or format is invalid
   * @example
   * ```ts
   * // Browser: create a blob URL
   * const stream = await client.spotify.download.stream(
   *   "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
   *   { format: "mp3" }
   * );
   * const blob = await new Response(stream).blob();
   * const audioUrl = URL.createObjectURL(blob);
   * ```
   */
  async stream(url: string, options: SpotifyStreamOptions): Promise<ReadableStream<Uint8Array>> {
    validateSpotifyUrl(url);
    validateSpotifyFormat(options.format);

    const apiUrl = buildUrl(this.baseUrl, "/spdl/stream", { url, format: options.format });
    const response = await fetchStream(apiUrl, this.defaultOptions);

    if (!response.body) {
      throw new Error("Response body is null — streaming not supported in this environment");
    }
    return response.body;
  }

  /**
   * Download a Spotify track to disk (Node.js only).
   * Falls back to returning a ReadableStream in browser/edge environments.
   *
   * @param url - Spotify track URL
   * @param options - Download options
   * @param options.format - "mp3" or "mp4"
   * @param options.outDir - Output directory (Node.js only). Defaults to current working directory
   * @returns File path (Node.js) or ReadableStream (browser/edge)
   * @throws {ValidationError} If URL or format is invalid
   * @example
   * ```ts
   * const filePath = await client.spotify.download.download(
   *   "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
   *   { format: "mp3", outDir: "./downloads" }
   * );
   * ```
   */
  async download(
    url: string,
    options: SpotifyDownloadOptions,
  ): Promise<string | ReadableStream<Uint8Array>> {
    validateSpotifyUrl(url);
    validateSpotifyFormat(options.format);

    const apiUrl = buildUrl(this.baseUrl, "/spdl/download", { url, format: options.format });
    const response = await fetchStream(apiUrl, this.defaultOptions);

    if (!response.body) {
      throw new Error("Response body is null");
    }

    if (typeof process !== "undefined" && process.versions?.node) {
      return writeStreamToFile(response, options.outDir ?? ".");
    }

    return response.body;
  }
}

/**
 * Writes a streaming Response body to a file on disk (Node.js only).
 */
async function writeStreamToFile(response: Response, outDir: string): Promise<string> {
  const { createWriteStream, mkdirSync } = await import("node:fs");
  const path = await import("node:path");

  const disposition = response.headers.get("content-disposition") ?? "";
  const fileNameMatch = /filename="?([^";\n]+)"?/.exec(disposition);
  const fileName = fileNameMatch?.[1] ?? `spotify-${Date.now()}.mp3`;

  mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, fileName);

  if (!response.body) throw new Error("Response body is null");

  await new Promise<void>((resolve, reject) => {
    const writer = createWriteStream(filePath);
    const reader = response.body!.getReader();

    const pump = (): void => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            writer.end();
            return;
          }
          writer.write(Buffer.from(value), (err) => {
            if (err) reject(err);
            else pump();
          });
        })
        .catch(reject);
    };

    writer.on("finish", resolve);
    writer.on("error", reject);
    pump();
  });

  return filePath;
}
