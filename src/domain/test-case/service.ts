import { apiGet, apiPatch, apiPost } from '../../shared/api.js';
import { Result, map, isSuccess, success } from '../../shared/result.js';
import { PageParams, normalizePageParams } from '../../shared/pagination.js';
import type {
  TestCase,
  TestCaseDetail,
  NormalizedScenario,
  CustomFieldWithValues,
  TestCaseSearchResult,
  TestCaseFullTreeNode,
} from './types.js';

interface PageResponse<T> {
  content?: T[];
  totalElements?: number;
  number?: number;
  size?: number;
}

/**
 * Get a test case by ID
 * @param id - Test case ID
 * @returns Basic test case info
 */
export const getTestCase = async (
  id: number
): Promise<Result<TestCase, Error>> => {
  return apiGet<TestCase>(`/api/testcase/${id}`);
};

/**
 * Get detailed test case with steps and custom fields
 * Fetches additional data in parallel for performance
 * @param id - Test case ID
 * @returns Full test case details
 */
export const getTestCaseDetail = async (
  id: number
): Promise<Result<TestCaseDetail, Error>> => {
  const testCaseResult = await apiGet<TestCase>(`/api/testcase/${id}`);

  if (!isSuccess(testCaseResult)) {
    return testCaseResult;
  }

  const testCase = testCaseResult.value;

  // Fetch additional data in parallel
  const [scenarioResult, cfResult] = await Promise.all([
    getTestCaseScenario(id),
    getTestCaseCustomFields(id),
  ]);

  const steps = isSuccess(scenarioResult)
    ? extractStepsFromScenario(scenarioResult.value)
    : [];

  const customFields = isSuccess(cfResult)
    ? cfResult.value.reduce<Record<string, string>>((acc, cf) => {
        if (cf.values.length > 0) {
          acc[cf.customField.name] = cf.values[0].name;
        }
        return acc;
      }, {})
    : {};

  return success({
    ...testCase,
    steps,
    customFields,
    tags: testCase.tags?.map((t) => t.name) ?? [],
    owner: testCase.createdBy ?? '',
  });
};

/** Extract step bodies from normalized scenario */
const extractStepsFromScenario = (scenario: NormalizedScenario): string[] => {
  const steps: string[] = [];

  if (!scenario.scenarioSteps || !scenario.root?.children) {
    return steps;
  }

  for (const stepId of scenario.root.children) {
    const step = scenario.scenarioSteps[stepId];
    if (step?.body) {
      steps.push(step.body);
    }
  }

  return steps;
};

/**
 * Get scenario (steps and expected results) for a test case
 * @param testCaseId - Test case ID
 * @returns Normalized scenario structure
 */
export const getTestCaseScenario = async (
  testCaseId: number
): Promise<Result<NormalizedScenario, Error>> => {
  return apiGet<NormalizedScenario>(`/api/testcase/${testCaseId}/step`);
};

/**
 * Update a single step in the scenario
 * @param testCaseId - Test case ID
 * @param stepId - Step ID to update
 * @param data - Step data (body and/or expectedResult)
 * @returns Updated scenario
 */
export const updateScenarioStep = async (
  testCaseId: number,
  stepId: number,
  data: { body?: string; expectedResult?: string }
): Promise<Result<NormalizedScenario, Error>> => {
  const body: Record<string, unknown> = {};
  if (data.body !== undefined) body.body = data.body;
  if (data.expectedResult !== undefined)
    body.expectedResult = data.expectedResult;

  return apiPatch<NormalizedScenario>(`/api/testcase/step/${stepId}`, body, {
    withExpectedResult: true,
  });
};

/**
 * Replace entire scenario with new steps
 * @param testCaseId - Test case ID
 * @param steps - Array of steps with actions and expected results
 * @returns Updated scenario
 */
export const setTestCaseScenario = async (
  testCaseId: number,
  steps: Array<{ action: string; expectedResult?: string }>
): Promise<Result<NormalizedScenario, Error>> => {
  const scenarioData = {
    steps: steps.map((s) => ({
      action: s.action,
      expectedResult: s.expectedResult ?? '',
    })),
  };

  return apiPost<NormalizedScenario>(
    `/api/testcase/${testCaseId}/scenario`,
    scenarioData
  );
};

/**
 * Get custom field values for a test case
 * @param testCaseId - Test case ID
 * @returns Custom fields with their values
 */
export const getTestCaseCustomFields = async (
  testCaseId: number
): Promise<Result<CustomFieldWithValues[], Error>> => {
  return apiGet<CustomFieldWithValues[]>(`/api/testcase/${testCaseId}/cfv`);
};

/**
 * Update custom field values for a test case
 * @param testCaseId - Test case ID
 * @param fields - Array of custom field updates (fieldId + valueIds)
 */
export const updateTestCaseCustomFields = async (
  testCaseId: number,
  fields: Array<{ customFieldId: number; valueIds: number[] }>
): Promise<Result<void, Error>> => {
  const result = await apiPatch<void>(
    `/api/testcase/${testCaseId}/cfv`,
    fields
  );
  return map(result, () => undefined);
};

/**
 * Search test cases using AQL (Advanced Query Language)
 * @param projectId - Project ID
 * @param rql - AQL query string
 * @param params - Pagination and options
 * @returns Search results with pagination info
 */
export interface ListTestCasesInTreeParams extends PageParams {
  parentNodeId?: number;
  search?: string;
  filterId?: number;
  query?: string;
  baseAql?: string;
}

/**
 * List test cases under a project tree (v2 tree-node).
 * When `treeId` is set, TestOps scopes the result to that tree (see OpenAPI: test-case-tree-controller-v-2).
 */
export const listTestCasesInTree = async (
  projectId: number,
  treeId: number,
  params?: ListTestCasesInTreeParams
): Promise<Result<TestCaseFullTreeNode, Error>> => {
  const { page, size, sort } = normalizePageParams({
    ...params,
    sort: params?.sort ?? 'name,ASC',
  });

  return apiGet<TestCaseFullTreeNode>(
    `/api/v2/project/${projectId}/test-case/tree/tree-node`,
    {
      treeId,
      parentNodeId: params?.parentNodeId,
      search: params?.search,
      filterId: params?.filterId,
      page,
      size,
      sort,
      query: params?.query,
      baseAql: params?.baseAql,
    }
  );
};

export const searchTestCasesByAQL = async (
  projectId: number,
  rql: string,
  params?: PageParams & { deleted?: boolean }
): Promise<Result<TestCaseSearchResult, Error>> => {
  const { page, size, sort } = normalizePageParams(params);

  const response = await apiGet<PageResponse<TestCase>>(
    '/api/testcase/__search',
    {
      projectId,
      rql,
      deleted: params?.deleted,
      page,
      size,
      sort,
    }
  );

  return map(response, (data) => ({
    testCases: data.content ?? [],
    total: data.totalElements ?? 0,
    page: data.number ?? page,
    size: data.size ?? size,
  }));
};
