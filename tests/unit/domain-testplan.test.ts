import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTestPlan,
  getTestPlanTestCases,
  getTestPlanStat,
  syncTestPlan,
  runTestPlan,
} from '@domain/test-plan/index.js';
import { isSuccess } from '@shared/result.js';
import {
  setupFetchMock,
  mockJwtResponse,
  mockApiResponse,
  initTestApiClient,
} from '../__test-utils__/fetch-mock.js';

describe('Domain — Test Plan Service', () => {
  let fetchMock: ReturnType<typeof setupFetchMock>;

  beforeEach(() => {
    fetchMock = setupFetchMock();
    initTestApiClient();
  });

  describe('getTestPlan', () => {
    it('fetches test plan by ID', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 1, name: 'Regression Plan' })
      );

      const result = await getTestPlan(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe(1);
        expect(result.value.name).toBe('Regression Plan');
      }
    });
  });

  describe('getTestPlanTestCases', () => {
    it('returns paginated test cases', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [
            { id: 10, name: 'TC-1' },
            { id: 20, name: 'TC-2' },
          ],
          totalElements: 2,
          number: 0,
          size: 50,
        })
      );

      const result = await getTestPlanTestCases(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toHaveLength(2);
        expect(result.value.totalElements).toBe(2);
      }
    });

    it('handles empty test plan', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ content: [], totalElements: 0 })
      );

      const result = await getTestPlanTestCases(5);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toHaveLength(0);
      }
    });
  });

  describe('getTestPlanStat', () => {
    it('returns test plan statistics', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ passed: 10, failed: 3 })
      );

      const result = await getTestPlanStat(1);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('syncTestPlan', () => {
    it('syncs and returns updated plan', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 1, name: 'Synced Plan' })
      );

      const result = await syncTestPlan(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.name).toBe('Synced Plan');
      }
    });
  });

  describe('runTestPlan', () => {
    it('creates launch from test plan', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 100, name: 'Launch from plan' })
      );

      const result = await runTestPlan(1, { launchName: 'My Run' });
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe(100);
      }
    });
  });
});
