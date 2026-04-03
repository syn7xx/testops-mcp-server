import type { Result } from './result.js';
import { tryCatch } from './result.js';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type QueryParamValue =
  | string
  | number
  | boolean
  | undefined
  | ReadonlyArray<string | number | boolean>;

interface RequestConfig {
  method: HttpMethod;
  queryParams?: Record<string, QueryParamValue>;
  body?: unknown;
  headers?: Record<string, string>;
}

let baseUrl = '';
let authToken = '';

/** Configure base URL and API token. */
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

/** Clear cached JWT. */
export const clearJwtCache = (): void => {
  jwtToken = null;
};

/** Obtain JWT for bearer auth (cached). */
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
      if (value === undefined) {
        return;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
      } else {
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

/** Send JSON request with JWT and one 401 retry. */
export const apiFetch = async <T = unknown>(
  endpoint: string,
  config: RequestConfig
): Promise<Result<T, Error>> => {
  return tryCatch(async () => executeRequest<T>(endpoint, config, true));
};

/** Send GET and return Result. */
export const apiGet = <T = unknown>(
  endpoint: string,
  queryParams?: RequestConfig['queryParams']
): Promise<Result<T, Error>> =>
  apiFetch<T>(endpoint, { method: 'GET', queryParams });

/** Send POST and return Result. */
export const apiPost = <T = unknown>(
  endpoint: string,
  body?: unknown,
  queryParams?: RequestConfig['queryParams']
): Promise<Result<T, Error>> =>
  apiFetch<T>(endpoint, { method: 'POST', body, queryParams });

/** Send PATCH and return Result. */
export const apiPatch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  queryParams?: RequestConfig['queryParams']
): Promise<Result<T, Error>> =>
  apiFetch<T>(endpoint, { method: 'PATCH', body, queryParams });
