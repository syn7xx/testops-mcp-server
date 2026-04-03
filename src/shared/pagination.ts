/** Pagination request parameters */
export interface PageParams {
    page?: number;
    size?: number;
    sort?: string;
}

/** Paginated response structure */
export interface Paginated<T> {
    items: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/** Default pagination values */
export const DEFAULT_PAGE = 0;
export const DEFAULT_SIZE = 50;
export const MAX_SIZE = 100;

/**
 * Normalizes pagination params with defaults and limits
 * @param params - Optional pagination parameters
 * @returns Normalized params with enforced limits
 */
export const normalizePageParams = (params?: PageParams): Required<PageParams> => ({
    page: Math.max(0, params?.page ?? DEFAULT_PAGE),
    size: Math.min(MAX_SIZE, Math.max(1, params?.size ?? DEFAULT_SIZE)),
    sort: params?.sort ?? 'id,DESC',
});

/**
 * Creates a Paginated response from API data
 * @param items - Array of items for current page
 * @param page - Current page number
 * @param size - Page size
 * @param totalElements - Total count (optional, inferred from items length)
 */
export const createPaginated = <T>(
    items: T[],
    page: number,
    size: number,
    totalElements?: number,
): Paginated<T> => {
    const total = totalElements ?? items.length;
    const totalPages = Math.ceil(total / size);

    return {
        items,
        page,
        size,
        totalElements: total,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
    };
};

/** Client-side array pagination (fallback) */
export const paginateArray = <T>(items: T[], page: number, size: number): T[] => {
    const start = page * size;
    return items.slice(start, start + size);
};
