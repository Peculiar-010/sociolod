import { HttpError, NetworkError, RateLimitError } from "./errors.js";
import type { RequestOptions } from "./types/index.js";

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 500;

/**
 * Builds a URL with query parameters, omitting undefined/null values.
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Sleep for `ms` milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines if a given HTTP status code is retryable.
 */
function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * Core fetch wrapper with:
 * - Configurable timeout via AbortController
 * - Exponential backoff retry on 5xx and network errors
 * - Rate-limit (429) detection → throws RateLimitError
 * - Non-2xx → throws HttpError
 * - Network failure → throws NetworkError
 */
export async function fetchWithRetry(
  url: string,
  options: RequestOptions & { extraHeaders?: Record<string, string> } = {},
): Promise<Response> {
  const {
    method = "GET",
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "User-Agent": "sociolod/1.0.0",
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timerId);

      // Rate limit
      if (response.status === 429) {
        const retryAfterRaw = response.headers.get("Retry-After");
        const retryAfter = retryAfterRaw ? parseInt(retryAfterRaw, 10) : null;
        const body = await response.text().catch(() => "");
        throw new RateLimitError(isNaN(retryAfter as number) ? null : retryAfter, url, body);
      }

      // Server errors – retry
      if (isRetryableStatus(response.status) && attempt < retries) {
        const body = await response.text().catch(() => "");
        lastError = new HttpError(response.status, response.statusText, body, url);
        const delay = retryDelay * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      // Other non-2xx
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new HttpError(response.status, response.statusText, body, url);
      }

      return response;
    } catch (error) {
      clearTimeout(timerId);

      // Don't retry RateLimitError or non-retryable HttpError
      if (error instanceof RateLimitError) throw error;
      if (error instanceof HttpError && !isRetryableStatus(error.status)) throw error;

      // AbortError = timeout
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new NetworkError(`Request timed out after ${timeout}ms: ${url}`, error);
      } else if (error instanceof SyntaxError) {
        throw error;
      } else if (!(error instanceof HttpError)) {
        lastError = new NetworkError(
          `Network error: ${error instanceof Error ? error.message : String(error)}`,
          error,
        );
      } else {
        lastError = error;
      }

      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  if (lastError instanceof NetworkError || lastError instanceof HttpError) {
    throw lastError;
  }
  throw new NetworkError(`Request failed after ${retries} retries: ${url}`, lastError);
}

/**
 * Fetches JSON from the given URL with retry logic.
 */
export async function fetchJson<T>(
  url: string,
  options: RequestOptions,
): Promise<T> {
  const response = await fetchWithRetry(url, options);
  return response.json() as Promise<T>;
}

/**
 * Fetches a Response for streaming (does not parse body).
 */
export async function fetchStream(
  url: string,
  options: RequestOptions = {},
): Promise<Response> {
  return fetchWithRetry(url, { ...options, stream: true });
}
