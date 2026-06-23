import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTestCase,
  getTestCaseDetail,
  getTestCaseScenario,
  getTestCaseCustomFields,
  listTestCasesInTree,
  searchTestCasesByAQL,
  createTestCase,
  updateTestCaseCustomFields,
  getProjectCustomFields,
  getProjectCustomFieldValues,
  updateScenarioStep,
  setTestCaseScenario,
  createScenarioStep,
} from '@domain/test-case/index.js';
import { isSuccess } from '@shared/result.js';
import {
  setupFetchMock,
  mockJwtResponse,
  mockApiResponse,
  initTestApiClient,
} from '../__test-utils__/fetch-mock.js';

describe('Domain — Test Case Service', () => {
  let fetchMock: ReturnType<typeof setupFetchMock>;

  beforeEach(() => {
    fetchMock = setupFetchMock();
    initTestApiClient();
  });

  describe('getTestCase', () => {
    it('fetches test case by ID', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 1, name: 'TC-1', tags: [{ name: 'smoke' }] })
      );

      const result = await getTestCase(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe(1);
      }
    });
  });

  describe('getTestCaseDetail', () => {
    it('returns basic detail without projectId', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          id: 1,
          name: 'TC-1',
          createdBy: 'user',
          projectId: undefined,
        })
      );

      const result = await getTestCaseDetail(1);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.steps).toEqual([]);
        expect(result.value.customFields).toEqual({});
        expect(result.value.owner).toBe('user');
      }
    });

    it('enriches with scenario and custom fields', async () => {
      // Main test case
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          id: 1,
          name: 'TC-Enriched',
          createdBy: 'dev',
          projectId: 10,
          tags: [{ name: 'p0' }],
        })
      );
      // Scenario
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          root: { children: [100, 101] },
          scenarioSteps: {
            100: { id: 100, body: 'Step 1' },
            101: { id: 101, body: 'Step 2' },
          },
        })
      );
      // Custom fields
      fetchMock.mockResolvedValueOnce(
        mockApiResponse([
          {
            customField: { id: 1, name: 'Priority' },
            values: [{ id: 10, name: 'High' }],
          },
        ])
      );

      const result = await getTestCaseDetail(1, 10);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.steps).toEqual(['Step 1', 'Step 2']);
        expect(result.value.customFields).toEqual({ Priority: 'High' });
        expect(result.value.tags).toEqual(['p0']);
        expect(result.value.owner).toBe('dev');
      }
    });
  });

  describe('getTestCaseScenario', () => {
    it('fetches scenario', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          root: { children: [1] },
          scenarioSteps: { 1: { id: 1, body: 'Action' } },
        })
      );

      const result = await getTestCaseScenario(1);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('getTestCaseCustomFields', () => {
    it('fetches custom fields', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse([
          { customField: { name: 'Sprint' }, values: [{ name: 'S1' }] },
        ])
      );

      const result = await getTestCaseCustomFields(1, 10);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('listTestCasesInTree', () => {
    it('fetches tree node', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          id: 1,
          name: 'Root',
          children: { content: [] },
        })
      );

      const result = await listTestCasesInTree(10, 1);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('searchTestCasesByAQL', () => {
    it('searches by query', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [{ id: 1, name: 'Found' }],
          totalElements: 1,
        })
      );

      const result = await searchTestCasesByAQL(10, 'name=="Found"');
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.testCases).toHaveLength(1);
        expect(result.value.total).toBe(1);
      }
    });
  });

  describe('createTestCase', () => {
    it('creates test case', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ id: 99, name: 'New TC' })
      );

      const result = await createTestCase({ name: 'New TC', projectId: 10 });
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe(99);
      }
    });
  });

  describe('updateTestCaseCustomFields', () => {
    it('updates custom fields', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(mockApiResponse(undefined, 204));

      const result = await updateTestCaseCustomFields(1, [
        { customFieldId: 5, valueIds: [1, 2] },
      ]);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('getProjectCustomFields', () => {
    it('fetches project custom fields', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [{ id: 1, name: 'Field1', archived: false }],
          totalElements: 1,
        })
      );

      const result = await getProjectCustomFields(10);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toHaveLength(1);
      }
    });

    it('handles error', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(mockApiResponse('error', 500));

      const result = await getProjectCustomFields(10);
      expect(isSuccess(result)).toBe(false);
    });
  });

  describe('getProjectCustomFieldValues', () => {
    it('fetches values', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          content: [{ id: 1, name: 'Value1' }],
          totalElements: 1,
        })
      );

      const result = await getProjectCustomFieldValues(10, 5);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toHaveLength(1);
      }
    });
  });

  describe('updateScenarioStep', () => {
    it('patches a step', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ root: { children: [1] } })
      );

      const result = await updateScenarioStep(1, { body: 'updated' });
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('setTestCaseScenario', () => {
    it('sets scenario with steps', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({ root: { children: [1, 2] } })
      );

      const result = await setTestCaseScenario(1, [
        { action: 'Step 1' },
        { action: 'Step 2', expectedResult: 'Pass' },
      ]);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('createScenarioStep', () => {
    it('creates step without expected result', async () => {
      mockJwtResponse(fetchMock);
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          createdStepId: 100,
          scenario: { root: { children: [100] } },
        })
      );

      const result = await createScenarioStep(1, 'New step');
      expect(isSuccess(result)).toBe(true);
    });

    it('creates step with expected result', async () => {
      mockJwtResponse(fetchMock);
      // First POST: create step
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          createdStepId: 100,
          scenario: { root: { children: [100] } },
        })
      );
      // Second POST: expected result step
      fetchMock.mockResolvedValueOnce(
        mockApiResponse({
          createdStepId: 101,
          scenario: { root: { children: [100, 101] } },
        })
      );

      const result = await createScenarioStep(1, 'Action', 'Expected');
      expect(isSuccess(result)).toBe(true);
    });
  });
});
