import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import 'vitest-axe/extend-expect';
import App from '../App';
import * as airQualityApi from '../api/airQuality';
import { AirQualityData } from '../api/types';
import { createPollutantBreakdown } from '../utils/aqi';
import { CurrentAQICard } from '../components/CurrentAQICard';
import { ForecastChart } from '../components/ForecastChart';
import { AssistantPanel } from '../components/AssistantPanel';

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
      {
        time: '2026-11-25T11:00:00Z',
        timestamp: 2000,
        formattedTime: '11 AM',
        dayLabel: 'Today',
        usAqi: 28,
        pm2_5: 5.8,
        category: 'good',
      },
    ],
    minAqiPoint: {
      time: '2026-11-25T11:00:00Z',
      timestamp: 2000,
      formattedTime: '11 AM',
      dayLabel: 'Today',
      usAqi: 28,
      pm2_5: 5.8,
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
    averageAqi: 31,
    trend: 'stable',
    bestWindowText: 'Air quality is best today around 11 AM local time (AQI 28).',
  },
  lastUpdated: '10:00 AM',
  isCached: false,
};

describe('WCAG 2.1 AA Automated Accessibility (vitest-axe)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies the main application screen has zero accessibility violations', async () => {
    vi.spyOn(airQualityApi, 'fetchAirQuality').mockResolvedValue(mockResponse);

    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('.results-container')).toBeInTheDocument();
      expect(container.querySelector('.forecast-section')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies CurrentAQICard has zero accessibility violations', async () => {
    const { container } = render(<CurrentAQICard data={mockResponse} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies ForecastChart has zero accessibility violations', async () => {
    const { container } = render(<ForecastChart forecast={mockResponse.forecast} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies AssistantPanel has zero accessibility violations', async () => {
    const { container } = render(
      <AssistantPanel aqi={75} userGroup="general" locationName="New York" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
