/** Launch test results — flat list (paged). */

export interface TestResultFlatDto {
  id?: number;
  name?: string;
  testCaseId?: number;
  status?: string;
  duration?: number;
  flaky?: boolean;
  hidden?: boolean;
  manual?: boolean;
  assignee?: string;
  testedBy?: string;
  layerName?: string;
  createdDate?: number;
  lastModifiedDate?: number;
  start?: number;
  stop?: number;
}

export interface PageTestResultFlatDto {
  content?: TestResultFlatDto[];
  totalElements?: number;
  number?: number;
  size?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}
