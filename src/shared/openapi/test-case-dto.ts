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
  external?: boolean;
  precondition?: string;
  preconditionHtml?: string;
  postcondition?: string;
  postconditionHtml?: string;
  expectedResult?: string;
  expectedResultHtml?: string;
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
  id?: number;
  name?: string;
  archived?: boolean;
}

export interface CustomFieldValueDto {
  id: number;
  name?: string;
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

export interface ExpectedBodyStepDto {
  type: 'expectedBody';
  body?: string;
}

export interface BodyStepDto {
  type: 'body';
  body?: string;
  steps?: ExpectedBodyStepDto[];
}

export interface AttachmentStepDto {
  type: 'attachment';
  attachmentId: number;
}

export interface SharedStepStepDto {
  type: 'sharedStep';
  sharedStepId: number;
}

export type TestCaseStepDto =
  | BodyStepDto
  | ExpectedBodyStepDto
  | AttachmentStepDto
  | SharedStepStepDto;

export interface TestCaseScenarioV2Dto {
  steps?: TestCaseStepDto[];
}

export interface CustomFieldValueWithCfDto {
  id?: number;
  name?: string;
  global?: boolean;
  customField?: CustomFieldDto;
}

export interface CustomFieldProjectDto {
  id?: number;
  name?: string;
  customField?: CustomFieldDto;
  projectId?: number;
  locked?: boolean;
  required?: boolean;
}

export interface CustomFieldProjectWithValuesDto {
  customField?: CustomFieldProjectDto;
  values?: CustomFieldValueDto[];
}

export interface ScenarioStepCreateDto {
  testCaseId?: number;
  body?: string;
  parentId?: number;
  attachmentId?: number;
  sharedStepId?: number;
}

export interface ScenarioStepCreatedResponseDto {
  createdStepId: number;
  scenario: NormalizedScenarioDto;
}

export interface MemberDto {
  id?: number;
  name?: string;
}

export interface TestCaseCreateV2Dto {
  name: string;
  projectId: number;
  description?: string;
  automated?: boolean;
  deleted?: boolean;
  external?: boolean;
  fullName?: string;
  precondition?: string;
  postcondition?: string;
  expectedResult?: string;
  statusId?: number;
  testLayerId?: number;
  workflowId?: number;
  scenario?: TestCaseScenarioV2Dto;
  tags?: TestTagDto[];
  customFields?: CustomFieldValueWithCfDto[];
  links?: ExternalLinkDto[];
  members?: MemberDto[];
}
