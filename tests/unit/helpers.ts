import { vi } from "vitest";

export const BASE_URL = "https://apispec.litype.workers.dev";

/** Creates a mock Response with JSON body */
export function mockJsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Creates a mock Response with text body */
export function mockTextResponse(text: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(text, {
    status,
    headers: { "Content-Type": "text/plain", ...extraHeaders },
  });
}

/** Stubs global fetch to return the given response */
export function stubFetch(response: Response): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

/** Stubs global fetch to return different responses per call */
export function stubFetchSequence(responses: Response[]): void {
  const mockFn = vi.fn();
  responses.forEach((r, i) => mockFn.mockResolvedValueOnce(responses[i]));
  vi.stubGlobal("fetch", mockFn);
}

/** Stubs global fetch to throw a network error */
export function stubFetchError(message = "fetch failed"): void {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError(message)));
}

// ─── Sample fixtures ──────────────────────────────────────────────────────────

export const YT_SEARCH_RESULT = {
  videoId: "dQw4w9WgXcQ",
  title: "Rick Astley - Never Gonna Give You Up",
  description: "Official music video",
  thumbnails: {
    default: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg" },
    high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
  },
  channel: {
    id: "UCuAXFkgsw1L7xaCfnd5JJOw",
    title: "Rick Astley",
    url: "https://youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
  },
  duration: "3:33",
  viewCount: "1500000000",
  publishedAt: "2009-10-25",
  url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
};

export const YT_VIDEO_INFO = {
  videoId: "dQw4w9WgXcQ",
  title: "Rick Astley - Never Gonna Give You Up",
  description: "Official music video",
  duration: 213,
  durationFormatted: "3:33",
  thumbnails: {
    default: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg" },
  },
  channel: {
    id: "UCuAXFkgsw1L7xaCfnd5JJOw",
    title: "Rick Astley",
    url: "https://youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
  },
  viewCount: "1500000000",
  publishedAt: "2009-10-25",
  formats: [],
};

export const YT_DOWNLOAD_URL_RESULT = {
  url: "https://cdn.example.com/audio.mp3",
  format: "mp3" as const,
  title: "Rick Astley - Never Gonna Give You Up",
  duration: 213,
  filesize: 5000000,
  mimeType: "audio/mpeg",
};

export const SPOTIFY_TRACK = {
  id: "4cOdK2wGLETKBW3PvgPWqT",
  name: "Never Gonna Give You Up",
  artists: [{ id: "0gxyHStUsqpMadRV0Di1Qt", name: "Rick Astley", url: "https://open.spotify.com/artist/0gxyHStUsqpMadRV0Di1Qt" }],
  album: {
    id: "3LzdcHgOEHSzjJtdLzqMBN",
    name: "Whenever You Need Somebody",
    url: "https://open.spotify.com/album/3LzdcHgOEHSzjJtdLzqMBN",
    images: [{ url: "https://i.scdn.co/image/abc", width: 640, height: 640 }],
    releaseDate: "1987-11-16",
  },
  duration_ms: 213573,
  durationFormatted: "3:33",
  url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
  previewUrl: "https://p.scdn.co/mp3-preview/abc",
};

export const SPOTIFY_DOWNLOAD_URL_RESULT = {
  url: "https://cdn.example.com/spotify.mp3",
  format: "mp3" as const,
  title: "Never Gonna Give You Up",
  artist: "Rick Astley",
  duration: 213,
  filesize: 5000000,
  mimeType: "audio/mpeg",
};
