import { apiGet, apiPost } from '@shared/api.js';
import type {
  LaunchCreateDto,
  LaunchDto,
  LaunchProgressDto,
  TestStatusCountDto,
} from '@shared/openapi/launch-dto.js';
import type { PageTestResultFlatDto } from '@shared/openapi/launch-test-result-dto.js';
import { normalizePageParams, type PageParams } from '@shared/pagination.js';
import type { Result } from '@shared/result.js';

export interface LaunchTestResultsFlatParams extends Omit<PageParams, 'sort'> {
  /** One or more sort criteria (repeated query keys). */
  sort?: string | ReadonlyArray<string>;
  search?: string;
  filterId?: number;
}

/** Create a launch. */
export const createLaunch = async (
  body: LaunchCreateDto
): Promise<Result<LaunchDto, Error>> => {
  return apiPost<LaunchDto>('/api/launch', body);
};

/** Close/stop a launch (POST /api/launch/{id}/close, 204). */
export const stopLaunch = async (
  launchId: number
): Promise<Result<void, Error>> => {
  return apiPost<void>(`/api/launch/${launchId}/close`);
};

/** Aggregated test result counts by status for a launch. */
export const getLaunchStatistic = async (
  launchId: number
): Promise<Result<TestStatusCountDto[], Error>> => {
  return apiGet<TestStatusCountDto[]>(`/api/launch/${launchId}/statistic`);
};

/** Progress widget data for a launch. */
export const getLaunchProgress = async (
  launchId: number
): Promise<Result<LaunchProgressDto, Error>> => {
  return apiGet<LaunchProgressDto>(`/api/launch/${launchId}/progress`);
};

/** Paged flat list of test results for a launch. */
export const getLaunchTestResultsFlat = async (
  launchId: number,
  params?: LaunchTestResultsFlatParams
): Promise<Result<PageTestResultFlatDto, Error>> => {
  const { page, size } = normalizePageParams({
    page: params?.page,
    size: params?.size,
  });
  const rawSort = params?.sort;
  let sort: string | string[] | undefined;

  if (typeof rawSort === 'string') {
    sort = rawSort;
  } else if (Array.isArray(rawSort)) {
    // Accept readonly arrays from API types, but pass a mutable array to request layer.
    sort = rawSort.length > 0 ? [...rawSort] : undefined;
  }

  type QueryParamValue =
    | string
    | number
    | boolean
    | undefined
    | readonly (string | number | boolean)[];

  const query: Record<string, QueryParamValue> = {
    search: params?.search,
    filterId: params?.filterId,
    page,
    size,
  };
  if (sort !== undefined) {
    query.sort = sort;
  }

  return apiGet<PageTestResultFlatDto>(
    `/api/v2/launch/${launchId}/test-result/flat`,
    query
  );
};
