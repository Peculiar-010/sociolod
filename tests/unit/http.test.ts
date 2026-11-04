import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildUrl, fetchJson, fetchWithRetry } from "../../src/http.js";
import { HttpError, NetworkError, RateLimitError } from "../../src/errors.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("buildUrl", () => {
  it("builds a URL with query params", () => {
    const url = buildUrl("https://api.example.com", "/search", { q: "test", limit: 5 });
    expect(url).toBe("https://api.example.com/search?q=test&limit=5");
  });

  it("omits undefined params", () => {
    const url = buildUrl("https://api.example.com", "/search", {
      q: "test",
      limit: undefined,
    });
    expect(url).not.toContain("limit");
  });

  it("handles trailing slash on baseUrl", () => {
    const url = buildUrl("https://api.example.com/", "/search", { q: "x" });
    expect(url).toBe("https://api.example.com/search?q=x");
  });
});

describe("fetchWithRetry", () => {
  it("returns response on 200", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const response = await fetchWithRetry("https://api.example.com/test");
    expect(response.ok).toBe(true);
  });

  it("throws HttpError on 400", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("bad request", { status: 400 })),
    );

    await expect(fetchWithRetry("https://api.example.com/test")).rejects.toThrow(HttpError);
  });

  it("throws RateLimitError on 429 with Retry-After header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("rate limited", {
          status: 429,
          headers: { "Retry-After": "60" },
        }),
      ),
    );

    await expect(fetchWithRetry("https://api.example.com/test")).rejects.toThrow(RateLimitError);
    try {
      await fetchWithRetry("https://api.example.com/test");
    } catch (e) {
      expect(e).toBeInstanceOf(RateLimitError);
      expect((e as RateLimitError).retryAfter).toBe(60);
    }
  });

  it("retries on 500 and throws after exhausting retries", async () => {
    const mockFn = vi
      .fn()
      .mockResolvedValue(new Response("server error", { status: 500 }));
    vi.stubGlobal("fetch", mockFn);

    // Need to advance timers while the promise is pending
    const fetchPromise = fetchWithRetry("https://api.example.com/test", {
      retries: 2,
      retryDelay: 100,
    });

    // Advance past all backoff delays: 100ms + 200ms
    await vi.runAllTimersAsync();

    await expect(fetchPromise).rejects.toThrow(HttpError);
    expect(mockFn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("retries on network error", async () => {
    const mockFn = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", mockFn);

    const fetchPromise = fetchWithRetry("https://api.example.com/test", {
      retries: 1,
      retryDelay: 10,
    });
    await vi.runAllTimersAsync();

    await expect(fetchPromise).rejects.toThrow(NetworkError);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe("fetchJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses and returns JSON", async () => {
    const data = { result: "ok" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const result = await fetchJson<typeof data>("https://api.example.com/test");
    expect(result).toEqual(data);
  });
});
