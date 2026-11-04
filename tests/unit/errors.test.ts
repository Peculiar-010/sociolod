import { describe, it, expect } from "vitest";
import {
  SociolodError,
  NetworkError,
  HttpError,
  ValidationError,
  RateLimitError,
} from "../../src/errors.js";

describe("SociolodError", () => {
  it("is an instance of Error", () => {
    const err = new SociolodError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(SociolodError);
    expect(err.message).toBe("test");
    expect(err.name).toBe("SociolodError");
  });
});

describe("NetworkError", () => {
  it("extends SociolodError", () => {
    const cause = new TypeError("fetch failed");
    const err = new NetworkError("network issue", cause);
    expect(err).toBeInstanceOf(SociolodError);
    expect(err).toBeInstanceOf(NetworkError);
    expect(err.name).toBe("NetworkError");
    expect(err.cause).toBe(cause);
  });
});

describe("HttpError", () => {
  it("stores status, statusText, body, url", () => {
    const err = new HttpError(404, "Not Found", "not found", "https://example.com");
    expect(err).toBeInstanceOf(SociolodError);
    expect(err.status).toBe(404);
    expect(err.statusText).toBe("Not Found");
    expect(err.body).toBe("not found");
    expect(err.url).toBe("https://example.com");
    expect(err.message).toContain("404");
  });
});

describe("ValidationError", () => {
  it("stores field name", () => {
    const err = new ValidationError("q", "must not be empty");
    expect(err).toBeInstanceOf(SociolodError);
    expect(err.field).toBe("q");
    expect(err.message).toContain('"q"');
    expect(err.message).toContain("must not be empty");
  });
});

describe("RateLimitError", () => {
  it("extends HttpError with retryAfter", () => {
    const err = new RateLimitError(30, "https://example.com");
    expect(err).toBeInstanceOf(HttpError);
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.status).toBe(429);
    expect(err.retryAfter).toBe(30);
    expect(err.name).toBe("RateLimitError");
  });

  it("allows null retryAfter", () => {
    const err = new RateLimitError(null, "https://example.com");
    expect(err.retryAfter).toBeNull();
  });
});
