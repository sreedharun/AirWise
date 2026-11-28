import { fetchWithTimeout } from './client';
import { AirQualityData, GeoLocation } from './types';
import { sanitizeNumber, isValidLatitude, isValidLongitude } from '../utils/sanitize';
import { getAQIConfig, createPollutantBreakdown } from '../utils/aqi';
import { parseForecastData } from '../utils/forecast';
import { CacheService } from '../utils/cache';

interface RawOpenMeteoAirQualityResponse {
  timezone?: string;
  timezone_abbreviation?: string;
  utc_offset_seconds?: number;
  current?: {
    time?: string;
    us_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
  };
  hourly?: {
    time?: string[];
    us_aqi?: (number | null)[];
    pm2_5?: (number | null)[];
  };
}

/**
 * Fetches and validates air quality and forecast data for coordinates.
 */
export async function fetchAirQuality(
  location: GeoLocation,
  signal?: AbortSignal
): Promise<AirQualityData> {
  const { latitude, longitude } = location;

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    throw new Error(`Invalid geographic coordinates provided: [${latitude}, ${longitude}]`);
  }

  // Rounded coordinate cache key (reduces duplicate requests for micro-differences)
  const latKey = latitude.toFixed(2);
  const lonKey = longitude.toFixed(2);
  const cacheKey = `aqi_${latKey}_${lonKey}`;

  const cached = CacheService.get<AirQualityData>(cacheKey);
  if (cached) {
    return {
      ...cached,
      location, // Ensure requested label/country is preserved
      isCached: true,
    };
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=us_aqi,pm2_5&forecast_days=3&timezone=auto`;

  const rawData = await fetchWithTimeout<RawOpenMeteoAirQualityResponse>(url, {
    signal,
    timeoutMs: 8000,
  });

  const rawCurrent = rawData.current || {};
  const rawHourly = rawData.hourly || {};

  // Validate and sanitize current values
  const safeUsAqi = Math.round(sanitizeNumber(rawCurrent.us_aqi, 30, 0, 500));
  const safePm25 = sanitizeNumber(rawCurrent.pm2_5, 5, 0, 1000);
  const safePm10 = sanitizeNumber(rawCurrent.pm10, 10, 0, 1000);
  const safeNo2 = sanitizeNumber(rawCurrent.nitrogen_dioxide, 15, 0, 1000);
  const safeO3 = sanitizeNumber(rawCurrent.ozone, 20, 0, 1000);
  const safeCo = sanitizeNumber(rawCurrent.carbon_monoxide, 250, 0, 50000);
  const safeSo2 = sanitizeNumber(rawCurrent.sulphur_dioxide, 5, 0, 1000);

  const aqiConfig = getAQIConfig(safeUsAqi);
  const pollutants = createPollutantBreakdown({
    pm2_5: safePm25,
    pm10: safePm10,
    nitrogen_dioxide: safeNo2,
    ozone: safeO3,
    carbon_monoxide: safeCo,
    sulphur_dioxide: safeSo2,
  });

  const forecast = parseForecastData(rawHourly, rawCurrent.time, rawData.timezone);

  const result: AirQualityData = {
    location,
    current: {
      time: rawCurrent.time || new Date().toISOString(),
      usAqi: safeUsAqi,
      categoryLevel: aqiConfig.level,
      categoryName: aqiConfig.name,
      categoryColor: aqiConfig.color,
      categoryBgColor: aqiConfig.bgColor,
      categoryTextColor: aqiConfig.textColor,
      categoryPattern: aqiConfig.pattern,
      categoryIcon: aqiConfig.icon,
      summary: aqiConfig.summary,
      pollutants,
    },
    forecast,
    lastUpdated: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    isCached: false,
    timezone: rawData.timezone,
  };

  // Cache for 5 minutes
  CacheService.set(cacheKey, result, 5 * 60 * 1000);

  return result;
}
