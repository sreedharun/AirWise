import { GEO_BOUNDS } from './constants';

/**
 * Input sanitization and security validation utilities.
 * Ensures data passed into the application cannot trigger script injection
 * or cause undefined computation bugs.
 */

/**
 * Sanitizes search query string.
 * Strips script/style tags with contents, strips HTML tags,
 * trims whitespace, limits length to 100 characters.
 * Supports Unicode letters (\p{L}) for international city names.
 *
 * @param query Raw query input of unknown type.
 * @returns Clean, safe alphanumeric string with international character support.
 * @example sanitizeSearchQuery("<script>alert(1)</script>São Paulo") => "São Paulo"
 */
export function sanitizeSearchQuery(query: unknown): string {
  if (typeof query !== 'string') {
    return '';
  }
  return query
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip scripts with body
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Strip styles with body
    .replace(/<[^>]+>/g, '') // Strip remaining HTML tags
    .replace(/[^\p{L}\p{N}\s\-,.']/gu, '') // Safe international letters & punctuation
    .trim()
    .slice(0, 100);
}

/**
 * Validates latitude value (-90 to 90 degrees).
 *
 * @param lat Input value to validate.
 * @returns True if value is a finite number within valid latitude range.
 */
export function isValidLatitude(lat: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    lat >= GEO_BOUNDS.MIN_LATITUDE &&
    lat <= GEO_BOUNDS.MAX_LATITUDE
  );
}

/**
 * Validates longitude value (-180 to 180 degrees).
 *
 * @param lon Input value to validate.
 * @returns True if value is a finite number within valid longitude range.
 */
export function isValidLongitude(lon: unknown): lon is number {
  return (
    typeof lon === 'number' &&
    Number.isFinite(lon) &&
    lon >= GEO_BOUNDS.MIN_LONGITUDE &&
    lon <= GEO_BOUNDS.MAX_LONGITUDE
  );
}

/**
 * Ensures a numerical value from API is valid and within bounds.
 */
export function sanitizeNumber(
  value: unknown,
  fallback: number = 0,
  min: number = 0,
  max: number = 10000
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Validates if an object conforms to basic GeoLocation requirements.
 */
export function isValidLocation(loc: unknown): boolean {
  if (!loc || typeof loc !== 'object') return false;
  const candidate = loc as Record<string, unknown>;
  return (
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0 &&
    isValidLatitude(candidate.latitude) &&
    isValidLongitude(candidate.longitude)
  );
}
