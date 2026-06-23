import { describe, it, expect } from 'vitest';
import { normalizePageParams, createPaginated } from '@shared/pagination.js';

describe('Pagination', () => {
  describe('normalizePageParams', () => {
    it('returns defaults for undefined params', () => {
      const result = normalizePageParams(undefined);
      expect(result.page).toBe(0);
      expect(result.size).toBe(50);
      expect(result.sort).toBe('id,DESC');
    });

    it('returns defaults for empty object', () => {
      const result = normalizePageParams({});
      expect(result.page).toBe(0);
      expect(result.size).toBe(50);
      expect(result.sort).toBe('id,DESC');
    });

    it('clamps negative page to 0', () => {
      const result = normalizePageParams({ page: -5 });
      expect(result.page).toBe(0);
    });

    it('clamps size below 1 to 1', () => {
      const result = normalizePageParams({ size: 0 });
      expect(result.size).toBe(1);
    });

    it('clamps size above 100 to 100', () => {
      const result = normalizePageParams({ size: 200 });
      expect(result.size).toBe(100);
    });

    it('preserves custom sort', () => {
      const result = normalizePageParams({ sort: 'name,ASC' });
      expect(result.sort).toBe('name,ASC');
    });

    it('respects valid page and size', () => {
      const result = normalizePageParams({ page: 3, size: 25 });
      expect(result.page).toBe(3);
      expect(result.size).toBe(25);
    });
  });

  describe('createPaginated', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

    it('computes totals from items when totalElements not provided', () => {
      const p = createPaginated(items, 0, 3);
      expect(p.totalElements).toBe(3);
      expect(p.totalPages).toBe(1);
      expect(p.hasNext).toBe(false);
      expect(p.hasPrevious).toBe(false);
    });

    it('uses explicit totalElements', () => {
      const p = createPaginated(items, 0, 3, 42);
      expect(p.totalElements).toBe(42);
      expect(p.totalPages).toBe(14); // ceil(42/3)
    });

    it('detects hasNext', () => {
      const p = createPaginated(items, 0, 3, 30);
      expect(p.hasNext).toBe(true);
    });

    it('detects hasPrevious', () => {
      const p = createPaginated(items, 3, 10, 100);
      expect(p.hasPrevious).toBe(true);
    });

    it('handles empty list', () => {
      const p = createPaginated([], 0, 10);
      expect(p.items).toHaveLength(0);
      expect(p.totalElements).toBe(0);
      expect(p.totalPages).toBe(0);
      expect(p.hasNext).toBe(false);
    });

    it('returns last page without next', () => {
      // 30 elements, page size 10: pages 0,1,2
      const p = createPaginated(items, 2, 10, 30);
      expect(p.hasNext).toBe(false);
      expect(p.hasPrevious).toBe(true);
    });
  });
});
