import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-title">About AirWise</h4>
            <p className="footer-desc">
              An urban air quality intelligence assistant created for rapid, accessible
              comprehension of particulate matter, ozone, and meteorological pollution data.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Data Sources & Attribution</h4>
            <p className="footer-desc">
              Atmospheric readings and forecasts are powered by{' '}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Open-Meteo Air Quality & Geocoding APIs
              </a>
              . Open data under CC BY 4.0.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Accessibility & Security</h4>
            <p className="footer-desc">
              Engineered according to <strong>WCAG 2.1 AA</strong> standards with colorblind-safe
              patterns, keyboard navigation, and aria-live announcements. Strict Content Security
              Policy and zero external user tracking.
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>
            © {new Date().getFullYear()} AirWise — Urban Air Quality Assistant. Built with Vite,
            React & TypeScript.
          </p>
        </div>
      </div>
    </footer>
  );
};
