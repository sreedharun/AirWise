import { describe, it, expect } from 'vitest';
import { parseForecastData, formatHour, formatDayLabel } from '../utils/forecast';

describe('Forecast Utilities', () => {
  const mockNow = new Date('2026-11-25T10:00:00Z');

  const generateMockHourly = (count = 72) => {
    const times: string[] = [];
    const aqis: number[] = [];
    const pm25s: number[] = [];

    for (let i = 0; i < count; i++) {
      const d = new Date(mockNow.getTime() + i * 3600 * 1000);
      times.push(d.toISOString());
      // AQI starts at 60 and dips to 20 at hour 20
      aqis.push(i === 20 ? 18 : 50 + (i % 15));
      pm25s.push(10 + (i % 5));
    }

    return { time: times, us_aqi: aqis, pm2_5: pm25s };
  };

  it('slices exactly 48 hourly forecast points', () => {
    const hourly = generateMockHourly(72);
    const result = parseForecastData(hourly, mockNow);

    expect(result.points.length).toBe(48);
  });

  it('identifies min and max AQI forecast point and constructs best window text', () => {
    const hourly = generateMockHourly(72);
    const result = parseForecastData(hourly, mockNow);

    expect(result.minAqiPoint.usAqi).toBe(18);
    expect(result.bestWindowText).toContain('Air quality is best');
    expect(result.bestWindowText).toContain('18');
    expect(result.bestWindowText).toContain('local time');
  });

  it('detects improving trend when late hours have lower AQI', () => {
    const times: string[] = [];
    const aqis: number[] = [];
    const pm25s: number[] = [];

    for (let i = 0; i < 48; i++) {
      const d = new Date(mockNow.getTime() + i * 3600 * 1000);
      times.push(d.toISOString());
      // Starts at 120 and improves to 30
      aqis.push(i < 12 ? 120 : 30);
      pm25s.push(20);
    }

    const result = parseForecastData({ time: times, us_aqi: aqis, pm2_5: pm25s }, mockNow);
    expect(result.trend).toBe('improving');
  });

  it('falls back gracefully when hourly data is empty', () => {
    const result = parseForecastData({}, mockNow);
    expect(result.points).toHaveLength(1);
    expect(result.points[0].usAqi).toBe(25);
  });

  describe('Date/Time formatting', () => {
    it('formats day label correctly for Today and Tomorrow', () => {
      const todayIso = mockNow.toISOString();
      const tomorrowDate = new Date(mockNow.getTime() + 24 * 3600 * 1000);

      expect(formatDayLabel(todayIso, mockNow)).toBe('Today');
      expect(formatDayLabel(tomorrowDate.toISOString(), mockNow)).toBe('Tomorrow');
    });

    it('formats hour string without throwing', () => {
      const formatted = formatHour('2026-11-25T14:00:00Z');
      expect(formatted).toBeTruthy();
    });
  });
});
