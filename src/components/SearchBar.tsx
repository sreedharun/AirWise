import React, { useState, useEffect, useRef } from 'react';
import { GeoLocation } from '../api/types';
import { searchCities } from '../api/geocoding';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  onSelectLocation: (location: GeoLocation) => void;
  onUseLocation: () => void;
  isLocating?: boolean;
  locationError?: string | null;
  onClearLocationError?: () => void;
  currentLocationName?: string;
}

const POPULAR_CITIES: GeoLocation[] = [
  {
    name: 'New York',
    country: 'United States',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    name: 'London',
    country: 'United Kingdom',
    admin1: 'England',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6895, longitude: 139.6917 },
  { name: 'Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.209 },
  {
    name: 'Paris',
    country: 'France',
    admin1: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    name: 'São Paulo',
    country: 'Brazil',
    admin1: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
  },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  onUseLocation,
  isLocating = false,
  locationError,
  onClearLocationError,
  currentLocationName,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const debouncedQuery = useDebounce(inputValue, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search when debounced query updates
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    searchCities(debouncedQuery, controller.signal)
      .then((results) => {
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setActiveIndex(-1);
        setIsSearching(false);
      })
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && ('code' in err || 'name' in err)) {
          const e = err as { code?: string; name?: string };
          if (e.code === 'ABORTED' || e.name === 'AbortError') return;
        }
        setSuggestions([]);
        setIsOpen(false);
        setIsSearching(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const handleSelect = (location: GeoLocation) => {
    onSelectLocation(location);
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    if (onClearLocationError) onClearLocationError();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <section className="search-section" aria-label="City Search and Location Controls">
      <div className="search-bar-wrapper" ref={containerRef}>
        <div className="search-form-row">
          <div className="input-container">
            <label htmlFor="city-search-input" className="sr-only">
              Search for a city
            </label>
            <div className="input-icon-wrapper" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              ref={inputRef}
              id="city-search-input"
              type="text"
              className="city-input"
              placeholder="Search city (e.g., Paris, Tokyo, New York)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => suggestions.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls="city-suggestions-list"
              aria-activedescendant={
                activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined
              }
            />

            {inputValue && (
              <button
                type="button"
                className="clear-input-btn"
                onClick={() => {
                  setInputValue('');
                  setSuggestions([]);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                aria-label="Clear city search input"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}

            {isSearching && (
              <span className="search-spinner" aria-label="Searching cities..." role="status" />
            )}
          </div>

          <button
            type="button"
            className="location-btn"
            onClick={onUseLocation}
            disabled={isLocating}
            aria-label="Use my current geographic location"
            title="Use current location"
          >
            <svg
              className={`location-icon ${isLocating ? 'pulse-anim' : ''}`}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>

        {/* Accessible Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <ul
            id="city-suggestions-list"
            className="suggestions-list"
            role="listbox"
            aria-label="City suggestions"
          >
            {suggestions.map((loc, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <li
                  key={`${loc.name}-${loc.latitude}-${loc.longitude}-${idx}`}
                  id={`suggestion-item-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`suggestion-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <span className="suggestion-name">{loc.name}</span>
                  <span className="suggestion-meta">
                    {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Location Error Notification if Permission Denied */}
      {locationError && (
        <div className="location-warning-banner" role="alert">
          <svg
            className="warning-icon"
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
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div className="warning-message">{locationError}</div>
          {onClearLocationError && (
            <button
              type="button"
              className="warning-dismiss-btn"
              onClick={onClearLocationError}
              aria-label="Dismiss location warning"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Quick Pick Popular Cities */}
      <div className="quick-picks-container">
        <span className="quick-picks-label" id="quick-picks-label">
          Popular Cities:
        </span>
        <div className="quick-picks-list" role="group" aria-labelledby="quick-picks-label">
          {POPULAR_CITIES.map((city) => {
            const isCurrent = currentLocationName?.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.name}
                type="button"
                className={`quick-pick-pill ${isCurrent ? 'active' : ''}`}
                onClick={() => handleSelect(city)}
                aria-pressed={isCurrent}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
