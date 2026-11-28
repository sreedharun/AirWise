import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../hooks/useGeolocation';

describe('useGeolocation hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles successful geolocation retrieval', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 48.8566,
            longitude: 2.3522,
          },
        });
      }),
    };
    // @ts-expect-error mock navigator geolocation
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });

    expect(location).toEqual({
      name: 'Current Location',
      latitude: 48.8566,
      longitude: 2.3522,
      country: '48.8566°N, 2.3522°E',
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles permission denied error gracefully', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      }),
    };
    // @ts-expect-error mock navigator geolocation
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useGeolocation());

    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });

    expect(location).toBeNull();
    expect(result.current.error).toContain('permission was denied');

    // Test clear error
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('handles position unavailable error', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({
          code: 2, // POSITION_UNAVAILABLE
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      }),
    };
    // @ts-expect-error mock navigator geolocation
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.getCurrentLocation();
    });

    expect(result.current.error).toContain('currently unavailable');
  });

  it('handles unsupported browser environment where geolocation is undefined', async () => {
    // @ts-expect-error test undefined geolocation
    delete global.navigator.geolocation;

    const { result } = renderHook(() => useGeolocation());

    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });

    expect(location).toBeNull();
    expect(result.current.error).toContain('not supported by your browser');
  });
});
