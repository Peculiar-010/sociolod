import { describe, it, expect } from "vitest";
import {
  validateQuery,
  validateYouTubeUrl,
  validateSpotifyUrl,
  validateYTFormat,
  validateThumbQuality,
  validateSpotifyFormat,
  validateLimit,
} from "../../src/validate.js";
import { ValidationError } from "../../src/errors.js";

describe("validateQuery", () => {
  it("passes for non-empty string", () => {
    expect(() => validateQuery("lofi")).not.toThrow();
  });

  it("throws for empty string", () => {
    expect(() => validateQuery("")).toThrow(ValidationError);
  });

  it("throws for whitespace-only string", () => {
    expect(() => validateQuery("   ")).toThrow(ValidationError);
  });
});

describe("validateYouTubeUrl", () => {
  it("passes for youtube.com/watch URL", () => {
    expect(() => validateYouTubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).not.toThrow();
  });

  it("passes for youtu.be URL", () => {
    expect(() => validateYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).not.toThrow();
  });

  it("passes for www.youtube.com URL", () => {
    expect(() => validateYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).not.toThrow();
  });

  it("throws for Spotify URL", () => {
    expect(() =>
      validateYouTubeUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"),
    ).toThrow(ValidationError);
  });

  it("throws for empty string", () => {
    expect(() => validateYouTubeUrl("")).toThrow(ValidationError);
  });

  it("throws for random URL", () => {
    expect(() => validateYouTubeUrl("https://example.com")).toThrow(ValidationError);
  });
});

describe("validateSpotifyUrl", () => {
  it("passes for open.spotify.com/track URL", () => {
    expect(() =>
      validateSpotifyUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"),
    ).not.toThrow();
  });

  it("passes for album URL", () => {
    expect(() =>
      validateSpotifyUrl("https://open.spotify.com/album/3LzdcHgOEHSzjJtdLzqMBN"),
    ).not.toThrow();
  });

  it("throws for YouTube URL", () => {
    expect(() =>
      validateSpotifyUrl("https://youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toThrow(ValidationError);
  });

  it("throws for empty string", () => {
    expect(() => validateSpotifyUrl("")).toThrow(ValidationError);
  });
});

describe("validateYTFormat", () => {
  it("passes for mp3", () => {
    expect(() => validateYTFormat("mp3")).not.toThrow();
  });

  it("passes for mp4", () => {
    expect(() => validateYTFormat("mp4")).not.toThrow();
  });

  it("throws for invalid format", () => {
    expect(() => validateYTFormat("wav")).toThrow(ValidationError);
  });
});

describe("validateThumbQuality", () => {
  it("passes for default, hq, maxres", () => {
    expect(() => validateThumbQuality("default")).not.toThrow();
    expect(() => validateThumbQuality("hq")).not.toThrow();
    expect(() => validateThumbQuality("maxres")).not.toThrow();
  });

  it("throws for invalid quality", () => {
    expect(() => validateThumbQuality("4k")).toThrow(ValidationError);
  });
});

describe("validateSpotifyFormat", () => {
  it("passes for mp3 and mp4", () => {
    expect(() => validateSpotifyFormat("mp3")).not.toThrow();
    expect(() => validateSpotifyFormat("mp4")).not.toThrow();
  });

  it("throws for invalid format", () => {
    expect(() => validateSpotifyFormat("flac")).toThrow(ValidationError);
  });
});

describe("validateLimit", () => {
  it("passes for 1 and 50", () => {
    expect(() => validateLimit(1)).not.toThrow();
    expect(() => validateLimit(50)).not.toThrow();
  });

  it("throws for 0", () => {
    expect(() => validateLimit(0)).toThrow(ValidationError);
  });

  it("throws for 51", () => {
    expect(() => validateLimit(51)).toThrow(ValidationError);
  });

  it("throws for float", () => {
    expect(() => validateLimit(5.5)).toThrow(ValidationError);
  });
});
