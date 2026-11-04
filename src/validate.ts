import { ValidationError } from "./errors.js";
import type { YTFormat, YTThumbQuality, SpotifyFormat } from "./types/index.js";

const YOUTUBE_URL_PATTERN =
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/;

const SPOTIFY_URL_PATTERN =
  /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[A-Za-z0-9]+/;

const VALID_YT_FORMATS: YTFormat[] = ["mp3", "mp4"];
const VALID_THUMB_QUALITIES: YTThumbQuality[] = ["default", "hq", "maxres"];
const VALID_SPOTIFY_FORMATS: SpotifyFormat[] = ["mp3", "mp4"];

/**
 * Asserts that a search query is a non-empty string.
 */
export function validateQuery(query: string, field = "q"): void {
  if (typeof query !== "string" || query.trim().length === 0) {
    throw new ValidationError(field, "Query must be a non-empty string");
  }
}

/**
 * Asserts that a string is a valid YouTube video URL.
 */
export function validateYouTubeUrl(url: string, field = "url"): void {
  if (typeof url !== "string" || url.trim().length === 0) {
    throw new ValidationError(field, "URL must be a non-empty string");
  }
  if (!YOUTUBE_URL_PATTERN.test(url)) {
    throw new ValidationError(
      field,
      `"${url}" is not a valid YouTube video URL. ` +
        "Expected formats: https://youtube.com/watch?v=... or https://youtu.be/...",
    );
  }
}

/**
 * Asserts that a string is a valid Spotify URL.
 */
export function validateSpotifyUrl(url: string, field = "url"): void {
  if (typeof url !== "string" || url.trim().length === 0) {
    throw new ValidationError(field, "URL must be a non-empty string");
  }
  if (!SPOTIFY_URL_PATTERN.test(url)) {
    throw new ValidationError(
      field,
      `"${url}" is not a valid Spotify URL. ` +
        "Expected format: https://open.spotify.com/track/...",
    );
  }
}

/**
 * Asserts that a format value is a valid YouTube format.
 */
export function validateYTFormat(format: string, field = "format"): asserts format is YTFormat {
  if (!VALID_YT_FORMATS.includes(format as YTFormat)) {
    throw new ValidationError(
      field,
      `"${format}" is not a valid format. Expected one of: ${VALID_YT_FORMATS.join(", ")}`,
    );
  }
}

/**
 * Asserts that a quality value is a valid YouTube thumbnail quality.
 */
export function validateThumbQuality(
  quality: string,
  field = "quality",
): asserts quality is YTThumbQuality {
  if (!VALID_THUMB_QUALITIES.includes(quality as YTThumbQuality)) {
    throw new ValidationError(
      field,
      `"${quality}" is not a valid quality. Expected one of: ${VALID_THUMB_QUALITIES.join(", ")}`,
    );
  }
}

/**
 * Asserts that a format value is a valid Spotify format.
 */
export function validateSpotifyFormat(
  format: string,
  field = "format",
): asserts format is SpotifyFormat {
  if (!VALID_SPOTIFY_FORMATS.includes(format as SpotifyFormat)) {
    throw new ValidationError(
      field,
      `"${format}" is not a valid format. Expected one of: ${VALID_SPOTIFY_FORMATS.join(", ")}`,
    );
  }
}

/**
 * Asserts that a limit value is a positive integer.
 */
export function validateLimit(limit: number, field = "limit"): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ValidationError(field, "Limit must be an integer between 1 and 50");
  }
}
