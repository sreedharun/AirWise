import { useState, useEffect, useRef, useCallback } from 'react';
import { AirQualityData, GeoLocation } from '../api/types';
import { fetchAirQuality } from '../api/airQuality';
import { ApiError } from '../api/client';

interface UseAirQualityReturn {
  data: AirQualityData | null;
  isLoading: boolean;
  error: string | null;
  selectedLocation: GeoLocation | null;
  selectLocation: (location: GeoLocation) => void;
  refetch: () => Promise<void>;
}

export function useAirQuality(initialLocation?: GeoLocation): UseAirQualityReturn {
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(
    initialLocation || null
  );
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (location: GeoLocation) => {
    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAirQuality(location, controller.signal);
      setData(result);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'ABORTED') {
        // Request was cancelled; do not override state
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Unable to load air quality data. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadData(selectedLocation);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedLocation, loadData]);

  const selectLocation = useCallback((location: GeoLocation) => {
    setSelectedLocation(location);
  }, []);

  const refetch = useCallback(async () => {
    if (selectedLocation) {
      await loadData(selectedLocation);
    }
  }, [selectedLocation, loadData]);

  return {
    data,
    isLoading,
    error,
    selectedLocation,
    selectLocation,
    refetch,
  };
}
