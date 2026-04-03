import type { TestCaseDto } from '@shared/openapi/test-case-dto.js';

/** Aggregated detail built from multiple endpoints (not a single API DTO). */
export interface TestCaseDetail {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  steps: string[];
  customFields: Record<string, string>;
  tags: string[];
  owner: string;
}

/** AQL search page with test cases and totals. */
export interface TestCaseSearchResult {
  testCases: TestCaseDto[];
  total: number;
  page: number;
  size: number;
}
