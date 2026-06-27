import { describe, it, expect, beforeEach } from 'vitest';
import {
  listLaunches,
  getLaunch,
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

  describe('listLaunches', () => {
    it('returns paginated launches', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [
            { id: 1, name: 'Launch 1', projectId: 10 },
            { id: 2, name: 'Launch 2', projectId: 10 },
          ],
          totalElements: 2,
          number: 0,
          size: 50,
        })
      );

      const result = await listLaunches(10);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toHaveLength(2);
        expect(result.value.totalElements).toBe(2);
        expect(result.value.hasNext).toBe(false);
      }
    });

    it('handles empty launch list', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ content: [], totalElements: 0 })
      );

      const result = await listLaunches(10);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toHaveLength(0);
        expect(result.value.totalElements).toBe(0);
      }
    });

    it('returns failure on API error', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse('Server error', 500, 'Internal Server Error')
      );

      const result = await listLaunches(10);
      expect(isSuccess(result)).toBe(false);
    });
  });

  describe('getLaunch', () => {
    it('fetches launch by ID', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 1, name: 'My Launch', projectId: 10 })
      );

      const result = await getLaunch(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe(1);
        expect(result.value.name).toBe('My Launch');
      }
    });

    it('returns failure on 404', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(mockApiResponse('Not found', 404));

      const result = await getLaunch(999);
      expect(isSuccess(result)).toBe(false);
    });
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
