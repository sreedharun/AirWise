import React from 'react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="error-banner" role="alert">
      <div className="error-icon" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="error-text-content">
        <h3 className="error-title">Unable to Load Air Quality</h3>
        <p className="error-message">{message}</p>
      </div>

      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};
