/**
 * Base error class for all sociolod errors.
 */
export class SociolodError extends Error {
  public readonly name: string = "SociolodError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a network-level failure occurs (e.g. DNS failure, connection refused,
 * AbortError / timeout, fetch failed).
 */
export class NetworkError extends SociolodError {
  public readonly name = "NetworkError";
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message, cause instanceof Error ? { cause } : undefined);
    this.cause = cause;
  }
}

/**
 * Thrown when the API responds with a non-2xx HTTP status code.
 */
export class HttpError extends SociolodError {
  public readonly name = "HttpError";
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: string;
  public readonly url: string;

  constructor(status: number, statusText: string, body: string, url: string) {
    super(`HTTP ${status} ${statusText} from ${url}`);
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.url = url;
  }
}

/**
 * Thrown when request input fails validation (e.g. empty query, invalid URL,
 * unsupported format value).
 */
export class ValidationError extends SociolodError {
  public readonly name = "ValidationError";
  public readonly field: string;

  constructor(field: string, message: string) {
    super(`Validation error for "${field}": ${message}`);
    this.field = field;
  }
}

/**
 * Thrown when the API responds with HTTP 429 Too Many Requests.
 * Check `retryAfter` (seconds) before retrying.
 */
export class RateLimitError extends HttpError {
  public readonly name = "RateLimitError";
  /** Number of seconds to wait before retrying (from Retry-After header), or null. */
  public readonly retryAfter: number | null;

  constructor(retryAfter: number | null, url: string, body = "") {
    super(429, "Too Many Requests", body, url);
    this.retryAfter = retryAfter;
  }
}
