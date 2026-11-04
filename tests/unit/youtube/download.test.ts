import { describe, it, expect, vi, afterEach } from "vitest";
import { YouTubeDownloadClient } from "../../../src/youtube/download.js";
import { ValidationError } from "../../../src/errors.js";
import { LRUCache } from "../../../src/cache.js";
import {
  mockJsonResponse,
  stubFetch,
  YT_VIDEO_INFO,
  YT_DOWNLOAD_URL_RESULT,
  BASE_URL,
} from "../helpers.js";

const VALID_YT_URL = "https://youtube.com/watch?v=dQw4w9WgXcQ";

function makeClient(): YouTubeDownloadClient {
  return new YouTubeDownloadClient(
    BASE_URL,
    { timeout: 5000, retries: 0 },
    new LRUCache({ enabled: false }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("YouTubeDownloadClient.info", () => {
  it("calls /ytdl/info with url", async () => {
    stubFetch(mockJsonResponse(YT_VIDEO_INFO));
    const client = makeClient();
    const result = await client.info(VALID_YT_URL);
    expect(result.videoId).toBe(YT_VIDEO_INFO.videoId);
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("ytdl/info");
  });

  it("throws ValidationError for invalid URL", async () => {
    const client = makeClient();
    await expect(client.info("https://example.com")).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for empty URL", async () => {
    const client = makeClient();
    await expect(client.info("")).rejects.toThrow(ValidationError);
  });
});

describe("YouTubeDownloadClient.thumb", () => {
  it("calls /ytdl/thumb with url and quality", async () => {
    stubFetch(mockJsonResponse({ url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" }));
    const client = makeClient();
    const result = await client.thumb(VALID_YT_URL, { quality: "maxres" });
    expect(result.url).toContain("ytimg");
    const fetchUrl = (vi.mocked(fetch).mock.calls[0] as [string])[0];
    expect(fetchUrl).toContain("ytdl/thumb");
    expect(fetchUrl).toContain("quality=maxres");
  });

  it("defaults quality to hq", async () => {
    stubFetch(mockJsonResponse({ url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" }));
    const client = makeClient();
    await client.thumb(VALID_YT_URL);
    const fetchUrl = (vi.mocked(fetch).mock.calls[0] as [string])[0];
    expect(fetchUrl).toContain("quality=hq");
  });

  it("throws ValidationError for invalid quality", async () => {
    const client = makeClient();
    await expect(client.thumb(VALID_YT_URL, { quality: "4k" as never })).rejects.toThrow(ValidationError);
  });
});

describe("YouTubeDownloadClient.url", () => {
  it("calls /ytdl/url with url and format", async () => {
    stubFetch(mockJsonResponse(YT_DOWNLOAD_URL_RESULT));
    const client = makeClient();
    const result = await client.url(VALID_YT_URL, { format: "mp3" });
    expect(result.format).toBe("mp3");
    const fetchUrl = (vi.mocked(fetch).mock.calls[0] as [string])[0];
    expect(fetchUrl).toContain("ytdl/url");
    expect(fetchUrl).toContain("format=mp3");
  });

  it("throws ValidationError for invalid format", async () => {
    const client = makeClient();
    await expect(client.url(VALID_YT_URL, { format: "wav" as never })).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid URL", async () => {
    const client = makeClient();
    await expect(client.url("not-a-url", { format: "mp3" })).rejects.toThrow(ValidationError);
  });
});

describe("YouTubeDownloadClient.stream", () => {
  it("returns ReadableStream", async () => {
    const stream = new ReadableStream();
    const mockResponse = new Response(stream, { status: 200 });
    stubFetch(mockResponse);
    const client = makeClient();
    const result = await client.stream(VALID_YT_URL, { format: "mp3" });
    expect(result).toBeInstanceOf(ReadableStream);
  });

  it("throws ValidationError for invalid URL", async () => {
    const client = makeClient();
    await expect(client.stream("bad", { format: "mp3" })).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid format", async () => {
    const client = makeClient();
    await expect(client.stream(VALID_YT_URL, { format: "ogg" as never })).rejects.toThrow(ValidationError);
  });
});

describe("YouTubeDownloadClient.search", () => {
  it("calls /ytdl/search with q, format, limit", async () => {
    const data = [{ videoId: "abc", title: "Track", url: "https://youtube.com/watch?v=abc", downloadUrl: "https://cdn.example.com/abc.mp3", format: "mp3" }];
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.search("lofi", { format: "mp3", limit: 3 });
    expect(result[0]?.format).toBe("mp3");
    const fetchUrl = (vi.mocked(fetch).mock.calls[0] as [string])[0];
    expect(fetchUrl).toContain("ytdl/search");
  });

  it("throws ValidationError for empty query", async () => {
    const client = makeClient();
    await expect(client.search("", { format: "mp3" })).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid format", async () => {
    const client = makeClient();
    await expect(client.search("test", { format: "flac" as never })).rejects.toThrow(ValidationError);
  });
});
