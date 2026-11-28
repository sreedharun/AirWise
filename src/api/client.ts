/**
 * Secure HTTP client with timeouts, AbortController, and error normalization.
 */

import { API_CONFIG } from '../utils/constants';

/**
 * Standardized API Error carrying HTTP status and internal error code.
 */
export class ApiError extends Error {
  public status?: number;
  public code: string;

  /**
   * @param message User-friendly error message.
   * @param code Error classification identifier.
   * @param status Optional HTTP response status code.
   */
  constructor(message: string, code = 'API_ERROR', status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Extended fetch options allowing configurable timeout and cancellation signals.
 */
export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Performs a secure HTTPS fetch with timeout, cancellation, and normalized error handling.
 *
 * @template T Expected response payload type.
 * @param url Target endpoint URL (must start with https://).
 * @param options Fetch options including timeoutMs and AbortSignal.
 * @returns Parsed JSON response payload.
 * @throws {ApiError} On timeout, insecure protocol, network failure, or HTTP error.
 */
export async function fetchWithTimeout<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = API_CONFIG.DEFAULT_TIMEOUT_MS, signal: callerSignal, ...fetchOptions } = options;

  // Enforce HTTPS
  if (!url.startsWith('https://')) {
    throw new ApiError(
      'Insecure connection rejected. All API requests must use HTTPS.',
      'INSECURE_REQUEST'
    );
  }

  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // If caller provided a signal, chain it
  if (callerSignal) {
    callerSignal.addEventListener('abort', () => {
      controller.abort();
    });
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.headers || {}),
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new ApiError(
        `Remote server returned status ${response.status} (${response.statusText || 'Error'})`,
        'HTTP_ERROR',
        response.status
      );
    }

    const data = (await response.json()) as T;
    return data;
  } catch (err: unknown) {
    clearTimeout(timer);

    if (timedOut) {
      throw new ApiError(
        'The request timed out. Please check your internet connection and try again.',
        'TIMEOUT'
      );
    }

    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new ApiError('Request was cancelled.', 'ABORTED');
      }
      return Promise.reject(new ApiError(err.message || 'Network request failed', 'NETWORK_ERROR'));
    }

    throw new ApiError(
      'An unknown error occurred while communicating with the weather service.',
      'UNKNOWN_ERROR'
    );
  }
}
