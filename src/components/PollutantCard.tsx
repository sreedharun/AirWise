import React, { useState } from 'react';
import { PollutantInfo } from '../api/types';

interface PollutantCardProps {
  pollutant: PollutantInfo;
}

const STATUS_CONFIG = {
  good: { label: 'Good', icon: '✓', color: '#15803d', bg: '#dcfce7', text: '#14532d' },
  moderate: { label: 'Moderate', icon: '!', color: '#b45309', bg: '#fef3c7', text: '#78350f' },
  unhealthy: { label: 'Unhealthy', icon: '⚠', color: '#b91c1c', bg: '#fee2e2', text: '#7f1d1d' },
  hazardous: { label: 'Hazardous', icon: '☣', color: '#881337', bg: '#ffe4e6', text: '#4c0519' },
};

export const PollutantCard: React.FC<PollutantCardProps> = ({ pollutant }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = STATUS_CONFIG[pollutant.status];

  return (
    <div className="pollutant-card">
      <div className="pollutant-card-header">
        <div>
          <span className="pollutant-formula">{pollutant.formula}</span>
          <span className="pollutant-name">{pollutant.name}</span>
        </div>
        <span
          className="pollutant-status-pill"
          style={{ backgroundColor: status.bg, color: status.text }}
          title={`Status: ${status.label}`}
        >
          <span className="status-symbol" aria-hidden="true">
            {status.icon}
          </span>
          <span>{status.label}</span>
        </span>
      </div>

      <div className="pollutant-value-row">
        <span className="pollutant-number">{pollutant.value}</span>
        <span className="pollutant-unit">{pollutant.unit}</span>
      </div>

      <p className="pollutant-standard">{pollutant.standard}</p>

      <button
        type="button"
        className="pollutant-toggle-btn"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls={`pollutant-info-${pollutant.key}`}
      >
        <span>{isExpanded ? 'Hide Details' : 'What is this?'}</span>
        <span className={`arrow ${isExpanded ? 'open' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {isExpanded && (
        <div id={`pollutant-info-${pollutant.key}`} className="pollutant-details">
          <p className="pollutant-desc">{pollutant.description}</p>
          <p className="pollutant-impact">
            <strong>Health Effect:</strong> {pollutant.healthImpact}
          </p>
        </div>
      )}
    </div>
  );
};
