import { config } from '@/config';
import { clearSession, getAccessToken } from '@/lib/auth';
import { ApiError, type ErrorResponse } from '@/types/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  let url = `${config.apiUrl}${path}`;

  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: ErrorResponse | null = null;

  try {
    payload = (await response.json()) as ErrorResponse;
  } catch {
    payload = null;
  }

  return new ApiError(response.status, payload?.message || `Request failed with status ${response.status}`, {
    requestId: payload?.requestId,
    details: payload?.details,
  });
}

/**
 * Central HTTP client.
 * Business endpoints belong in service modules, not in UI components.
 * Authentication uses the Backend Bearer JWT contract when a session token exists.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, body, ...rest } = options;

  const defaultHeaders: HeadersInit = {};
  if (body !== undefined) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(buildUrl(path, params), {
      ...rest,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401 && token) {
        clearSession();
      }
      throw await parseError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, error instanceof Error ? error.message : 'An unexpected network error occurred');
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};

export type { RequestOptions };
