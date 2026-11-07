import { describe, expect, it } from "vitest";
import { SociolodClient } from "../../src/client.js";

describe("SociolodClient", () => {
  it("creates all service clients with default configuration", () => {
    const client = new SociolodClient();

    expect(client.youtube.search).toBeDefined();
    expect(client.youtube.download).toBeDefined();
    expect(client.spotify.search).toBeDefined();
    expect(client.spotify.download).toBeDefined();
    expect(() => client.clearCache()).not.toThrow();
  });

  it("applies custom configuration and initializes the optional cache", () => {
    const client = new SociolodClient({
      baseUrl: "https://custom.example.com",
      timeout: 5000,
      retries: 1,
      retryDelay: 25,
      headers: { Authorization: "Bearer test-token" },
      cache: {
        enabled: true,
        ttl: 1000,
        maxSize: 10,
      },
    });

    expect(client.youtube.search).toBeDefined();
    expect(client.spotify.download).toBeDefined();
    expect(() => client.clearCache()).not.toThrow();
  });

  it("uses the no-op cache when caching is explicitly disabled", () => {
    const client = new SociolodClient({
      cache: { enabled: false },
    });

    expect(() => client.clearCache()).not.toThrow();
  });
});
