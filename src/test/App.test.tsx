import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';
import * as airQualityApi from '../api/airQuality';
import { AirQualityData } from '../api/types';
import { createPollutantBreakdown } from '../utils/aqi';

const mockResponse: AirQualityData = {
  location: {
    name: 'New York',
    admin1: 'New York',
    country: 'United States',
    latitude: 40.71,
    longitude: -74.0,
  },
  current: {
    time: '2026-11-25T10:00',
    usAqi: 35,
    categoryLevel: 'good',
    categoryName: 'Good',
    categoryColor: '#15803d',
    categoryBgColor: '#f0fdf4',
    categoryTextColor: '#14532d',
    categoryPattern: 'pattern-good',
    categoryIcon: '🌿',
    summary: 'Air quality is satisfactory and poses little or no health risk.',
    pollutants: createPollutantBreakdown({
      pm2_5: 7.2,
      pm10: 14.0,
      ozone: 20.0,
      nitrogen_dioxide: 15.0,
      carbon_monoxide: 200,
      sulphur_dioxide: 3.0,
    }),
  },
  forecast: {
    points: [
      {
        time: '2026-11-25T10:00:00Z',
        timestamp: 1000,
        formattedTime: '10 AM',
        dayLabel: 'Today',
        usAqi: 35,
        pm2_5: 7.2,
        category: 'good',
      },
    ],
    minAqiPoint: {
      time: '2026-11-25T10:00:00Z',
      timestamp: 1000,
      formattedTime: '10 AM',
      dayLabel: 'Today',
      usAqi: 35,
      pm2_5: 7.2,
      category: 'good',
    },
    maxAqiPoint: {
      time: '2026-11-25T10:00:00Z',
      timestamp: 1000,
      formattedTime: '10 AM',
      dayLabel: 'Today',
      usAqi: 35,
      pm2_5: 7.2,
      category: 'good',
    },
    averageAqi: 35,
    trend: 'stable',
    bestWindowText: 'Air quality is best today around 10 AM (AQI 35).',
  },
  lastUpdated: '10:00 AM',
  isCached: false,
};

describe('App Component Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and renders default city data and health advice', async () => {
    vi.spyOn(airQualityApi, 'fetchAirQuality').mockResolvedValue(mockResponse);

    render(<App />);

    // Screen reader skip link
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'New York' })).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getAllByText('Good').length).toBeGreaterThan(0);
    });

    // Wait for lazy-loaded forecast chart to resolve
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: /48-hour air quality forecast/i })
      ).toBeInTheDocument();
    });

    // Verify medical disclaimer is present
    expect(screen.getByLabelText(/medical disclaimer/i)).toBeInTheDocument();
  });

  it('switches health vulnerability group and re-renders tailored advice', async () => {
    vi.spyOn(airQualityApi, 'fetchAirQuality').mockResolvedValue(mockResponse);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'New York' })).toBeInTheDocument();
    });

    // Click "Outdoor Athletes" group tab
    const athleteTab = screen.getByRole('radio', { name: /outdoor athletes/i });
    fireEvent.click(athleteTab);

    expect(athleteTab).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByText(/runners, cyclists, and outdoor workers breathing high air volumes/i)
    ).toBeInTheDocument();
  });

  it('renders error banner when API fetch fails with retry option', async () => {
    vi.spyOn(airQualityApi, 'fetchAirQuality').mockRejectedValue(
      new Error('Network error occurred')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });
});
