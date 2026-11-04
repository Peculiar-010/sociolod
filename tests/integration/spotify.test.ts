import { describe, it, expect } from "vitest";
import { SociolodClient } from "../../src/index.js";

const shouldRun = process.env["RUN_INTEGRATION"] === "1";

describe.skipIf(!shouldRun)("Spotify Integration", () => {
  const client = new SociolodClient({ timeout: 20_000, retries: 1 });

  it("spotify.search.search returns tracks", async () => {
    const tracks = await client.spotify.search.search("blinding lights", { limit: 3 });
    expect(Array.isArray(tracks)).toBe(true);
    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks[0]).toHaveProperty("id");
    expect(tracks[0]).toHaveProperty("name");
  });

  it("spotify.search.song returns a single track", async () => {
    const track = await client.spotify.search.song("shape of you");
    expect(track).toHaveProperty("id");
    expect(track).toHaveProperty("artists");
  });

  it("spotify.download.info returns track metadata", async () => {
    const info = await client.spotify.download.info(
      "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    );
    expect(info).toHaveProperty("id");
    expect(info).toHaveProperty("name");
  });
});
