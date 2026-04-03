import { apiGet, apiPost } from '../../shared/api.js';
import type { Result } from '../../shared/result.js';
import type {
  LaunchCreateDto,
  LaunchDto,
  LaunchProgressDto,
  TestStatusCountDto,
} from '../../shared/openapi/launch-dto.js';

/**
 * Create a launch (`POST /api/launch`).
 */
export const createLaunch = async (
  body: LaunchCreateDto
): Promise<Result<LaunchDto, Error>> => {
  return apiPost<LaunchDto>('/api/launch', body);
};

/**
 * Aggregated test result counts by status for a launch (`GET /api/launch/{id}/statistic`).
 */
export const getLaunchStatistic = async (
  launchId: number
): Promise<Result<TestStatusCountDto[], Error>> => {
  return apiGet<TestStatusCountDto[]>(`/api/launch/${launchId}/statistic`);
};

/**
 * Progress widget data for a launch (`GET /api/launch/{id}/progress`).
 */
export const getLaunchProgress = async (
  launchId: number
): Promise<Result<LaunchProgressDto, Error>> => {
  return apiGet<LaunchProgressDto>(`/api/launch/${launchId}/progress`);
};
