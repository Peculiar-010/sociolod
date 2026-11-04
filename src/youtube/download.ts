import { buildUrl, fetchJson, fetchStream } from "../http.js";
import {
  validateYouTubeUrl,
  validateYTFormat,
  validateThumbQuality,
  validateQuery,
  validateLimit,
} from "../validate.js";
import type { LRUCache } from "../cache.js";
import type {
  YTVideoInfo,
  YTDownloadUrlResult,
  YTSearchDownloadResult,
  YTThumbOptions,
  YTUrlOptions,
  YTStreamOptions,
  YTDownloadOptions,
  YTSearchDownloadOptions,
  RequestOptions,
} from "../types/index.js";

export class YouTubeDownloadClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultOptions: RequestOptions,
    private readonly cache: LRUCache,
  ) {}

  /**
   * Fetch full metadata / info for a YouTube video URL.
   *
   * @param url - YouTube video URL (e.g. https://youtube.com/watch?v=...)
   * @returns Detailed video metadata including formats
   * @throws {ValidationError} If URL is not a valid YouTube URL
   * @throws {NetworkError} On connection / timeout failure
   * @throws {HttpError} On non-2xx API response
   * @example
   * ```ts
   * const info = await client.youtube.download.info("https://youtube.com/watch?v=dQw4w9WgXcQ");
   * console.log(info.title, info.durationFormatted);
   * ```
   */
  async info(url: string): Promise<YTVideoInfo> {
    validateYouTubeUrl(url);

    const cacheKey = `yt:dl:info:${url}`;
    const cached = this.cache.get<YTVideoInfo>(cacheKey);
    if (cached) return cached;

    const apiUrl = buildUrl(this.baseUrl, "/ytdl/info", { url });
    const result = await fetchJson<YTVideoInfo>(apiUrl, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch a thumbnail image URL for a YouTube video.
   *
   * @param url - YouTube video URL
   * @param options - Thumbnail options
   * @param options.quality - Thumbnail quality: "default" | "hq" | "maxres". Default: "hq"
   * @returns Object with the thumbnail URL
   * @throws {ValidationError} If URL or quality is invalid
   * @example
   * ```ts
   * const thumb = await client.youtube.download.thumb(
   *   "https://youtube.com/watch?v=dQw4w9WgXcQ",
   *   { quality: "maxres" }
   * );
   * ```
   */
  async thumb(url: string, options: YTThumbOptions = {}): Promise<{ url: string }> {
    validateYouTubeUrl(url);
    const quality = options.quality ?? "hq";
    validateThumbQuality(quality);

    const cacheKey = `yt:dl:thumb:${url}:${quality}`;
    const cached = this.cache.get<{ url: string }>(cacheKey);
    if (cached) return cached;

    const apiUrl = buildUrl(this.baseUrl, "/ytdl/thumb", { url, quality });
    const result = await fetchJson<{ url: string }>(apiUrl, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Get a direct download URL for a YouTube video or audio.
   *
   * @param url - YouTube video URL
   * @param options - Download options
   * @param options.format - "mp3" for audio, "mp4" for video
   * @returns Object with the direct download URL and metadata
   * @throws {ValidationError} If URL or format is invalid
   * @example
   * ```ts
   * const { url: dlUrl } = await client.youtube.download.url(
   *   "https://youtube.com/watch?v=dQw4w9WgXcQ",
   *   { format: "mp3" }
   * );
   * ```
   */
  async url(url: string, options: YTUrlOptions): Promise<YTDownloadUrlResult> {
    validateYouTubeUrl(url);
    validateYTFormat(options.format);

    const cacheKey = `yt:dl:url:${url}:${options.format}`;
    const cached = this.cache.get<YTDownloadUrlResult>(cacheKey);
    if (cached) return cached;

    const apiUrl = buildUrl(this.baseUrl, "/ytdl/url", { url, format: options.format });
    const result = await fetchJson<YTDownloadUrlResult>(apiUrl, this.defaultOptions);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Stream a YouTube video or audio as a ReadableStream.
   * Works in Node.js, browsers, and edge runtimes.
   *
   * @param url - YouTube video URL
   * @param options - Stream options
   * @param options.format - "mp3" for audio, "mp4" for video
   * @returns A ReadableStream of the media data
   * @throws {ValidationError} If URL or format is invalid
   * @example
   * ```ts
   * // Browser: create a blob URL
   * const stream = await client.youtube.download.stream(
   *   "https://youtube.com/watch?v=dQw4w9WgXcQ",
   *   { format: "mp3" }
   * );
   * const blob = await new Response(stream).blob();
   * const audioUrl = URL.createObjectURL(blob);
   * ```
   */
  async stream(url: string, options: YTStreamOptions): Promise<ReadableStream<Uint8Array>> {
    validateYouTubeUrl(url);
    validateYTFormat(options.format);

    const apiUrl = buildUrl(this.baseUrl, "/ytdl/stream", { url, format: options.format });
    const response = await fetchStream(apiUrl, this.defaultOptions);

    if (!response.body) {
      throw new Error("Response body is null — streaming not supported in this environment");
    }
    return response.body;
  }

  /**
   * Download a YouTube video or audio to disk (Node.js only).
   * Falls back to returning a ReadableStream in browser/edge environments.
   *
   * @param url - YouTube video URL
   * @param options - Download options
   * @param options.format - "mp3" for audio, "mp4" for video
   * @param options.outDir - Output directory (Node.js only). Defaults to current working directory
   * @returns File path (Node.js) or ReadableStream (browser/edge)
   * @throws {ValidationError} If URL or format is invalid
   * @example
   * ```ts
   * // Node.js
   * const filePath = await client.youtube.download.download(
   *   "https://youtube.com/watch?v=dQw4w9WgXcQ",
   *   { format: "mp3", outDir: "./downloads" }
   * );
   * console.log("Saved to:", filePath);
   * ```
   */
  async download(
    url: string,
    options: YTDownloadOptions,
  ): Promise<string | ReadableStream<Uint8Array>> {
    validateYouTubeUrl(url);
    validateYTFormat(options.format);

    const apiUrl = buildUrl(this.baseUrl, "/ytdl/download", {
      url,
      format: options.format,
    });
    const response = await fetchStream(apiUrl, this.defaultOptions);

    if (!response.body) {
      throw new Error("Response body is null");
    }

    // Runtime guard: only attempt file write in Node.js
    if (typeof process !== "undefined" && process.versions?.node) {
      return writeStreamToFile(response, options.outDir ?? ".");
    }

    return response.body;
  }

  /**
   * Search YouTube and get download URLs in one call.
   *
   * @param q - Search query string
   * @param options - Search + download options
   * @param options.format - "mp3" or "mp4"
   * @param options.limit - Number of results (1–50). Default: 10
   * @returns Array of search results with download URLs
   * @throws {ValidationError} If query is empty, format invalid, or limit out of range
   * @example
   * ```ts
   * const results = await client.youtube.download.search("lofi chill", { format: "mp3", limit: 3 });
   * console.log(results[0].downloadUrl);
   * ```
   */
  async search(q: string, options: YTSearchDownloadOptions): Promise<YTSearchDownloadResult[]> {
    validateQuery(q);
    validateYTFormat(options.format);
    if (options.limit !== undefined) validateLimit(options.limit);

    const apiUrl = buildUrl(this.baseUrl, "/ytdl/search", {
      q,
      format: options.format,
      limit: options.limit,
    });
    return fetchJson<YTSearchDownloadResult[]>(apiUrl, this.defaultOptions);
  }
}

/**
 * Writes a streaming Response body to a file on disk (Node.js only).
 * Dynamically imports node:fs and node:path to avoid bundling issues.
 */
async function writeStreamToFile(response: Response, outDir: string): Promise<string> {
  const { createWriteStream, mkdirSync } = await import("node:fs");
  const { join } = await import("node:path");

  // Extract filename from Content-Disposition header or generate one
  const disposition = response.headers.get("content-disposition") ?? "";
  const fileNameMatch = /filename="?([^";\n]+)"?/.exec(disposition);
  const fileName =
    fileNameMatch?.[1] ??
    `download-${Date.now()}.${response.headers.get("content-type")?.includes("audio") ? "mp3" : "mp4"}`;

  mkdirSync(outDir, { recursive: true });
  const filePath = join(outDir, fileName);

  if (!response.body) throw new Error("Response body is null");

  await new Promise<void>((resolve, reject) => {
    const writer = createWriteStream(filePath);

    // Handle Web ReadableStream → Node Writable
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
