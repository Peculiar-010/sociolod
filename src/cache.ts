import type { CacheConfig, CacheEntry } from "./types/index.js";

const DEFAULT_TTL = 60_000;
const DEFAULT_MAX_SIZE = 100;

/**
 * Simple in-memory LRU cache with TTL-based expiration.
 * Uses a Map to maintain insertion order for eviction.
 */
export class LRUCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly ttl: number;
  private readonly maxSize: number;
  public readonly enabled: boolean;

  constructor(config: CacheConfig) {
    this.enabled = config.enabled;
    this.ttl = config.ttl ?? DEFAULT_TTL;
    this.maxSize = config.maxSize ?? DEFAULT_MAX_SIZE;
  }

  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined;
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    // Refresh position (LRU)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set<T>(key: string, value: T): void {
    if (!this.enabled) return;
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) {
        this.store.delete(firstKey);
      }
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

/** No-op cache for when caching is disabled */
export const noopCache: LRUCache = new LRUCache({ enabled: false });
