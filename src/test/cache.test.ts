import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../utils/cache';

describe('CacheService', () => {
  beforeEach(() => {
    CacheService.clear();
  });

  it('stores and retrieves data before TTL expiry', () => {
    CacheService.set('city_test', { name: 'Berlin', aqi: 45 }, 5000);
    const cached = CacheService.get<{ name: string; aqi: number }>('city_test');
    expect(cached).toEqual({ name: 'Berlin', aqi: 45 });
  });

  it('returns null for nonexistent keys', () => {
    const cached = CacheService.get('nonexistent');
    expect(cached).toBeNull();
  });

  it('returns null and removes item after expiry', async () => {
    CacheService.set('short_lived', 'data', -100); // Expired immediately
    const cached = CacheService.get('short_lived');
    expect(cached).toBeNull();
  });

  it('clears all cached entries', () => {
    CacheService.set('key1', 123);
    CacheService.set('key2', 456);
    CacheService.clear();

    expect(CacheService.get('key1')).toBeNull();
    expect(CacheService.get('key2')).toBeNull();
  });
});
