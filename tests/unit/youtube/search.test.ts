import { describe, it, expect, vi, afterEach } from "vitest";
import { YouTubeSearchClient } from "../../../src/youtube/search.js";
import { ValidationError, HttpError } from "../../../src/errors.js";
import { LRUCache } from "../../../src/cache.js";
import {
  mockJsonResponse,
  stubFetch,
  YT_SEARCH_RESULT,
  BASE_URL,
} from "../helpers.js";

function makeClient(): YouTubeSearchClient {
  return new YouTubeSearchClient(
    BASE_URL,
    { timeout: 5000, retries: 0 },
    new LRUCache({ enabled: false }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("YouTubeSearchClient.search", () => {
  it("calls /ytsearch with q and limit", async () => {
    const data = [YT_SEARCH_RESULT];
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const results = await client.search("lofi", { limit: 5 });
    expect(results).toEqual(data);
    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain("ytsearch");
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain("q=lofi");
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain("limit=5");
  });

  it("throws ValidationError for empty query", async () => {
    const client = makeClient();
    await expect(client.search("")).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid limit", async () => {
    const client = makeClient();
    await expect(client.search("test", { limit: 0 })).rejects.toThrow(ValidationError);
  });

  it("returns cached result on second call", async () => {
    const data = [YT_SEARCH_RESULT];
    stubFetch(mockJsonResponse(data));
    const cache = new LRUCache({ enabled: true, ttl: 60_000 });
    const client = new YouTubeSearchClient(BASE_URL, { retries: 0 }, cache);
    await client.search("lofi");
    await client.search("lofi"); // Should use cache
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it("throws HttpError on 500", async () => {
    stubFetch(new Response("error", { status: 500 }));
    const client = makeClient();
    await expect(client.search("test")).rejects.toThrow(HttpError);
  });
});

describe("YouTubeSearchClient.video", () => {
  it("calls /ytsearch/video", async () => {
    stubFetch(mockJsonResponse(YT_SEARCH_RESULT));
    const client = makeClient();
    const result = await client.video("rickroll");
    expect(result.videoId).toBe(YT_SEARCH_RESULT.videoId);
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("ytsearch/video");
  });

  it("throws ValidationError for empty query", async () => {
    const client = makeClient();
    await expect(client.video("")).rejects.toThrow(ValidationError);
  });
});

describe("YouTubeSearchClient.random", () => {
  it("calls /ytsearch/random", async () => {
    stubFetch(mockJsonResponse(YT_SEARCH_RESULT));
    const client = makeClient();
    await client.random("jazz");
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("ytsearch/random");
  });
});

describe("YouTubeSearchClient.thumb", () => {
  it("calls /ytsearch/thumb and returns thumb object", async () => {
    const data = { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", videoId: "dQw4w9WgXcQ", title: "Rick Astley" };
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.thumb("rickroll");
    expect(result.url).toBe(data.url);
  });
});

describe("YouTubeSearchClient.links", () => {
  it("returns array of strings", async () => {
    const data = ["https://youtube.com/watch?v=abc", "https://youtube.com/watch?v=def"];
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.links("test");
    expect(result).toEqual(data);
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("ytsearch/links");
  });
});

describe("YouTubeSearchClient.titles", () => {
  it("returns array of strings", async () => {
    const data = ["Title One", "Title Two"];
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.titles("test");
    expect(result).toEqual(data);
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("ytsearch/titles");
  });
});

describe("YouTubeSearchClient.channel", () => {
  it("calls /ytsearch/channel", async () => {
    const data = { id: "UCabc", title: "MrBeast", url: "https://youtube.com/@MrBeast" };
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.channel("MrBeast");
    expect(result.title).toBe("MrBeast");
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("ytsearch/channel");
  });

  it("throws ValidationError for empty query", async () => {
    const client = makeClient();
    await expect(client.channel("")).rejects.toThrow(ValidationError);
  });
});


describe("YouTubeSearchClient cache coverage", () => {
  it("uses cached values for video, thumbnail, links, titles, and channel", async () => {
    const cache = new LRUCache({ enabled: true, ttl: 60_000 });
    const client = new YouTubeSearchClient(BASE_URL, { retries: 0 }, cache);
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/thumb")) return mockJsonResponse({ url: "https://img.example/thumb", videoId: "abc", title: "Video" });
      if (url.includes("/links")) return mockJsonResponse(["https://youtube.com/watch?v=abc"]);
      if (url.includes("/titles")) return mockJsonResponse(["Video title"]);
      if (url.includes("/channel")) return mockJsonResponse({ id: "channel", title: "Channel", url: "https://youtube.com/@channel" });
      return mockJsonResponse(YT_SEARCH_RESULT);
    });
    vi.stubGlobal("fetch", fetchMock);

    await client.video("cached video");
    await client.video("cached video");
    await client.thumb("cached thumb");
    await client.thumb("cached thumb");
    await client.links("cached links");
    await client.links("cached links");
    await client.titles("cached titles");
    await client.titles("cached titles");
    await client.channel("cached channel");
    await client.channel("cached channel");

    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});
