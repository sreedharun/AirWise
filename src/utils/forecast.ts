import { HourlyForecastPoint, ForecastAnalysis } from '../api/types';
import { getAQICategory } from './aqi';
import { sanitizeNumber } from './sanitize';

/**
 * Formats an ISO string (e.g. "2026-11-25T14:00") into a friendly hour label ("2 PM", "9 AM").
 * Preserves the city's local wall-clock time without client timezone shifting.
 */
export function formatHour(isoString: string): string {
  try {
    if (isoString.includes('T')) {
      const timePart = isoString.split('T')[1];
      const hourPart = parseInt(timePart.split(':')[0], 10);
      if (!isNaN(hourPart)) {
        const period = hourPart >= 12 ? 'PM' : 'AM';
        const displayHour = hourPart % 12 === 0 ? 12 : hourPart % 12;
        return `${displayHour} ${period}`;
      }
    }
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

/**
 * Formats a date string into a short day label ("Today", "Tomorrow", "Wed")
 * relative to the city's local reference time.
 */
export function formatDayLabel(isoString: string, reference: Date | string = new Date()): string {
  try {
    const targetDateStr = isoString.slice(0, 10);
    const refDateStr =
      typeof reference === 'string' ? reference.slice(0, 10) : reference.toISOString().slice(0, 10);

    if (targetDateStr === refDateStr) {
      return 'Today';
    }

    // Check tomorrow in city local days
    const refDate = new Date(`${refDateStr}T12:00:00Z`);
    refDate.setUTCDate(refDate.getUTCDate() + 1);
    const tomorrowDateStr = refDate.toISOString().slice(0, 10);

    if (targetDateStr === tomorrowDateStr) {
      return 'Tomorrow';
    }

    const targetDate = new Date(`${targetDateStr}T12:00:00Z`);
    return targetDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  } catch {
    return '';
  }
}

/**
 * Parses raw hourly API data into a validated 48-hour forecast analysis using the city's local time.
 * Calculates optimal outdoor air windows, prevailing trends, and statistical extremes.
 *
 * @param hourly Raw API hourly arrays of time, us_aqi, and pm2_5.
 * @param cityCurrentTime Reference local timestamp in the city.
 * @param timezone City's IANA timezone identifier (e.g. "Asia/Tokyo").
 * @returns Comprehensive ForecastAnalysis object including hourly points and summary text.
 */
export function parseForecastData(
  hourly: {
    time?: string[];
    us_aqi?: (number | null)[];
    pm2_5?: (number | null)[];
  },
  cityCurrentTime?: string | Date,
  timezone?: string
): ForecastAnalysis {
  const times = hourly.time || [];
  const aqis = hourly.us_aqi || [];
  const pm25s = hourly.pm2_5 || [];

  const points: HourlyForecastPoint[] = [];

  // Determine current reference point in the city's timeline
  const refTimeStr =
    typeof cityCurrentTime === 'string'
      ? cityCurrentTime
      : cityCurrentTime instanceof Date
        ? cityCurrentTime.toISOString()
        : new Date().toISOString();

  // Find index corresponding to current or next upcoming hour in the city
  let startIndex = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i] >= refTimeStr.slice(0, 13)) {
      startIndex = i;
      break;
    }
  }

  // Slice next 48 hours
  const endIndex = Math.min(times.length, startIndex + 48);

  for (let i = startIndex; i < endIndex; i++) {
    const timeStr = times[i];
    if (!timeStr) continue;

    const rawAqi = aqis[i];
    const rawPm25 = pm25s[i];

    const safeAqi = sanitizeNumber(rawAqi, 25, 0, 500);
    const safePm25 = sanitizeNumber(rawPm25, 5, 0, 1000);
    const timestamp = new Date(timeStr).getTime();

    points.push({
      time: timeStr,
      timestamp,
      formattedTime: formatHour(timeStr),
      dayLabel: formatDayLabel(timeStr, refTimeStr),
      usAqi: Math.round(safeAqi),
      pm2_5: Number(safePm25.toFixed(1)),
      category: getAQICategory(safeAqi),
    });
  }

  // Fallback if data is empty
  if (points.length === 0) {
    const fallbackPoint: HourlyForecastPoint = {
      time: new Date().toISOString(),
      timestamp: Date.now(),
      formattedTime: 'Now',
      dayLabel: 'Today',
      usAqi: 25,
      pm2_5: 5.0,
      category: 'good',
    };
    return {
      points: [fallbackPoint],
      minAqiPoint: fallbackPoint,
      maxAqiPoint: fallbackPoint,
      averageAqi: 25,
      trend: 'stable',
      bestWindowText: 'Air quality is expected to remain consistent.',
      timezone,
    };
  }

  // Find min and max points
  let minPoint = points[0];
  let maxPoint = points[0];
  let sumAqi = 0;

  for (const pt of points) {
    sumAqi += pt.usAqi;
    if (pt.usAqi < minPoint.usAqi) {
      minPoint = pt;
    }
    if (pt.usAqi > maxPoint.usAqi) {
      maxPoint = pt;
    }
  }

  const averageAqi = Math.round(sumAqi / points.length);

  // Compute trend (first 12h average vs last 12h average)
  const firstSlice = points.slice(0, Math.min(12, points.length));
  const lastSlice = points.slice(Math.max(0, points.length - 12));
  const firstAvg = firstSlice.reduce((acc, p) => acc + p.usAqi, 0) / (firstSlice.length || 1);
  const lastAvg = lastSlice.reduce((acc, p) => acc + p.usAqi, 0) / (lastSlice.length || 1);

  let trend: 'improving' | 'worsening' | 'stable' = 'stable';
  if (lastAvg < firstAvg - 10) {
    trend = 'improving';
  } else if (lastAvg > firstAvg + 10) {
    trend = 'worsening';
  }

  // Construct best window sentence reflecting the city's local time
  const bestDay = minPoint.dayLabel ? minPoint.dayLabel.toLowerCase() : 'soon';
  const bestWindowText = `Air quality is best ${
    bestDay === 'today' ? 'today' : bestDay === 'tomorrow' ? 'tomorrow' : `on ${minPoint.dayLabel}`
  } around ${minPoint.formattedTime} local time (AQI ${minPoint.usAqi}).`;

  return {
    points,
    minAqiPoint: minPoint,
    maxAqiPoint: maxPoint,
    averageAqi,
    trend,
    bestWindowText,
    timezone,
  };
}
