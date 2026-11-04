import { describe, it, expect, vi, afterEach } from "vitest";
import { LRUCache } from "../../src/cache.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("LRUCache", () => {
  it("stores and retrieves values", () => {
    const cache = new LRUCache({ enabled: true, ttl: 60_000 });
    cache.set("key1", { value: 42 });
    expect(cache.get<{ value: number }>("key1")).toEqual({ value: 42 });
  });

  it("returns undefined for missing keys", () => {
    const cache = new LRUCache({ enabled: true });
    expect(cache.get("missing")).toBeUndefined();
  });

  it("returns undefined for expired entries", () => {
    vi.useFakeTimers();
    const cache = new LRUCache({ enabled: true, ttl: 1000 });
    cache.set("key1", "hello");
    vi.advanceTimersByTime(1500);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("does nothing when disabled", () => {
    const cache = new LRUCache({ enabled: false });
    cache.set("key1", "hello");
    expect(cache.get("key1")).toBeUndefined();
  });

  it("evicts oldest entry when at max size", () => {
    const cache = new LRUCache({ enabled: true, maxSize: 2, ttl: 60_000 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3); // Should evict "a"
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
  });

  it("clears all entries", () => {
    const cache = new LRUCache({ enabled: true, ttl: 60_000 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("deletes a specific entry", () => {
    const cache = new LRUCache({ enabled: true, ttl: 60_000 });
    cache.set("a", 1);
    cache.delete("a");
    expect(cache.get("a")).toBeUndefined();
  });
});
