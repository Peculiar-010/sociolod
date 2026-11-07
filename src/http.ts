import { HttpError, NetworkError, RateLimitError } from "./errors.js";
import type { RequestOptions } from "./types/index.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

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

export async function fetchWithRetry(
  url: string,
  options: RequestOptions,
): Promise<Response> {
  const timeout = options.timeout ?? 15000;
  const retries = options.retries ?? 3;
  const retryDelay = options.retryDelay ?? 500;
  const headers = options.headers ?? {};
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timerId = setTimeout(() => {
      controller.abort();
    }, timeout);

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
        const raw = response.headers.get("Retry-After");
        const after = raw ? parseInt(raw, 10) : null;
        const body = await response.text().catch(() => "");
        throw new RateLimitError(
          after !== null && !isNaN(after) ? after : null,
          url,
          body,
        );
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
    } catch (err) {
      clearTimeout(timerId);
      if (err instanceof RateLimitError) throw err;
      if (err instanceof HttpError && !isRetryableStatus(err.status)) throw err;

      if (err instanceof Error && err.name === "AbortError") {
        lastError = new NetworkError(`Timed out: ${url}`, err);
      } else if (!(err instanceof HttpError)) {
        lastError = new NetworkError(
          `Network error: ${err instanceof Error ? err.message : String(err)}`,
          err,
        );
      } else {
        lastError = err;
      }

      if (attempt < retries) {
        await sleep(retryDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new NetworkError(`Failed: ${url}`, lastError);
}

export async function fetchJson<T>(
  url: string,
  options: RequestOptions,
): Promise<T> {
  const response = await fetchWithRetry(url, options);
  return response.json() as Promise<T>;
}

export async function fetchStream(
  url: string,
  options: RequestOptions,
): Promise<Response> {
  return fetchWithRetry(url, options);
}
