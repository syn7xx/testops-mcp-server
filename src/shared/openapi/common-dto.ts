/** Shared shapes for paginated API responses. */

/** Spring-style page wrapper with content and totals. */
export interface PageDto<T> {
  content?: T[];
  totalElements?: number;
  number?: number;
  size?: number;
}
