/**
 * TestCase Domain - Types
 */

export interface TestCase {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  tags?: Array<{ name: string }>;
}

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

export interface ScenarioStep {
  id: number;
  body?: string;
  children?: number[];
  expectedResultId?: number;
}

export interface NormalizedScenario {
  scenarioSteps: Record<number, ScenarioStep>;
  root: {
    children: number[];
  };
}

export interface CustomFieldWithValues {
  customField: {
    id: number;
    name: string;
  };
  values: Array<{
    id: number;
    name: string;
  }>;
}

export interface TestCaseSearchResult {
  testCases: TestCase[];
  total: number;
  page: number;
  size: number;
}

/** Page of tree nodes (groups and leaves) from v2 tree-node API */
export interface PageTestCaseTreeNode {
  content?: TestCaseTreeNodeItem[];
  totalElements?: number;
  number?: number;
  size?: number;
}

/** Group or leaf node; leaves expose `testCaseId` (see OpenAPI TestCaseTreeLeafDtoV2) */
export type TestCaseTreeNodeItem = Record<string, unknown>;

/** Response of GET .../test-case/tree/tree-node (TestCaseFullTreeNodeDto) */
export interface TestCaseFullTreeNode {
  id?: number;
  name?: string;
  parentNodeId?: number;
  customFieldValueId?: number;
  children?: PageTestCaseTreeNode;
}
