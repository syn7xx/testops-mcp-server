import { apiGet } from '@shared/api.js';
import type { PageDto } from '@shared/openapi/common-dto.js';
import type {
  ProjectDto,
  ProjectSuggestionDto,
} from '@shared/openapi/project-dto.js';
import {
  createPaginated,
  PageParams,
  normalizePageParams,
  type Paginated,
} from '@shared/pagination.js';
import { Result, map } from '@shared/result.js';

/** Find projects with pagination. */
export const findProjects = async (
  params?: PageParams
): Promise<Result<Paginated<ProjectDto>, Error>> => {
  const { page, size, sort } = normalizePageParams(params);

  const response = await apiGet<PageDto<ProjectDto>>('/api/project', {
    page,
    size,
    sort,
  });

  return map(response, (data) =>
    createPaginated(
      data.content ?? [],
      data.number ?? page,
      data.size ?? size,
      data.totalElements
    )
  );
};

/** Find a project by name via suggest (exact match, then partial). */
export const findProjectByName = async (
  name: string
): Promise<Result<ProjectDto | null, Error>> => {
  const response = await apiGet<PageDto<ProjectSuggestionDto>>(
    '/api/project/suggest',
    {
      query: name,
      size: 10,
    }
  );

  return map(response, (data) => {
    const suggestions = data.content ?? [];
    if (!suggestions.length) return null;

    // Exact match
    const exact = suggestions.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (exact) return { id: exact.id, name: exact.name };

    // Partial match
    const partial = suggestions.find((s) =>
      s.name.toLowerCase().includes(name.toLowerCase())
    );
    return partial ? { id: partial.id, name: partial.name } : null;
  });
};

/** Get a project by ID. */
export const getProjectById = async (
  id: number
): Promise<Result<ProjectDto, Error>> => {
  return apiGet<ProjectDto>(`/api/project/${id}`);
};
