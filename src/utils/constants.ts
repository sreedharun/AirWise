/**
 * @fileoverview Application-wide constants and configuration values.
 * Centralizes all magic numbers, timeouts, cache TTLs, and API endpoints.
 */

/**
 * Network and API configuration
 */
export const API_CONFIG = {
  GEOCODING_ENDPOINT: 'https://geocoding-api.open-meteo.com/v1/search',
  AIR_QUALITY_ENDPOINT: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  DEFAULT_TIMEOUT_MS: 8000,
  SEARCH_DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_SUGGESTIONS: 6,
} as const;

/**
 * Cache TTL configurations (in milliseconds)
 */
export const CACHE_CONFIG = {
  AIR_QUALITY_TTL_MS: 5 * 60 * 1000, // 5 minutes
  GEOCODING_TTL_MS: 10 * 60 * 1000,  // 10 minutes
  STORAGE_KEY_PREFIX: 'airwise_cache_',
} as const;

/**
 * Geographic validation boundaries
 */
export const GEO_BOUNDS = {
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
} as const;

/**
 * US EPA Air Quality Index scale boundaries
 */
export const AQI_SCALE = {
  MIN: 0,
  MAX: 500,
  LEVELS: {
    GOOD: { min: 0, max: 50 },
    MODERATE: { min: 51, max: 100 },
    UNHEALTHY_SENSITIVE: { min: 101, max: 150 },
    UNHEALTHY: { min: 151, max: 200 },
    VERY_UNHEALTHY: { min: 201, max: 300 },
    HAZARDOUS: { min: 301, max: 500 },
  },
} as const;

/**
 * Default initial location (New York City)
 */
export const DEFAULT_INITIAL_CITY = {
  name: 'New York',
  country: 'United States',
  admin1: 'New York',
  latitude: 40.7128,
  longitude: -74.006,
} as const;
