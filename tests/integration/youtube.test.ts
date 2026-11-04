/**
 * Integration tests — run with RUN_INTEGRATION=1 vitest run tests/integration
 * These hit the live API and are skipped by default.
 */
import { describe, it, expect } from "vitest";
import { SociolodClient } from "../../src/index.js";

const shouldRun = process.env["RUN_INTEGRATION"] === "1";

describe.skipIf(!shouldRun)("YouTube Integration", () => {
  const client = new SociolodClient({ timeout: 20_000, retries: 1 });

  it("youtube.search.search returns results", async () => {
    const results = await client.youtube.search.search("lofi hip hop", { limit: 3 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("videoId");
    expect(results[0]).toHaveProperty("title");
  });

  it("youtube.search.video returns a single video", async () => {
    const video = await client.youtube.search.video("never gonna give you up");
    expect(video).toHaveProperty("videoId");
    expect(video).toHaveProperty("url");
  });

  it("youtube.search.channel returns channel info", async () => {
    const channel = await client.youtube.search.channel("Rick Astley");
    expect(channel).toHaveProperty("title");
  });

  it("youtube.download.info returns video metadata", async () => {
    const info = await client.youtube.download.info(
      "https://youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(info).toHaveProperty("videoId");
    expect(info).toHaveProperty("title");
  });
});
