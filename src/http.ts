import { HttpError, NetworkError, RateLimitError } from "./errors.js";
import type { RequestOptions } from "./types/index.js";

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 500;

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

export async function fetchWithRetry(
  url: string,
  options: RequestOptions,
): Promise<Response> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;
  const headers = options.headers ?? {};

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "sociolod/1.0.0",
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timerId);

      if (response.status === 429) {
        const retryAfterRaw = response.headers.get("Retry-After");
        const parsed = retryAfterRaw ? parseInt(retryAfterRaw, 10) : null;
        const retryAfter = parsed !== null && !isNaN(parsed) ? parsed : null;
        const body = await response.text().catch(() => "");
        throw new RateLimitError(retryAfter, url, body);
      }

      if (isRetryableStatus(response.status) && attempt < retries) {
        lastError = new HttpError(response.status, response.statusText, "", url);
        await sleep(retryDelay * Math.pow(2, attempt));
        continue;
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new HttpError(response.status, response.statusText, body, url);
      }

      return response;
    } catch (error) {
      clearTimeout(timerId);

      if (error instanceof RateLimitError) throw error;
      if (error instanceof HttpError && !isRetryableStatus(error.status)) throw error;

      if (error instanceof Error && error.name === "AbortError") {
        lastError = new NetworkError(`Request timed out after ${timeout}ms: ${url}`, error);
      } else if (!(error instanceof HttpError)) {
        lastError = new NetworkError(
          `Network error: ${error instanceof Error ? error.message : String(error)}`,
          error,
        );
      } else {
        lastError = error;
      }

      if (attempt < retries) {
        await sleep(retryDelay * Math.pow(2, attempt));
      }
    }
  }

  if (lastError instanceof NetworkError || lastError instanceof HttpError) {
    throw lastError;
  }
  throw new NetworkError(`Request failed after ${retries} retries: ${url}`, lastError);
}

export async function fetchJson<T>(url: string, options: RequestOptions): Promise<T> {
  const response = await fetchWithRetry(url, options);
  return response.json() as Promise<T>;
}

export async function fetchStream(url: string, options: RequestOptions): Promise<Response> {
  return fetchWithRetry(url, options);
          }
