import { CACHE_CONFIG } from './constants';

/**
 * In-memory and sessionStorage cache with TTL (Time To Live).
 * Facilitates quick offline retrieval and avoids redundant network calls.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();

/**
 * Service managing two-tier memory and sessionStorage caching with TTL expiration.
 */
export class CacheService {
  private static prefix = CACHE_CONFIG.STORAGE_KEY_PREFIX;

  /**
   * Retrieves an item from cache if not expired.
   *
   * @template T Expected cached data type.
   * @param key Identifier key.
   * @returns Cached value if valid, or null if expired/missing.
   */
  public static get<T>(key: string): T | null {
    const fullKey = `${this.prefix}${key}`;
    const now = Date.now();

    // Check memory store first
    const memItem = memoryStore.get(fullKey);
    if (memItem) {
      if (now < memItem.expiry) {
        return memItem.data as T;
      }
      memoryStore.delete(fullKey);
    }

    // Check sessionStorage fallback
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const itemStr = window.sessionStorage.getItem(fullKey);
        if (!itemStr) return null;

        const parsed: CacheEntry<T> = JSON.parse(itemStr);
        if (now < parsed.expiry) {
          // Warm up memory cache
          memoryStore.set(fullKey, parsed);
          return parsed.data;
        }
        window.sessionStorage.removeItem(fullKey);
      }
    } catch {
      // Storage might be unavailable or disabled (e.g., private browsing)
    }

    return null;
  }

  /**
   * Stores an item into memory and sessionStorage.
   *
   * @template T Data payload type.
   * @param key Identifier key.
   * @param data Payload to store.
   * @param ttlMs Time-to-live duration in milliseconds.
   */
  public static set<T>(
    key: string,
    data: T,
    ttlMs: number = CACHE_CONFIG.AIR_QUALITY_TTL_MS
  ): void {
    const fullKey = `${this.prefix}${key}`;
    const expiry = Date.now() + ttlMs;
    const entry: CacheEntry<T> = { data, expiry };

    // Set in memory
    memoryStore.set(fullKey, entry);

    // Set in sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(fullKey, JSON.stringify(entry));
      }
    } catch {
      // Silently catch quota exceeded or storage disabled
    }
  }

  /**
   * Clears all AirWise cached items.
   */
  public static clear(): void {
    memoryStore.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith(this.prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
      }
    } catch {
      // Storage error handling
    }
  }
}
