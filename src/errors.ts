export class SociolodError extends Error {
  override name: string = "SociolodError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends SociolodError {
  override name = "NetworkError";
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

export class HttpError extends SociolodError {
  override name = "HttpError";
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

export class ValidationError extends SociolodError {
  override name = "ValidationError";
  public readonly field: string;

  constructor(field: string, message: string) {
    super(`Validation error for "${field}": ${message}`);
    this.field = field;
  }
}

export class RateLimitError extends HttpError {
  override readonly name = "RateLimitError";
  public readonly retryAfter: number | null;

  constructor(retryAfter: number | null, url: string, body = "") {
    super(429, "Too Many Requests", body, url);
    this.retryAfter = retryAfter;
  }
}
