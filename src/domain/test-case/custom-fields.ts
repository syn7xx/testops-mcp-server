import { apiGet, apiPatch } from '@shared/api.js';
import type { PageDto } from '@shared/openapi/common-dto.js';
import type {
  CustomFieldDto,
  CustomFieldProjectWithValuesDto,
  CustomFieldWithValuesDto,
} from '@shared/openapi/test-case-dto.js';
import { normalizePageParams, type PageParams } from '@shared/pagination.js';
import { Result, map, isSuccess } from '@shared/result.js';

export async function getTestCaseCustomFields(
  testCaseId: number,
  projectId: number
): Promise<Result<CustomFieldProjectWithValuesDto[], Error>> {
  return apiGet<CustomFieldProjectWithValuesDto[]>(
    `/api/testcase/${testCaseId}/cfv`,
    { projectId }
  );
}

export const updateTestCaseCustomFields = async (
  testCaseId: number,
  fields: Array<{ customFieldId: number; valueIds: number[] }>
): Promise<Result<void, Error>> => {
  const payload: CustomFieldWithValuesDto[] = fields.map((f) => ({
    customField: { id: f.customFieldId },
    values: f.valueIds.map((id) => ({ id })),
  }));

  const result = await apiPatch<void>(
    `/api/testcase/${testCaseId}/cfv`,
    payload
  );
  return map(result, () => undefined);
};

export interface ProjectCustomFieldDto {
  id?: number;
  name?: string;
  archived?: boolean;
  values?: Array<{ id: number; name: string }>;
}

export interface ProjectCustomFieldsResult {
  items: ProjectCustomFieldDto[];
  total: number;
  page: number;
  size: number;
}

export const getProjectCustomFields = async (
  projectId: number,
  params?: PageParams
): Promise<Result<ProjectCustomFieldsResult, Error>> => {
  const { page, size } = normalizePageParams(params);

  const result = await apiGet<PageDto<CustomFieldDto>>(
    `/api/project/${projectId}/cf`,
    { page, size }
  );

  if (!isSuccess(result)) {
    return result;
  }

  const { content, totalElements, number } = result.value;

  return {
    ok: true,
    value: {
      items: (content ?? []).map((cf) => ({
        id: cf.id,
        name: cf.name,
        archived: cf.archived,
      })),
      total: totalElements ?? 0,
      page: number ?? page,
      size,
    },
  };
};

export const getProjectCustomFieldValues = async (
  projectId: number,
  customFieldId: number,
  params?: PageParams
): Promise<
  Result<
    {
      items: Array<{ id: number; name: string }>;
      total: number;
      page: number;
      size: number;
    },
    Error
  >
> => {
  const { page, size } = normalizePageParams(params);

  const result = await apiGet<
    PageDto<{ id: number; name: string; testCasesCount?: number }>
  >(`/api/project/${projectId}/cfv`, { customFieldId, page, size });

  if (!isSuccess(result)) {
    return result;
  }

  const { content, totalElements, number } = result.value;

  return {
    ok: true,
    value: {
      items: (content ?? []).map((v) => ({ id: v.id, name: v.name })),
      total: totalElements ?? 0,
      page: number ?? page,
      size,
    },
  };
};
