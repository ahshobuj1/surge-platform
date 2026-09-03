import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function getStoredTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
}

export function setStoredTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearStoredTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export async function request<T = any>(
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
            const refreshData: ApiResponse = await refreshRes.json();

            if (refreshData.success && refreshData.data?.accessToken) {
              setStoredTokens(refreshData.data.accessToken, refreshData.data.refreshToken || refreshToken);
              isRefreshing = false;
              processQueue(null, refreshData.data.accessToken);

              // Retry original request
              headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
              const retryResponse = await fetch(url, { ...config, headers });
              const retryJson: ApiResponse<T> = await retryResponse.json();
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
          } catch (refreshErr) {
            clearStoredTokens();
            isRefreshing = false;
            processQueue(refreshErr);
            if (typeof window !== 'undefined') window.location.href = '/login';
            throw refreshErr;
          }
        } else {
          // Wait for token refresh queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newAccessToken) => {
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            return fetch(url, { ...config, headers }).then(async (res) => {
              const json: ApiResponse<T> = await res.json();
              if (!res.ok || !json.success) {
                throw new ApiError(json.message || 'API request failed', res.status, json);
              }
              return json.data !== undefined ? json.data : (json as unknown as T);
            });
          });
        }
      }
    }

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || (data && data.success === false)) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data.data !== undefined ? data.data : (data as unknown as T);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error', 500);
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
