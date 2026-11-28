/**
 * Secure HTTP client with timeouts, AbortController, and error normalization.
 */

export class ApiError extends Error {
  public status?: number;
  public code: string;

  constructor(message: string, code = 'API_ERROR', status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchWithTimeout<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: callerSignal, ...fetchOptions } = options;

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
