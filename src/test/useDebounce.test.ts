import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce hook', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('updates value only after specified delay', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'first' },
    });

    expect(result.current).toBe('first');

    rerender({ val: 'second' });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('second');

    vi.useRealTimers();
  });
});
