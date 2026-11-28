import { fetchWithTimeout } from './client';
import { GeoLocation } from './types';
import { sanitizeSearchQuery, isValidLatitude, isValidLongitude } from '../utils/sanitize';
import { CacheService } from '../utils/cache';

interface OpenMeteoGeoResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[];
}

/**
 * Searches for cities by name using Open-Meteo Geocoding API.
 */
export async function searchCities(query: string, signal?: AbortSignal): Promise<GeoLocation[]> {
  const sanitized = sanitizeSearchQuery(query);
  if (!sanitized || sanitized.length < 2) {
    return [];
  }

  const cacheKey = `geo_${sanitized.toLowerCase()}`;
  const cached = CacheService.get<GeoLocation[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    sanitized
  )}&count=6&language=en&format=json`;

  const data = await fetchWithTimeout<OpenMeteoGeoResponse>(url, { signal, timeoutMs: 6000 });

  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  // Validate and sanitize every returned record
  const validated: GeoLocation[] = data.results
    .filter((item): item is OpenMeteoGeoResult => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        isValidLatitude(item.latitude) &&
        isValidLongitude(item.longitude)
      );
    })
    .map((item) => ({
      id: item.id,
      name: item.name.trim(),
      latitude: Number(item.latitude.toFixed(4)),
      longitude: Number(item.longitude.toFixed(4)),
      country: item.country ? item.country.trim() : undefined,
      admin1: item.admin1 ? item.admin1.trim() : undefined,
    }));

  // Cache results for 10 minutes (geography rarely changes)
  CacheService.set(cacheKey, validated, 10 * 60 * 1000);

  return validated;
}
