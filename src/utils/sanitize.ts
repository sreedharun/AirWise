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
 * Validates latitude value (-90 to 90).
 */
export function isValidLatitude(lat: unknown): lat is number {
  return typeof lat === 'number' && Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validates longitude value (-180 to 180).
 */
export function isValidLongitude(lon: unknown): lon is number {
  return typeof lon === 'number' && Number.isFinite(lon) && lon >= -180 && lon <= 180;
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
