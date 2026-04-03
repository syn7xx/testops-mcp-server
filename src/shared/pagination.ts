/** Page index, size, and sort for list requests. */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

/** Client-side page of items with totals. */
export interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 50;
const MAX_SIZE = 100;

/** Normalize page, size, and sort with bounds. */
export const normalizePageParams = (
  params?: PageParams
): Required<PageParams> => ({
  page: Math.max(0, params?.page ?? DEFAULT_PAGE),
  size: Math.min(MAX_SIZE, Math.max(1, params?.size ?? DEFAULT_SIZE)),
  sort: params?.sort ?? 'id,DESC',
});

/** Build paginated view from a slice and total count. */
export const createPaginated = <T>(
  items: T[],
  page: number,
  size: number,
  totalElements?: number
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
