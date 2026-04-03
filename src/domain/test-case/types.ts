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
