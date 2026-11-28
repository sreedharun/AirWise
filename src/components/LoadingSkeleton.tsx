import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div
      className="skeleton-container"
      role="status"
      aria-busy="true"
      aria-label="Loading air quality insights..."
    >
      <div className="skeleton-hero-card">
        <div className="skeleton-line title" />
        <div className="skeleton-line subtitle" />
        <div className="skeleton-block hero" />
        <div className="skeleton-grid">
          <div className="skeleton-block item" />
          <div className="skeleton-block item" />
          <div className="skeleton-block item" />
          <div className="skeleton-block item" />
          <div className="skeleton-block item" />
          <div className="skeleton-block item" />
        </div>
      </div>

      <div className="skeleton-block chart" />
      <div className="skeleton-block assistant" />
    </div>
  );
};
