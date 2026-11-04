import { describe, it, expect, vi, afterEach } from "vitest";
import { SpotifyDownloadClient } from "../../../src/spotify/download.js";
import { ValidationError } from "../../../src/errors.js";
import { LRUCache } from "../../../src/cache.js";
import { mockJsonResponse, stubFetch, SPOTIFY_TRACK, SPOTIFY_DOWNLOAD_URL_RESULT, BASE_URL } from "../helpers.js";

const VALID_SPOTIFY_URL = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";

function makeClient(): SpotifyDownloadClient {
  return new SpotifyDownloadClient(
    BASE_URL,
    { timeout: 5000, retries: 0 },
    new LRUCache({ enabled: false }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SpotifyDownloadClient.info", () => {
  it("calls /spdl/info with url", async () => {
    stubFetch(mockJsonResponse(SPOTIFY_TRACK));
    const client = makeClient();
    const result = await client.info(VALID_SPOTIFY_URL);
    expect(result.id).toBe(SPOTIFY_TRACK.id);
    const fetchUrl = (vi.mocked(fetch).mock.calls[0] as [string])[0];
    expect(fetchUrl).toContain("spdl/info");
  });

  it("throws ValidationError for invalid URL", async () => {
    const client = makeClient();
    await expect(client.info("https://example.com")).rejects.toThrow(ValidationError);
  });
});

describe("SpotifyDownloadClient.preview", () => {
  it("calls /spdl/preview", async () => {
    const data = { url: "https://p.scdn.co/mp3-preview/abc", trackId: "4cOd", trackName: "Test", durationMs: 30000 };
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.preview(VALID_SPOTIFY_URL);
    expect(result.url).toContain("scdn");
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("spdl/preview");
  });

  it("throws ValidationError for invalid URL", async () => {
    const client = makeClient();
    await expect(client.preview("not-a-spotify-url")).rejects.toThrow(ValidationError);
  });
});

describe("SpotifyDownloadClient.match", () => {
  it("calls /spdl/match", async () => {
    const data = {
      spotifyTrack: SPOTIFY_TRACK,
      youtubeMatch: { videoId: "abc", title: "Rick Astley", url: "https://youtube.com/watch?v=abc", duration: "3:33", confidence: 0.95 },
    };
    stubFetch(mockJsonResponse(data));
    const client = makeClient();
    const result = await client.match(VALID_SPOTIFY_URL);
    expect(result.youtubeMatch.confidence).toBe(0.95);
    expect((vi.mocked(fetch).mock.calls[0] as [string])[0]).toContain("spdl/match");
  });
});

describe("SpotifyDownloadClient.url", () => {
  it("calls /spdl/url with format", async () => {
    stubFetch(mockJsonResponse(SPOTIFY_DOWNLOAD_URL_RESULT));
    const client = makeClient();
    const result = await client.url(VALID_SPOTIFY_URL, { format: "mp3" });
    expect(result.format).toBe("mp3");
    const fetchUrl = (vi.mocked(fetch).mock.calls[0] as [string])[0];
    expect(fetchUrl).toContain("spdl/url");
    expect(fetchUrl).toContain("format=mp3");
  });

  it("throws ValidationError for invalid format", async () => {
    const client = makeClient();
    await expect(client.url(VALID_SPOTIFY_URL, { format: "ogg" as never })).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid URL", async () => {
    const client = makeClient();
    await expect(client.url("bad-url", { format: "mp3" })).rejects.toThrow(ValidationError);
  });
});

describe("SpotifyDownloadClient.stream", () => {
  it("returns ReadableStream", async () => {
    const stream = new ReadableStream();
    stubFetch(new Response(stream, { status: 200 }));
    const client = makeClient();
    const result = await client.stream(VALID_SPOTIFY_URL, { format: "mp3" });
    expect(result).toBeInstanceOf(ReadableStream);
  });

  it("throws ValidationError for invalid format", async () => {
    const client = makeClient();
    await expect(client.stream(VALID_SPOTIFY_URL, { format: "flac" as never })).rejects.toThrow(ValidationError);
  });
});

describe("SpotifyDownloadClient.download", () => {
  it("throws ValidationError for invalid URL", async () => {
    const client = makeClient();
    await expect(client.download("bad", { format: "mp3" })).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid format", async () => {
    const client = makeClient();
    await expect(client.download(VALID_SPOTIFY_URL, { format: "wav" as never })).rejects.toThrow(ValidationError);
  });
});
