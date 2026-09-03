import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export interface BackendErrorItem {
  code?: string;
  message?: string;
  field?: string;
}

export interface BackendErrorResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  errors?: BackendErrorItem[];
  isVerified?: boolean;
  [key: string]: unknown;
}

export class ApiError extends Error {
  statusCode: number;
  data?: unknown;
  isVerified?: boolean;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    if (typeof data === 'object' && data !== null && 'isVerified' in data) {
      this.isVerified = Boolean((data as { isVerified?: boolean }).isVerified);
    }
  }
}

export function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
}

export function setStoredTokens(accessToken: string, refreshToken?: string | null): void {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: string | null) => void; reject: (reason?: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const { accessToken } = getStoredTokens();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // If 401 Unauthorized, try refreshing token
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const { refreshToken } = getStoredTokens();
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            const refreshData = (await refreshRes.json()) as ApiResponse<{ accessToken?: string; refreshToken?: string }>;

            if (refreshData.success && refreshData.data?.accessToken) {
              setStoredTokens(refreshData.data.accessToken, refreshData.data.refreshToken || refreshToken);
              isRefreshing = false;
              processQueue(null, refreshData.data.accessToken);

              // Retry original request
              headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
              const retryResponse = await fetch(url, { ...config, headers });
              const retryJson = (await retryResponse.json()) as ApiResponse<T>;
              if (!retryResponse.ok || !retryJson.success) {
                throw new ApiError(retryJson.message || 'API request failed', retryResponse.status, retryJson);
              }
              return retryJson.data !== undefined ? retryJson.data : (retryJson as unknown as T);
            } else {
              clearStoredTokens();
              isRefreshing = false;
              processQueue(new Error('Token refresh failed'));
              if (typeof window !== 'undefined') window.location.href = '/login';
            }
          } catch (refreshErr: unknown) {
            clearStoredTokens();
            isRefreshing = false;
            processQueue(refreshErr);
            if (typeof window !== 'undefined') window.location.href = '/login';
            throw refreshErr;
          }
        } else {
          // Wait for token refresh queue
          return new Promise<string | null | undefined>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newAccessToken) => {
            if (newAccessToken) {
              headers.set('Authorization', `Bearer ${newAccessToken}`);
            }
            return fetch(url, { ...config, headers }).then(async (res) => {
              const json = (await res.json()) as ApiResponse<T>;
              if (!res.ok || !json.success) {
                throw new ApiError(json.message || 'API request failed', res.status, json);
              }
              return json.data !== undefined ? json.data : (json as unknown as T);
            });
          });
        }
      }
    }

    let data: (ApiResponse<T> & BackendErrorResponse) | null = null;
    try {
      data = (await response.json()) as ApiResponse<T> & BackendErrorResponse;
    } catch {
      data = null;
    }

    if (!response.ok || (data && data.success === false)) {
      let errorMsg = data?.message;
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const details = data.errors
          .map((e) => e.message || e.code)
          .filter(Boolean);
        if (details.length > 0) {
          errorMsg = details.join('. ');
        }
      }
      throw new ApiError(
        errorMsg || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data?.data !== undefined ? data.data : (data as unknown as T);
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new ApiError(msg, 500);
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
