import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAirQuality } from '../hooks/useAirQuality';
import * as airQualityApi from '../api/airQuality';
import { AirQualityData, GeoLocation, HourlyForecastPoint } from '../api/types';
import { createPollutantBreakdown } from '../utils/aqi';

describe('useAirQuality hook', () => {
  const mockLocation: GeoLocation = {
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
  };

  const samplePoint: HourlyForecastPoint = {
    time: '2026-11-28T12:00:00Z',
    timestamp: 1000,
    formattedTime: '12 PM',
    dayLabel: 'Today',
    usAqi: 42,
    pm2_5: 10.2,
    category: 'good',
  };

  const mockData: AirQualityData = {
    location: mockLocation,
    current: {
      time: '2026-11-28T12:00',
      usAqi: 42,
      categoryLevel: 'good',
      categoryName: 'Good',
      categoryColor: '#15803d',
      categoryBgColor: '#f0fdf4',
      categoryTextColor: '#14532d',
      categoryPattern: 'pattern-good',
      categoryIcon: '🌿',
      summary: 'Air quality is satisfactory and poses little or no health risk.',
      pollutants: createPollutantBreakdown({
        pm2_5: 10.2,
        pm10: 18.0,
        nitrogen_dioxide: 15.0,
        ozone: 25.0,
        carbon_monoxide: 300,
        sulphur_dioxide: 4.0,
      }),
    },
    forecast: {
      points: [samplePoint],
      minAqiPoint: samplePoint,
      maxAqiPoint: samplePoint,
      averageAqi: 42,
      trend: 'improving',
      bestWindowText: 'Air quality is best tomorrow morning',
    },
    isCached: false,
    lastUpdated: '12:00 PM',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with loading state and resolves data on mount', async () => {
    vi.spyOn(airQualityApi, 'fetchAirQuality').mockResolvedValue(mockData);

    const { result } = renderHook(() => useAirQuality(mockLocation));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles API fetch errors gracefully', async () => {
    vi.spyOn(airQualityApi, 'fetchAirQuality').mockRejectedValue(
      new Error('Failed to reach atmospheric API')
    );

    const { result } = renderHook(() => useAirQuality(mockLocation));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain('Failed to reach atmospheric API');
    expect(result.current.data).toBeNull();
  });

  it('supports selecting a new location and triggering a fresh fetch', async () => {
    vi.spyOn(airQualityApi, 'fetchAirQuality').mockResolvedValue(mockData);

    const { result } = renderHook(() => useAirQuality(mockLocation));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newLocation: GeoLocation = {
      name: 'London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
    };

    act(() => {
      result.current.selectLocation(newLocation);
    });

    expect(result.current.selectedLocation).toEqual(newLocation);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('triggers manual refetch when refetch is called', async () => {
    const fetchSpy = vi.spyOn(airQualityApi, 'fetchAirQuality').mockResolvedValue(mockData);

    const { result } = renderHook(() => useAirQuality(mockLocation));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
