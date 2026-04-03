/**
 * TestPlan Domain - Types
 */

export interface TestPlan {
  id: number;
  name: string;
  description?: string;
  projectId: number;
}

export interface TestPlanTestCase {
  id: number;
  name: string;
}

export interface TestPlanLeaf {
  id: number;
  name?: string;
}
