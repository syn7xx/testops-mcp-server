import type { Result } from './result.js';
import { tryCatch } from './result.js';

/** HTTP methods supported by the API client */
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/** Request configuration for API calls */
export interface RequestConfig {
  method: HttpMethod;
  queryParams?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

let baseUrl = '';
let authToken = '';

/**
 * Initialize the API client with TestOps credentials
 * @param url - TestOps instance URL
 * @param token - API token for authentication
 */
export const initApiClient = (url: string, token: string): void => {
  baseUrl = url.replace(/\/+$/, '');
  authToken = token;
};

const getConfig = (): { baseUrl: string; authToken: string } => {
  if (!baseUrl || !authToken) {
    throw new Error('API client not initialized. Call initApiClient() first.');
  }
  return { baseUrl, authToken };
};

let jwtToken: string | null = null;

/** Clear cached JWT token (useful for re-authentication) */
export const clearJwtCache = (): void => {
  jwtToken = null;
};

/**
 * Get JWT token for API requests (with caching)
 * @returns Cached or freshly obtained JWT token
 */
export const getJwt = async (): Promise<string> => {
  if (jwtToken) {
    return jwtToken;
  }

  const { baseUrl: root, authToken: token } = getConfig();

  const response = await fetch(`${root}/api/uaa/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'apitoken',
      scope: 'openid',
      token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string };
  jwtToken = data.access_token;
  return jwtToken;
};

async function executeRequest<T>(
  endpoint: string,
  config: RequestConfig,
  retryOnUnauthorized: boolean
): Promise<T> {
  const { baseUrl: root } = getConfig();
  const jwt = await getJwt();

  const url = new URL(`${root}${endpoint}`);
  if (config.queryParams) {
    Object.entries(config.queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: config.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      ...config.headers,
    },
    body: config.body ? JSON.stringify(config.body) : undefined,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    clearJwtCache();
    return executeRequest<T>(endpoint, config, false);
  }

  if (!response.ok) {
    throw new Error(
      `${config.method} ${endpoint} failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Base HTTP client with automatic JWT auth.
 * On HTTP 401, clears the cached JWT and retries the request once (e.g. expired access token).
 */
export const apiFetch = async <T = unknown>(
  endpoint: string,
  config: RequestConfig
): Promise<Result<T, Error>> => {
  return tryCatch(async () => executeRequest<T>(endpoint, config, true));
};

/** GET request helper */
export const apiGet = <T = unknown>(
  endpoint: string,
  queryParams?: RequestConfig['queryParams']
): Promise<Result<T, Error>> =>
  apiFetch<T>(endpoint, { method: 'GET', queryParams });

/** POST request helper */
export const apiPost = <T = unknown>(
  endpoint: string,
  body?: unknown,
  queryParams?: RequestConfig['queryParams']
): Promise<Result<T, Error>> =>
  apiFetch<T>(endpoint, { method: 'POST', body, queryParams });

/** PATCH request helper */
export const apiPatch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  queryParams?: RequestConfig['queryParams']
): Promise<Result<T, Error>> =>
  apiFetch<T>(endpoint, { method: 'PATCH', body, queryParams });

/** DELETE request helper */
export const apiDelete = <T = unknown>(
  endpoint: string,
  queryParams?: RequestConfig['queryParams']
): Promise<Result<T, Error>> =>
  apiFetch<T>(endpoint, { method: 'DELETE', queryParams });
