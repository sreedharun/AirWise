import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout } from '../api/client';
import { searchCities } from '../api/geocoding';
import { fetchAirQuality } from '../api/airQuality';
import { CacheService } from '../utils/cache';

describe('API Client & Services', () => {
  beforeEach(() => {
    CacheService.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchWithTimeout', () => {
    it('throws ApiError if URL does not use HTTPS', async () => {
      await expect(fetchWithTimeout('http://insecure-api.com')).rejects.toThrow(
        /all api requests must use https/i
      );
    });

    it('successfully fetches and returns parsed JSON data', async () => {
      const mockJson = { success: true, value: 42 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJson,
      } as Response);

      const result = await fetchWithTimeout<{ success: boolean; value: number }>(
        'https://secure-api.com/data'
      );
      expect(result).toEqual(mockJson);
    });

    it('throws ApiError on HTTP non-200 responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(fetchWithTimeout('https://secure-api.com/notfound')).rejects.toThrow(
        /status 404/i
      );
    });

    it('handles request timeout gracefully and throws TIMEOUT error', async () => {
      // Mock fetch that simulates hanging until timeout aborts
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        return new Promise((_, reject) => {
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              const abortErr = new Error('The operation was aborted');
              abortErr.name = 'AbortError';
              reject(abortErr);
            });
          }
        });
      });

      await expect(
        fetchWithTimeout('https://secure-api.com/slow', { timeoutMs: 20 })
      ).rejects.toThrow(/timed out/i);
    });

    it('handles caller signal cancellation and throws ABORTED error', async () => {
      const controller = new AbortController();
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        return new Promise((_, reject) => {
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              const abortErr = new Error('The operation was aborted');
              abortErr.name = 'AbortError';
              reject(abortErr);
            });
          }
        });
      });

      const fetchPromise = fetchWithTimeout('https://secure-api.com/cancel', {
        signal: controller.signal,
      });
      controller.abort();

      await expect(fetchPromise).rejects.toThrow(/was cancelled/i);
    });

    it('handles generic network error and wraps as NETWORK_ERROR', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('DNS resolution failed'));

      await expect(fetchWithTimeout('https://secure-api.com/dns-fail')).rejects.toThrow(
        /DNS resolution failed/i
      );
    });

    it('handles unknown non-Error rejection and wraps as UNKNOWN_ERROR', async () => {
      global.fetch = vi.fn().mockRejectedValue('String rejection reason');

      await expect(fetchWithTimeout('https://secure-api.com/unknown')).rejects.toThrow(
        /An unknown error occurred/i
      );
    });
  });

  describe('searchCities', () => {
    it('returns empty array for empty or single-character queries without network calls', async () => {
      const spy = vi.spyOn(global, 'fetch');
      const results = await searchCities('a');
      expect(results).toEqual([]);
      expect(spy).not.toHaveBeenCalled();
    });

    it('queries open-meteo geocoding API and sanitizes coordinates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              name: '  Madrid  ',
              latitude: 40.41678,
              longitude: -3.70379,
              country: 'Spain',
              admin1: 'Madrid',
            },
          ],
        }),
      } as Response);

      const results = await searchCities('Madrid');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Madrid');
      expect(results[0].latitude).toBe(40.4168);
      expect(results[0].longitude).toBe(-3.7038);
    });
  });

  describe('fetchAirQuality', () => {
    it('throws if invalid coordinates are supplied', async () => {
      await expect(
        fetchAirQuality({ name: 'Bad Coords', latitude: 999, longitude: 0 })
      ).rejects.toThrow(/invalid geographic coordinates/i);
    });

    it('fetches, parses, and caches air quality data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {
            time: '2026-11-25T11:00',
            us_aqi: 55,
            pm10: 20,
            pm2_5: 14.2,
            carbon_monoxide: 220,
            nitrogen_dioxide: 28,
            sulphur_dioxide: 5,
            ozone: 30,
          },
          hourly: {
            time: ['2026-11-25T11:00', '2026-11-25T12:00'],
            us_aqi: [55, 48],
            pm2_5: [14.2, 11.5],
          },
        }),
      } as Response);

      const data = await fetchAirQuality({
        name: 'Berlin',
        latitude: 52.52,
        longitude: 13.4,
      });

      expect(data.current.usAqi).toBe(55);
      expect(data.current.categoryName).toBe('Moderate');
      expect(data.forecast.points.length).toBeGreaterThan(0);
      expect(data.isCached).toBe(false);

      // Verify second call retrieves from cache
      const cachedData = await fetchAirQuality({
        name: 'Berlin',
        latitude: 52.52,
        longitude: 13.4,
      });
      expect(cachedData.isCached).toBe(true);
    });
  });
});
