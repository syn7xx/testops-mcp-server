import { describe, it, expect, beforeEach } from 'vitest';
import { apiGet, apiPost } from '@shared/api.js';
import { isSuccess } from '@shared/result.js';
import {
  setupFetchMock,
  mockJwtResponse,
  mockApiResponse,
  initTestApiClient,
} from '../__test-utils__/fetch-mock.js';

describe('API Client', () => {
  let mockFetch: ReturnType<typeof setupFetchMock>;

  beforeEach(() => {
    mockFetch = setupFetchMock();
    initTestApiClient();
  });

  it('fetches JWT and makes GET request', async () => {
    mockJwtResponse(mockFetch, 'jwt-token');
    mockFetch.mockResolvedValueOnce(mockApiResponse([{ id: 1 }]));

    const result = await apiGet('/api/project');
    expect(isSuccess(result)).toBe(true);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toContain('/api/project');
    expect(mockFetch.mock.calls[1][1]).toMatchObject({
      method: 'GET',
      headers: {
        Authorization: 'Bearer jwt-token',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  });

  it('returns failure when JWT fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Unauthorized',
    });

    const result = await apiGet('/api/test');
    expect(isSuccess(result)).toBe(false);
  });

  it('returns failure when API returns error', async () => {
    mockJwtResponse(mockFetch);
    mockFetch.mockResolvedValueOnce(
      mockApiResponse('Server error', 500, 'ISE')
    );

    const result = await apiGet('/api/test');
    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error.message).toContain('500');
    }
  });

  it('retries on 401 by refreshing JWT', async () => {
    mockJwtResponse(mockFetch, 'jwt-1');
    // API returns 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '',
    });
    // Second JWT after retry
    mockFetch.mockResolvedValueOnce(mockApiResponse({ access_token: 'jwt-2' }));
    // Second API call succeeds
    mockFetch.mockResolvedValueOnce(mockApiResponse({ success: true }));

    const result = await apiGet('/api/test');
    expect(isSuccess(result)).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(4);
    const jwtCalls = mockFetch.mock.calls.filter(
      (c: unknown[]) =>
        typeof c[0] === 'string' && c[0].includes('/oauth/token')
    );
    expect(jwtCalls).toHaveLength(2);
  });

  it('caches JWT token between calls', async () => {
    mockJwtResponse(mockFetch, 'cached-jwt');
    mockFetch.mockResolvedValueOnce(mockApiResponse({ first: true }));

    await apiGet('/api/one');

    // Second: should reuse cached JWT, just make API call
    mockFetch.mockResolvedValueOnce(mockApiResponse({ second: true }));

    await apiGet('/api/two');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    const jwtCalls = mockFetch.mock.calls.filter(
      (c: unknown[]) =>
        typeof c[0] === 'string' && c[0].includes('/oauth/token')
    );
    expect(jwtCalls).toHaveLength(1);
  });

  it('sends POST with JSON body', async () => {
    mockJwtResponse(mockFetch);
    mockFetch.mockResolvedValueOnce(mockApiResponse({ id: 42 }));

    const result = await apiPost('/api/launch', { name: 'My Launch' });
    expect(isSuccess(result)).toBe(true);

    const postCall = mockFetch.mock.calls[1];
    expect(postCall[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ name: 'My Launch' }),
    });
  });
});
