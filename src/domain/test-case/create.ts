import { apiPost } from '@shared/api.js';
import type {
  TestCaseCreateV2Dto,
  TestCaseDto,
} from '@shared/openapi/test-case-dto.js';
import type { Result } from '@shared/result.js';

export const createTestCase = async (
  data: TestCaseCreateV2Dto
): Promise<Result<TestCaseDto, Error>> => {
  return apiPost<TestCaseDto>('/api/testcase', data);
};
