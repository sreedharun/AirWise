import React from 'react';

interface EmptyStateProps {
  onSelectSampleCity: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSampleCity }) => {
  return (
    <div className="empty-state-card card" role="region" aria-label="Welcome Guide">
      <div className="empty-state-illustration" aria-hidden="true">
        🌍
      </div>
      <h2 className="empty-state-title">Search a City to View Live Air Quality</h2>
      <p className="empty-state-description">
        AirWise gives you instant access to real-time US AQI measurements, 48-hour hourly forecasts,
        and tailored health guidance for your specific activity or vulnerability profile.
      </p>
      <button type="button" className="sample-city-btn" onClick={onSelectSampleCity}>
        Explore Air Quality in Paris
      </button>
    </div>
  );
};
