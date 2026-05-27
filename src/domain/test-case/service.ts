import { apiGet } from '@shared/api.js';
import type { PageDto } from '@shared/openapi/common-dto.js';
import type {
  NormalizedScenarioDto,
  TestCaseDto,
  TestCaseFullTreeNodeDto,
} from '@shared/openapi/test-case-dto.js';
import { normalizePageParams, type PageParams } from '@shared/pagination.js';
import { Result, isSuccess, success, map } from '@shared/result.js';
import { getTestCaseScenario } from './scenario.js';
import { getTestCaseCustomFields } from './custom-fields.js';
import type { TestCaseDetail, TestCaseSearchResult } from './types.js';

function flattenTags(testCase: TestCaseDto): string[] {
  return testCase.tags?.flatMap((t) => (t.name != null ? [t.name] : [])) ?? [];
}

export const getTestCase = async (
  id: number
): Promise<Result<TestCaseDto, Error>> => {
  return apiGet<TestCaseDto>(`/api/testcase/${id}`);
};

function extractStepsFromScenario(scenario: NormalizedScenarioDto): string[] {
  if (!scenario.scenarioSteps || !scenario.root?.children) {
    return [];
  }

  const { scenarioSteps } = scenario;

  return scenario.root.children.flatMap((stepId) => {
    const step = scenarioSteps[stepId];
    return step?.body ? [step.body] : [];
  });
}

export const getTestCaseDetail = async (
  id: number,
  projectId?: number
): Promise<Result<TestCaseDetail, Error>> => {
  const testCaseResult = await apiGet<TestCaseDto>(`/api/testcase/${id}`);

  if (!isSuccess(testCaseResult)) {
    return testCaseResult;
  }

  const testCase = testCaseResult.value;
  const effectiveProjectId = projectId ?? testCase.projectId;

  if (!effectiveProjectId) {
    return success({
      ...testCase,
      steps: [],
      customFields: {},
      tags: flattenTags(testCase),
      owner: testCase.createdBy ?? '',
    });
  }

  const [scenarioResult, cfResult] = await Promise.all([
    getTestCaseScenario(id),
    getTestCaseCustomFields(id, effectiveProjectId),
  ]);

  const steps = isSuccess(scenarioResult)
    ? extractStepsFromScenario(scenarioResult.value)
    : [];

  const customFields = isSuccess(cfResult)
    ? cfResult.value.reduce<Record<string, string>>((acc, cf) => {
        const { values, customField } = cf;
        const fieldName = customField?.name;

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
    tags: flattenTags(testCase),
    owner: testCase.createdBy ?? '',
  });
};

export interface ListTestCasesInTreeParams extends PageParams {
  parentNodeId?: number;
  search?: string;
  filterId?: number;
  query?: string;
  baseAql?: string;
}

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
