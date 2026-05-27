import { apiGet, apiPatch, apiPost } from '@shared/api.js';
import { omitUndefined } from '@shared/record-utils.js';
import type {
  NormalizedScenarioDto,
  ScenarioStepCreateDto,
  ScenarioStepCreatedResponseDto,
  TestCaseStepDto,
} from '@shared/openapi/test-case-dto.js';
import { Result, isSuccess, success } from '@shared/result.js';

export async function getTestCaseScenario(
  testCaseId: number
): Promise<Result<NormalizedScenarioDto, Error>> {
  return apiGet<NormalizedScenarioDto>(`/api/testcase/${testCaseId}/step`);
}

export const updateScenarioStep = async (
  stepId: number,
  data: { body?: string; expectedResult?: string }
): Promise<Result<NormalizedScenarioDto, Error>> => {
  return apiPatch<NormalizedScenarioDto>(
    `/api/testcase/step/${stepId}`,
    omitUndefined(data),
    { withExpectedResult: true }
  );
};

export const setTestCaseScenario = async (
  testCaseId: number,
  steps: Array<{ action: string; expectedResult?: string }>
): Promise<Result<NormalizedScenarioDto, Error>> => {
  const apiSteps = steps.flatMap((step) => {
    const items: TestCaseStepDto[] = [{ type: 'body', body: step.action }];

    if (step.expectedResult) {
      items.push({ type: 'expectedBody', body: step.expectedResult });
    }

    return items;
  });

  return apiPost<NormalizedScenarioDto>(
    `/api/testcase/${testCaseId}/scenario`,
    { steps: apiSteps }
  );
};

export const createScenarioStep = async (
  testCaseId: number,
  body: string,
  expectedResult?: string,
  afterStepId?: number
): Promise<Result<NormalizedScenarioDto, Error>> => {
  const stepData: ScenarioStepCreateDto = { testCaseId, body };

  const queryParams: Record<string, boolean | number> = {
    withExpectedResult: true,
  };

  if (afterStepId) {
    queryParams.afterId = afterStepId;
  }

  const result = await apiPost<ScenarioStepCreatedResponseDto>(
    '/api/testcase/step',
    stepData,
    queryParams
  );

  if (!isSuccess(result)) {
    return { ok: false, error: result.error };
  }

  const { scenario: initialScenario, createdStepId } = result.value;

  if (!expectedResult) {
    return success(initialScenario);
  }

  const erResult = await apiPost<ScenarioStepCreatedResponseDto>(
    '/api/testcase/step',
    { testCaseId, parentId: createdStepId, body: expectedResult },
    { withExpectedResult: true }
  );

  if (!isSuccess(erResult)) {
    return success(initialScenario);
  }

  return success(erResult.value.scenario);
};
