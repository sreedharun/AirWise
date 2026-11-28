import { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Props for ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State for ErrorBoundary component.
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches runtime JavaScript errors in child component trees,
 * logs them, and displays an accessible fallback recovery interface instead of white-screening.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // In production, error telemetry can be sent here
    console.error('ErrorBoundary caught an unhandled component error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.fallbackCustom) {
        return this.fallbackCustom;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="error-banner"
          style={{
            maxWidth: '600px',
            margin: '3rem auto',
            padding: '2rem',
            textAlign: 'center',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">
            ⚠️
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#b91c1c' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#4b5563', lineHeight: '1.5' }}>
            An unexpected error occurred while rendering this view. Your saved settings are safe.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              className="retry-btn"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              className="retry-btn"
              style={{
                backgroundColor: '#0284c7',
                border: 'none',
                color: '#ffffff',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallbackCustom(): ReactNode {
    return this.props.fallback;
  }
}
