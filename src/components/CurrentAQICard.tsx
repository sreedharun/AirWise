import React from 'react';
import { AirQualityData } from '../api/types';
import { PollutantCard } from './PollutantCard';

interface CurrentAQICardProps {
  data: AirQualityData;
}

export const CurrentAQICard: React.FC<CurrentAQICardProps> = ({ data }) => {
  const { current, location, lastUpdated, isCached } = data;

  const locationSubtitle = [location.admin1, location.country].filter(Boolean).join(', ');

  return (
    <article className="current-aqi-card" aria-labelledby="current-aqi-heading" aria-live="polite">
      {/* Location Banner */}
      <div className="location-header-row">
        <div>
          <h2 id="current-aqi-heading" className="location-city-title">
            {location.name}
          </h2>
          {locationSubtitle && <p className="location-subtitle">{locationSubtitle}</p>}
        </div>
        <div className="update-meta-badge">
          {isCached && (
            <span className="cached-badge" title="Data served from fast local cache">
              <span aria-hidden="true">⚡</span> Cached
            </span>
          )}
          <span className="last-updated-text">Updated {lastUpdated}</span>
        </div>
      </div>

      {/* Main AQI Status Hero with Colorblind Pattern & Icon */}
      <div
        className={`aqi-hero-banner ${current.categoryPattern}`}
        style={{
          backgroundColor: current.categoryBgColor,
          borderColor: current.categoryColor,
          color: current.categoryTextColor,
        }}
      >
        <div className="aqi-hero-content">
          <div className="aqi-score-container">
            <span className="aqi-number-label">US AQI</span>
            <span className="aqi-number-display">{current.usAqi}</span>
          </div>

          <div className="aqi-category-container">
            <div className="category-badge-row">
              <span className="category-icon" aria-hidden="true">
                {current.categoryIcon}
              </span>
              <span className="category-name-badge">{current.categoryName}</span>
            </div>
            <p className="category-summary-text">{current.summary}</p>
          </div>
        </div>

        {/* Tactile AQI Scale Progress Bar */}
        <div className="aqi-gauge-track" aria-hidden="true">
          <div
            className="aqi-gauge-marker"
            style={{
              left: `${Math.min(100, Math.max(0, (current.usAqi / 300) * 100))}%`,
              backgroundColor: current.categoryColor,
            }}
          />
        </div>
        <div className="aqi-gauge-scale" aria-hidden="true">
          <span>0 (Good)</span>
          <span>50 (Moderate)</span>
          <span>100 (Sensitive)</span>
          <span>150 (Unhealthy)</span>
          <span>200 (Very Unhealthy)</span>
          <span>300+ (Hazardous)</span>
        </div>
      </div>

      {/* Pollutant Breakdown Header */}
      <div className="pollutants-section-header">
        <h3 className="pollutants-section-title">Key Atmospheric Pollutants</h3>
        <span className="pollutants-caption">Real-time sensor measurements & health impacts</span>
      </div>

      {/* Pollutants Grid: PM2.5, PM10, NO2, O3, CO, SO2 */}
      <div className="pollutants-grid" role="region" aria-label="Detailed pollutant concentrations">
        <PollutantCard pollutant={current.pollutants.pm2_5} />
        <PollutantCard pollutant={current.pollutants.pm10} />
        <PollutantCard pollutant={current.pollutants.ozone} />
        <PollutantCard pollutant={current.pollutants.nitrogen_dioxide} />
        <PollutantCard pollutant={current.pollutants.carbon_monoxide} />
        <PollutantCard pollutant={current.pollutants.sulphur_dioxide} />
      </div>
    </article>
  );
};
