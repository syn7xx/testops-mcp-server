import { describe, it, expect, beforeEach } from 'vitest';
import {
  findProjects,
  findProjectByName,
  getProjectById,
} from '@domain/project/index.js';
import { isSuccess } from '@shared/result.js';
import {
  setupFetchMock,
  mockJwtResponse,
  mockApiResponse,
  initTestApiClient,
} from '../__test-utils__/fetch-mock.js';

describe('Domain — Project Service', () => {
  let fetchMock: ReturnType<typeof setupFetchMock>;

  beforeEach(() => {
    fetchMock = setupFetchMock();
    initTestApiClient();
  });

  describe('findProjects', () => {
    it('returns paginated projects on success', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [{ id: 1, name: 'Project A' }],
          totalElements: 1,
          number: 0,
          size: 50,
        })
      );

      const result = await findProjects();
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toEqual([{ id: 1, name: 'Project A' }]);
        expect(result.value.totalElements).toBe(1);
      }
    });

    it('returns failure on API error', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse('Server error', 500, 'Internal Server Error')
      );

      const result = await findProjects();
      expect(isSuccess(result)).toBe(false);
    });

    it('handles empty content gracefully', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(mockApiResponse({}));

      const result = await findProjects();
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toEqual([]);
        expect(result.value.totalElements).toBe(0);
      }
    });
  });

  describe('findProjectByName', () => {
    it('finds exact match', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [
            { id: 1, name: 'Target' },
            { id: 2, name: 'Other' },
          ],
        })
      );

      const result = await findProjectByName('Target');
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual({ id: 1, name: 'Target' });
      }
    });

    it('falls back to partial match', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [{ id: 5, name: 'TargetProject' }],
        })
      );

      const result = await findProjectByName('Target');
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value?.id).toBe(5);
      }
    });

    it('returns null when no suggestions', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(mockApiResponse({ content: [] }));

      const result = await findProjectByName('NoMatch');
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe('getProjectById', () => {
    it('fetches project by ID', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 42, name: 'Project' })
      );

      const result = await getProjectById(42);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe(42);
      }
    });

    it('returns failure on error', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(mockApiResponse('Not found', 404));

      const result = await getProjectById(999);
      expect(isSuccess(result)).toBe(false);
    });
  });
});
