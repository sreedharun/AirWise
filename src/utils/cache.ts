/**
 * In-memory and sessionStorage cache with TTL (Time To Live).
 * Facilitates quick offline retrieval and avoids redundant network calls.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class CacheService {
  private static prefix = 'airwise_cache_';

  /**
   * Retrieves an item from cache if not expired.
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
   */
  public static set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
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
