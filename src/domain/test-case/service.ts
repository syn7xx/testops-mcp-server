import { apiGet, apiPatch, apiPost } from '@shared/api.js';
import type { PageDto } from '@shared/openapi/common-dto.js';
import type {
  CustomFieldWithValuesDto,
  NormalizedScenarioDto,
  TestCaseDto,
  TestCaseFullTreeNodeDto,
} from '@shared/openapi/test-case-dto.js';
import { PageParams, normalizePageParams } from '@shared/pagination.js';
import { Result, map, isSuccess, success } from '@shared/result.js';
import type { TestCaseDetail, TestCaseSearchResult } from './types.js';

/** Get a test case by ID. */
export const getTestCase = async (
  id: number
): Promise<Result<TestCaseDto, Error>> => {
  return apiGet<TestCaseDto>(`/api/testcase/${id}`);
};

/** Get test case detail with steps and custom fields (parallel fetches). */
export const getTestCaseDetail = async (
  id: number
): Promise<Result<TestCaseDetail, Error>> => {
  const testCaseResult = await apiGet<TestCaseDto>(`/api/testcase/${id}`);

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
        const values = cf.values;
        const fieldName = cf.customField?.name;

        if (!fieldName || !values?.length) {
          return acc;
        }

        const firstName = values[0]?.name;

        if (firstName != null) {
          acc[fieldName] = firstName;
        }

        return acc;
      }, {})
    : {};

  return success({
    ...testCase,
    steps,
    customFields,
    tags: testCase.tags?.flatMap((t) => (t.name != null ? [t.name] : [])) ?? [],
    owner: testCase.createdBy ?? '',
  });
};

/** Extract step bodies from normalized scenario. */
const extractStepsFromScenario = (
  scenario: NormalizedScenarioDto
): string[] => {
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

/** Get normalized scenario for a test case. */
export const getTestCaseScenario = async (
  testCaseId: number
): Promise<Result<NormalizedScenarioDto, Error>> => {
  return apiGet<NormalizedScenarioDto>(`/api/testcase/${testCaseId}/step`);
};

/** Update one scenario step by global step id. */
export const updateScenarioStep = async (
  stepId: number,
  data: { body?: string; expectedResult?: string }
): Promise<Result<NormalizedScenarioDto, Error>> => {
  const body: Record<string, unknown> = {};
  if (data.body !== undefined) body.body = data.body;
  if (data.expectedResult !== undefined)
    body.expectedResult = data.expectedResult;

  return apiPatch<NormalizedScenarioDto>(`/api/testcase/step/${stepId}`, body, {
    withExpectedResult: true,
  });
};

/** Replace test case scenario with new steps. */
export const setTestCaseScenario = async (
  testCaseId: number,
  steps: Array<{ action: string; expectedResult?: string }>
): Promise<Result<NormalizedScenarioDto, Error>> => {
  const scenarioData = {
    steps: steps.map((s) => ({
      action: s.action,
      expectedResult: s.expectedResult ?? '',
    })),
  };

  return apiPost<NormalizedScenarioDto>(
    `/api/testcase/${testCaseId}/scenario`,
    scenarioData
  );
};

/** Get custom field values for a test case. */
export const getTestCaseCustomFields = async (
  testCaseId: number
): Promise<Result<CustomFieldWithValuesDto[], Error>> => {
  return apiGet<CustomFieldWithValuesDto[]>(`/api/testcase/${testCaseId}/cfv`);
};

/** Update custom field values for a test case. */
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

/** Optional filters for listing test cases under a project tree node. */
export interface ListTestCasesInTreeParams extends PageParams {
  parentNodeId?: number;
  search?: string;
  filterId?: number;
  query?: string;
  baseAql?: string;
}

/** List test cases under a project tree node (v2). */
export const listTestCasesInTree = async (
  projectId: number,
  treeId: number,
  params?: ListTestCasesInTreeParams
): Promise<Result<TestCaseFullTreeNodeDto, Error>> => {
  const { page, size, sort } = normalizePageParams({
    ...params,
    sort: params?.sort ?? 'name,ASC',
  });

  return apiGet<TestCaseFullTreeNodeDto>(
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

/** Search test cases by AQL with pagination. */
export const searchTestCasesByAQL = async (
  projectId: number,
  rql: string,
  params?: PageParams & { deleted?: boolean }
): Promise<Result<TestCaseSearchResult, Error>> => {
  const { page, size, sort } = normalizePageParams(params);

  const response = await apiGet<PageDto<TestCaseDto>>(
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
