import React, { useState } from 'react';
import { GeoLocation, UserGroup } from './api/types';
import { useAirQuality } from './hooks/useAirQuality';
import { useGeolocation } from './hooks/useGeolocation';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { GroupSelector } from './components/GroupSelector';
import { CurrentAQICard } from './components/CurrentAQICard';
import { AssistantPanel } from './components/AssistantPanel';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorBanner } from './components/ErrorBanner';
import { EmptyState } from './components/EmptyState';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DEFAULT_INITIAL_CITY } from './utils/constants';

// Lazy-load the 48-hour forecast chart for efficiency and code-splitting
const ForecastChart = React.lazy(() =>
  import('./components/ForecastChart').then((m) => ({ default: m.ForecastChart }))
);

const DEFAULT_CITY: GeoLocation = DEFAULT_INITIAL_CITY;

export const App: React.FC = () => {
  const [userGroup, setUserGroup] = useState<UserGroup>('general');
  const isOnline = useOnlineStatus();

  const { data, isLoading, error, selectedLocation, selectLocation, refetch } =
    useAirQuality(DEFAULT_CITY);

  const {
    isLoading: isLocating,
    error: locationError,
    getCurrentLocation,
    clearError: clearLocationError,
  } = useGeolocation();

  // Handle "Use my location"
  const handleUseMyLocation = async () => {
    clearLocationError();
    const loc = await getCurrentLocation();
    if (loc) {
      selectLocation(loc);
    }
  };

  // Announce air quality change to screen readers
  const liveAnnouncement = data
    ? `Air quality loaded for ${data.location.name}. Current US AQI is ${data.current.usAqi}, category is ${data.current.categoryName}.`
    : '';

  return (
    <>
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Screen Reader Live Region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <Header isOnline={isOnline} onRefresh={refetch} isLoading={isLoading} />

      <main id="main-content" className="app-container" tabIndex={-1}>
        {/* City Search and Geolocation Controls */}
        <SearchBar
          onSelectLocation={selectLocation}
          onUseLocation={handleUseMyLocation}
          isLocating={isLocating}
          locationError={locationError}
          onClearLocationError={clearLocationError}
          currentLocationName={selectedLocation?.name}
        />

        {/* Health Profile / Vulnerability Group Selector */}
        <GroupSelector selectedGroup={userGroup} onSelectGroup={setUserGroup} />

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Error State */}
        {!isLoading && error && <ErrorBanner message={error} onRetry={refetch} />}

        {/* Empty State */}
        {!isLoading && !error && !data && (
          <EmptyState
            onSelectSampleCity={() =>
              selectLocation({
                name: 'Paris',
                country: 'France',
                admin1: 'Île-de-France',
                latitude: 48.8566,
                longitude: 2.3522,
              })
            }
          />
        )}

        {/* Loaded Data View */}
        {!isLoading && !error && data && (
          <div className="results-container">
            {/* Current AQI Hero & Pollutants */}
            <CurrentAQICard data={data} />

            {/* 48-Hour Forecast with Best Time Highlight & Accessible Table (Lazy-loaded) */}
            <ErrorBoundary
              fallback={
                <div className="error-banner" style={{ margin: '1rem 0', padding: '1rem' }}>
                  <p>Unable to display the forecast chart at this time.</p>
                </div>
              }
            >
              <React.Suspense fallback={<div className="skeleton-block chart" aria-busy="true" />}>
                <ForecastChart forecast={data.forecast} />
              </React.Suspense>
            </ErrorBoundary>

            {/* Rule-Based Deterministic Assistant & Inquiry Panel */}
            <AssistantPanel
              aqi={data.current.usAqi}
              userGroup={userGroup}
              locationName={data.location.name}
            />

            {/* Health and Medical Disclaimer */}
            <MedicalDisclaimer />
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default App;
