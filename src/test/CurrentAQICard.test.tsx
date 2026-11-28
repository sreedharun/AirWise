import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrentAQICard } from '../components/CurrentAQICard';
import { AirQualityData } from '../api/types';
import { createPollutantBreakdown } from '../utils/aqi';

const mockData: AirQualityData = {
  location: {
    name: 'San Francisco',
    admin1: 'California',
    country: 'United States',
    latitude: 37.77,
    longitude: -122.41,
  },
  current: {
    time: '2026-11-25T10:00',
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
      pm2_5: 8.5,
      pm10: 16.2,
      ozone: 24.0,
      nitrogen_dioxide: 12.1,
      carbon_monoxide: 180,
      sulphur_dioxide: 2.1,
    }),
  },
  forecast: {
    points: [],
    minAqiPoint: {
      time: '2026-11-25T10:00',
      timestamp: 1000,
      formattedTime: '10 AM',
      dayLabel: 'Today',
      usAqi: 42,
      pm2_5: 8.5,
      category: 'good',
    },
    maxAqiPoint: {
      time: '2026-11-25T10:00',
      timestamp: 1000,
      formattedTime: '10 AM',
      dayLabel: 'Today',
      usAqi: 42,
      pm2_5: 8.5,
      category: 'good',
    },
    averageAqi: 42,
    trend: 'stable',
    bestWindowText: 'Air quality is expected to remain consistent.',
  },
  lastUpdated: '10:00 AM',
  isCached: true,
};

describe('CurrentAQICard Component', () => {
  it('renders city name, country, and US AQI score', () => {
    render(<CurrentAQICard data={mockData} />);

    expect(screen.getByRole('heading', { level: 2, name: /san francisco/i })).toBeInTheDocument();
    expect(screen.getByText(/california, united states/i)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getAllByText('Good').length).toBeGreaterThan(0);
    expect(screen.getByText(/cached/i)).toBeInTheDocument();
  });

  it('renders all 6 pollutant cards with units and threshold standards', () => {
    render(<CurrentAQICard data={mockData} />);

    expect(screen.getByText('PM₂.₅')).toBeInTheDocument();
    expect(screen.getByText('PM₁₀')).toBeInTheDocument();
    expect(screen.getByText('O₃')).toBeInTheDocument();
    expect(screen.getByText('NO₂')).toBeInTheDocument();
    expect(screen.getByText('CO')).toBeInTheDocument();
    expect(screen.getByText('SO₂')).toBeInTheDocument();

    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('expands pollutant health effect description when button is clicked', () => {
    render(<CurrentAQICard data={mockData} />);

    const toggleButtons = screen.getAllByRole('button', { name: /what is this\?/i });
    expect(toggleButtons.length).toBe(6);

    fireEvent.click(toggleButtons[0]);

    expect(screen.getByText(/small enough to pass directly into lung tissue/i)).toBeInTheDocument();
  });
});
