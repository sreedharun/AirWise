import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForecastChart } from '../components/ForecastChart';
import { ForecastAnalysis } from '../api/types';

const mockForecast: ForecastAnalysis = {
  points: [
    {
      time: '2026-11-25T10:00:00Z',
      timestamp: 1000,
      formattedTime: '10 AM',
      dayLabel: 'Today',
      usAqi: 45,
      pm2_5: 9.2,
      category: 'good',
    },
    {
      time: '2026-11-25T11:00:00Z',
      timestamp: 2000,
      formattedTime: '11 AM',
      dayLabel: 'Today',
      usAqi: 30,
      pm2_5: 6.1,
      category: 'good',
    },
    {
      time: '2026-11-25T12:00:00Z',
      timestamp: 3000,
      formattedTime: '12 PM',
      dayLabel: 'Today',
      usAqi: 65,
      pm2_5: 18.4,
      category: 'moderate',
    },
  ],
  minAqiPoint: {
    time: '2026-11-25T11:00:00Z',
    timestamp: 2000,
    formattedTime: '11 AM',
    dayLabel: 'Today',
    usAqi: 30,
    pm2_5: 6.1,
    category: 'good',
  },
  maxAqiPoint: {
    time: '2026-11-25T12:00:00Z',
    timestamp: 3000,
    formattedTime: '12 PM',
    dayLabel: 'Today',
    usAqi: 65,
    pm2_5: 18.4,
    category: 'moderate',
  },
  averageAqi: 46,
  trend: 'stable',
  bestWindowText: 'Air quality is best today around 11 AM local time (AQI 30).',
};

describe('ForecastChart Component', () => {
  it('renders forecast title, summary text, and SVG chart', () => {
    render(<ForecastChart forecast={mockForecast} />);

    expect(
      screen.getByRole('heading', { name: /48-hour air quality forecast/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/air quality is best today around 11 am local time \(aqi 30\)\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /interactive 48-hour forecast chart/i })
    ).toBeInTheDocument();
  });

  it('toggles metric between US AQI and PM2.5', () => {
    render(<ForecastChart forecast={mockForecast} />);

    const aqiBtn = screen.getByRole('button', { name: 'US AQI' });
    const pm25Btn = screen.getByRole('button', { name: /pm₂\.₅/i });

    expect(aqiBtn).toHaveAttribute('aria-pressed', 'true');
    expect(pm25Btn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(pm25Btn);

    expect(aqiBtn).toHaveAttribute('aria-pressed', 'false');
    expect(pm25Btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles accessible data table view', () => {
    render(<ForecastChart forecast={mockForecast} />);

    const toggleBtn = screen.getByRole('button', { name: /show data table/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('10 AM')).toBeInTheDocument();
    expect(screen.getByText('11 AM')).toBeInTheDocument();
    expect(screen.getByText('12 PM')).toBeInTheDocument();

    // Toggle back to chart
    fireEvent.click(screen.getByRole('button', { name: /show chart/i }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
