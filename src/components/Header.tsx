import React from 'react';

interface HeaderProps {
  isOnline: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isOnline, onRefresh, isLoading }) => {
  return (
    <header className="site-header" role="banner">
      <div className="header-content">
        <div className="brand-group">
          <div className="brand-logo" aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              <path d="M6 14h6" />
              <path d="M4 17h10" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">AirWise</h1>
            <p className="brand-subtitle">Urban Air Quality Assistant & Health Advisor</p>
          </div>
        </div>

        <div className="header-actions">
          {!isOnline && (
            <div className="offline-pill" role="status" aria-live="polite">
              <span className="offline-dot" aria-hidden="true"></span>
              <span>Offline Mode (Cached Data)</span>
            </div>
          )}

          {onRefresh && (
            <button
              type="button"
              className="refresh-btn"
              onClick={onRefresh}
              disabled={isLoading || !isOnline}
              aria-label="Refresh air quality data"
              title="Refresh air quality data"
            >
              <svg
                className={`refresh-icon ${isLoading ? 'spinning' : ''}`}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              <span className="btn-text">Refresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
