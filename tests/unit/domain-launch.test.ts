import { describe, it, expect, beforeEach } from 'vitest';
import {
  createLaunch,
  stopLaunch,
  getLaunchStatistic,
  getLaunchProgress,
  getLaunchTestResultsFlat,
} from '@domain/launch/index.js';
import { isSuccess } from '@shared/result.js';
import {
  setupFetchMock,
  mockJwtResponse,
  mockApiResponse,
  initTestApiClient,
} from '../__test-utils__/fetch-mock.js';

describe('Domain — Launch Service', () => {
  let fetchMock: ReturnType<typeof setupFetchMock>;

  beforeEach(() => {
    fetchMock = setupFetchMock();
    initTestApiClient();
  });

  describe('createLaunch', () => {
    it('creates launch and returns dto', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 1, name: 'My Launch', projectId: 10 })
      );

      const result = await createLaunch({ name: 'My Launch', projectId: 10 });
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe(1);
        expect(result.value.name).toBe('My Launch');
      }
    });
  });

  describe('stopLaunch', () => {
    it('stops launch (204 no content)', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse(undefined, 204, 'No Content')
      );

      const result = await stopLaunch(1);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('getLaunchStatistic', () => {
    it('returns statistic array', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse([
          { status: 'PASSED', count: 5 },
          { status: 'FAILED', count: 2 },
        ])
      );

      const result = await getLaunchStatistic(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].status).toBe('PASSED');
      }
    });
  });

  describe('getLaunchProgress', () => {
    it('returns progress dto', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(mockApiResponse({ ready: true }));

      const result = await getLaunchProgress(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.ready).toBe(true);
      }
    });
  });

  describe('getLaunchTestResultsFlat', () => {
    it('returns paged test results', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [{ id: 1, name: 'test_1' }],
          totalElements: 1,
        })
      );

      const result = await getLaunchTestResultsFlat(1, {
        page: 0,
        size: 50,
        sort: 'name,ASC',
      });

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.content).toHaveLength(1);
      }
    });

    it('handles array sort param', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ content: [], totalElements: 0 })
      );

      const result = await getLaunchTestResultsFlat(1, {
        sort: ['name,ASC', 'id,DESC'],
      });

      expect(isSuccess(result)).toBe(true);
    });
  });
});
