import { apiGet, apiPost } from '@shared/api.js';
import type { PageDto } from '@shared/openapi/common-dto.js';
import type {
  LaunchDto,
  TestPlanRunRequestDto,
} from '@shared/openapi/launch-dto.js';
import type {
  TestCaseTreeLeafDto,
  TestPlanDto,
  TestPlanStatDto,
} from '@shared/openapi/test-plan-dto.js';
import {
  createPaginated,
  PageParams,
  normalizePageParams,
  type Paginated,
} from '@shared/pagination.js';
import { Result, map } from '@shared/result.js';

/** Get a test plan by ID. */
export const getTestPlan = async (
  id: number
): Promise<Result<TestPlanDto, Error>> => {
  return apiGet<TestPlanDto>(`/api/testplan/${id}`);
};

/** Get test cases from a test plan with pagination. */
export const getTestPlanTestCases = async (
  testPlanId: number,
  params?: PageParams
): Promise<Result<Paginated<TestCaseTreeLeafDto>, Error>> => {
  const { page, size, sort } = normalizePageParams(params);

  const response = await apiGet<PageDto<TestCaseTreeLeafDto>>(
    `/api/testplan/${testPlanId}/tree/leaf`,
    { page, size, sort: sort ?? 'name,ASC' }
  );

  return map(response, (data) =>
    createPaginated(
      data.content ?? [],
      data.number ?? page,
      data.size ?? size,
      data.totalElements
    )
  );
};

/** Get test plan test-case statistics. */
export const getTestPlanStat = async (
  testPlanId: number
): Promise<Result<TestPlanStatDto, Error>> => {
  return apiGet<TestPlanStatDto>(`/api/testplan/${testPlanId}/stat`);
};

/** Sync test plan with source and return updated plan. */
export const syncTestPlan = async (
  testPlanId: number
): Promise<Result<TestPlanDto, Error>> => {
  return apiPost<TestPlanDto>(`/api/testplan/${testPlanId}/sync`);
};

/** Start a launch from a test plan and return launch data. */
export const runTestPlan = async (
  testPlanId: number,
  body: TestPlanRunRequestDto
): Promise<Result<LaunchDto, Error>> => {
  return apiPost<LaunchDto>(`/api/testplan/${testPlanId}/run`, body);
};
