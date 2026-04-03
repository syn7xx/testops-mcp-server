import { apiGet } from '../../shared/api.js';
import { Result, map } from '../../shared/result.js';
import { PageParams, normalizePageParams, createPaginated, type Paginated } from '../../shared/pagination.js';
import type { Project, ProjectSuggestion } from './types.js';

interface PageResponse<T> {
    content?: T[];
    totalElements?: number;
    number?: number;
    size?: number;
}

/**
 * Find all projects with pagination
 * @param params - Pagination parameters (page, size, sort)
 * @returns Paginated list of projects
 */
export const findProjects = async (params?: PageParams): Promise<Result<Paginated<Project>, Error>> => {
    const { page, size, sort } = normalizePageParams(params);

    const response = await apiGet<PageResponse<Project>>('/api/project', {
        page,
        size,
        sort,
    });

    return map(response, (data) =>
        createPaginated(
            data.content ?? [],
            data.number ?? page,
            data.size ?? size,
            data.totalElements,
        ),
    );
};

/**
 * Find a project by name using suggest API
 * Tries exact match first, then partial match
 * @param name - Project name to search
 * @returns Project if found, null otherwise
 */
export const findProjectByName = async (name: string): Promise<Result<Project | null, Error>> => {
    const response = await apiGet<PageResponse<ProjectSuggestion>>('/api/project/suggest', {
        query: name,
        size: 10,
    });

    return map(response, (data) => {
        const suggestions = data.content ?? [];
        if (!suggestions.length) return null;

        // Exact match
        const exact = suggestions.find(
            (s) => s.name.toLowerCase() === name.toLowerCase(),
        );
        if (exact) return { id: exact.id, name: exact.name };

        // Partial match
        const partial = suggestions.find((s) =>
            s.name.toLowerCase().includes(name.toLowerCase()),
        );
        return partial ? { id: partial.id, name: partial.name } : null;
    });
};

/**
 * Get a single project by ID
 * @param id - Project ID
 * @returns Project details
 */
export const getProjectById = async (id: number): Promise<Result<Project, Error>> => {
    const response = await apiGet<Project>(`/api/project/${id}`);
    return map(response, (project) => project);
};


