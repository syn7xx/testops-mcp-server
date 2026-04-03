/** Test case HTTP DTOs (including project tree node types). */

import type { ExternalLinkDto } from '@shared/openapi/launch-dto.js';

export interface TestTagDto {
  id?: number;
  name?: string;
}

export interface TestCaseDto {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  createdDate?: number;
  tags?: TestTagDto[];
  projectId?: number;
  automated?: boolean;
  deleted?: boolean;
  descriptionHtml?: string;
  duration?: number;
  fullName?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: number;
  links?: ExternalLinkDto[];
}

export interface NormalizedScenarioStepDto {
  id?: number;
  body?: string;
  children?: number[];
  expectedResult?: string;
  expectedResultId?: number;
}

/** Normalized scenario (steps API and scenario replace). */
export interface NormalizedScenarioDto {
  root?: NormalizedScenarioStepDto;
  scenarioSteps?: Record<number, NormalizedScenarioStepDto>;
}

export interface CustomFieldDto {
  id: number;
  name: string;
}

export interface CustomFieldValueDto {
  id: number;
  name: string;
}

/** CFV item: optional `customField` and `values` per OpenAPI CustomFieldWithValuesDto (no required keys). */
export interface CustomFieldWithValuesDto {
  customField?: CustomFieldDto;
  values?: CustomFieldValueDto[];
}

/** One entry in `PageTestCaseTreeNodeDto.content` (group or leaf). */
export type TestCaseTreeNodeItemDto = Record<string, unknown>;

export interface PageTestCaseTreeNodeDto {
  content?: TestCaseTreeNodeItemDto[];
  totalElements?: number;
  number?: number;
  size?: number;
}

/** Project test-case tree node (v2 tree-node response). */
export interface TestCaseFullTreeNodeDto {
  id?: number;
  name?: string;
  parentNodeId?: number;
  customFieldValueId?: number;
  children?: PageTestCaseTreeNodeDto;
}
