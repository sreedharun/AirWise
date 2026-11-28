import { useState, useCallback } from 'react';
import { GeoLocation } from '../api/types';

interface UseGeolocationReturn {
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<GeoLocation | null>;
  clearError: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const getCurrentLocation = useCallback(async (): Promise<GeoLocation | null> => {
    setIsLoading(true);
    setError(null);

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setIsLoading(false);
      setError('Geolocation is not supported by your browser. Please search for your city.');
      return null;
    }

    return new Promise<GeoLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          const lat = Number(position.coords.latitude.toFixed(4));
          const lon = Number(position.coords.longitude.toFixed(4));
          const location: GeoLocation = {
            name: 'Current Location',
            latitude: lat,
            longitude: lon,
            country: `${lat >= 0 ? lat + '°N' : Math.abs(lat) + '°S'}, ${lon >= 0 ? lon + '°E' : Math.abs(lon) + '°W'}`,
          };
          resolve(location);
        },
        (geoError) => {
          setIsLoading(false);
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              setError(
                'Location permission was denied. You can search for any city in the search bar.'
              );
              break;
            case geoError.POSITION_UNAVAILABLE:
              setError(
                'Location information is currently unavailable. Please try typing your city.'
              );
              break;
            case geoError.TIMEOUT:
              setError('Location request timed out. Please try searching for your city.');
              break;
            default:
              setError('Could not retrieve your location. Please search for your city.');
              break;
          }
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  return { isLoading, error, getCurrentLocation, clearError };
}
