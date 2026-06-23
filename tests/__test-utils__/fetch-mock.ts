import { vi } from 'vitest';
import { initApiClient, clearJwtCache } from '@shared/api.js';

export function mockApiResponse(
  body: unknown,
  status = 200,
  statusText = 'OK'
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

export function mockJwtResponse(
  mockFetch: ReturnType<typeof vi.fn>,
  token = 'test-jwt'
) {
  mockFetch.mockResolvedValueOnce(mockApiResponse({ access_token: token }));
}

/** Shared fetch mock helpers for domain service tests. */
export function setupFetchMock() {
  clearJwtCache();
  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

/** Initialize API client with test values. */
export function initTestApiClient(
  url = 'https://test.example.com',
  token = 'test-api-token'
) {
  clearJwtCache();
  initApiClient(url, token);
}
