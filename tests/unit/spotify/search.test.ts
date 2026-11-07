import { describe, it, expect, vi, afterEach } from "vitest";
import { SpotifySearchClient } from "../../../src/spotify/search.js";
import { ValidationError } from "../../../src/errors.js";
import { LRUCache } from "../../../src/cache.js";
import { mockJsonResponse, stubFetch, SPOTIFY_TRACK, BASE_URL } from "../helpers.js";

function makeClient(): SpotifySearchClient {
  return new SpotifySearchClient(
    BASE_URL,
    { timeout: 5000, retries: 0 },
    new LRUCache({ enabled: false }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SpotifySearchClient.search", () => {
  it("calls /spotsearch with q and limit", async () => {
    stubFetch(mockJsonResponse([SPOTIFY_TRACK]));
    const client = makeClient();
    const results = await client.search("blinding lights", { limit: 5 });
    expect(results[0]?.name).toBe(SPOTIFY_TRACK.name);
    const fetchUrl = (vi.mocked(fetch).mock.calls[0] as [string])[0];
    expect(fetchUrl).toContain("spotsearch");
    expect(fetchUrl).toContain("q=blinding+lights");
  });

  it("throws ValidationError for empty query", async () => {
    const client = makeClient();
    await expect(client.search("")).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid limit", async () => {
    const client = makeClient();
    await expect(client.search("test", { limit: 100 })).rejects.toThrow(ValidationError);
  });

  it("caches result on second call", async () => {
    stubFetch(mockJsonResponse([SPOTIFY_TRACK]));
    const cache = new LRUCache({ enabled: true, ttl: 60_000 });
    const client = new SpotifySearchClient(BASE_URL, { retries: 0 }, cache);
    await client.search("test");
    await client.search("test");
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});

describe("SpotifySearchClient.song", () => {
  it("calls /spotsearch/song", async () => {
    stubFetch(mockJsonResponse(SPOTIFY_TRACK));
    const client = makeClient();
    const result = await client.song("shape of you");
    expect(result.id).toBe(SPOTIFY_TRACK.id);
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("spotsearch/song");
  });

  it("throws ValidationError for empty query", async () => {
    const client = makeClient();
    await expect(client.song("")).rejects.toThrow(ValidationError);
  });
});

describe("SpotifySearchClient.random", () => {
  it("calls /spotsearch/random", async () => {
    stubFetch(mockJsonResponse(SPOTIFY_TRACK));
    const client = makeClient();
    await client.random("pop");
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("spotsearch/random");
  });
});

describe("SpotifySearchClient.cover", () => {
  it("returns cover object", async () => {
    const data = { url: "https://i.scdn.co/image/abc", trackName: "Test", artist: "Artist" };
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.cover("test song");
    expect(result.url).toContain("scdn");
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("spotsearch/cover");
  });
});

describe("SpotifySearchClient.links", () => {
  it("returns array of Spotify URLs", async () => {
    const data = ["https://open.spotify.com/track/abc", "https://open.spotify.com/track/def"];
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.links("taylor swift");
    expect(result).toEqual(data);
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("spotsearch/links");
  });
});

describe("SpotifySearchClient.artist", () => {
  it("calls /spotsearch/artist", async () => {
    const data = { id: "0gxyHStUsqpMadRV0Di1Qt", name: "Rick Astley", url: "https://open.spotify.com/artist/0gxyHStUsqpMadRV0Di1Qt" };
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.artist("Rick Astley");
    expect(result.name).toBe("Rick Astley");
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("spotsearch/artist");
  });
});


describe("SpotifySearchClient cache coverage", () => {
  it("uses cached values for song, cover, links, and artist", async () => {
    const cache = new LRUCache({ enabled: true, ttl: 60_000 });
    const client = new SpotifySearchClient(BASE_URL, { retries: 0 }, cache);
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/cover")) return mockJsonResponse({ url: "https://img.example/cover", trackName: "Test", artist: "Artist" });
      if (url.includes("/links")) return mockJsonResponse(["https://open.spotify.com/track/test"]);
      if (url.includes("/artist")) return mockJsonResponse({ id: "artist", name: "Artist", url: "https://open.spotify.com/artist/artist" });
      return mockJsonResponse(SPOTIFY_TRACK);
    });
    vi.stubGlobal("fetch", fetchMock);

    await client.song("cached song");
    await client.song("cached song");
    await client.cover("cached cover");
    await client.cover("cached cover");
    await client.links("cached links");
    await client.links("cached links");
    await client.artist("cached artist");
    await client.artist("cached artist");

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
