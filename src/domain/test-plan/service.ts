import { apiGet, apiPost } from '../../shared/api.js';
import { Result, map } from '../../shared/result.js';
import { createPaginated } from '../../shared/pagination.js';
import {
  PageParams,
  normalizePageParams,
  type Paginated,
} from '../../shared/pagination.js';
import type {
  LaunchDto,
  TestPlanRunRequestDto,
} from '../../shared/openapi/launch-dto.js';
import type { TestPlan, TestPlanTestCase } from './types.js';

interface PageResponse<T> {
  content?: T[];
  totalElements?: number;
  number?: number;
  size?: number;
}

/**
 * Get a test plan by ID
 * @param id - Test plan ID
 * @returns Test plan details
 */
export const getTestPlan = async (
  id: number
): Promise<Result<TestPlan, Error>> => {
  return apiGet<TestPlan>(`/api/testplan/${id}`);
};

/**
 * Get test cases from a test plan
 * @param testPlanId - Test plan ID
 * @param params - Pagination parameters
 * @returns Paginated list of test cases in the plan
 */
export const getTestPlanTestCases = async (
  testPlanId: number,
  params?: PageParams
): Promise<Result<Paginated<TestPlanTestCase>, Error>> => {
  const { page, size, sort } = normalizePageParams(params);

  const response = await apiGet<PageResponse<TestPlanTestCase>>(
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

/**
 * Get test plan execution statistics
 * @param testPlanId - Test plan ID
 * @returns Statistics (total, passed, failed counts)
 */
export const getTestPlanStat = async (
  testPlanId: number
): Promise<
  Result<{ total: number; passed: number; failed: number }, Error>
> => {
  return apiGet(`/api/testplan/${testPlanId}/stat`);
};

/**
 * Sync test plan (update test case list from source).
 * `POST /api/testplan/{id}/sync` → updated `TestPlanDto`
 */
export const syncTestPlan = async (
  testPlanId: number
): Promise<Result<TestPlan, Error>> => {
  return apiPost<TestPlan>(`/api/testplan/${testPlanId}/sync`);
};

/**
 * Start a launch from a test plan.
 * `POST /api/testplan/{id}/run` → `LaunchDto`.
 */
export const runTestPlan = async (
  testPlanId: number,
  body: TestPlanRunRequestDto
): Promise<Result<LaunchDto, Error>> => {
  return apiPost<LaunchDto>(`/api/testplan/${testPlanId}/run`, body);
};
