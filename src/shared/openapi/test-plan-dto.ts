/** Test plan HTTP DTOs. */

export interface IdAndNameOnlyDto {
  id?: number;
  name?: string;
}

export interface TestPlanDto {
  id: number;
  name: string;
  /** Not always present in every backend version; kept for compatibility. */
  description?: string;
  projectId: number;
  baseRql?: string;
  createdBy?: string;
  createdDate?: number;
  lastModifiedBy?: string;
  lastModifiedDate?: number;
  testCasesCount?: number;
  tree?: IdAndNameOnlyDto;
}

/** Test case leaf row in a test plan tree listing. */
export interface TestCaseTreeLeafDto {
  id: number;
  name?: string;
  automated?: boolean;
  createdDate?: number;
  external?: boolean;
  lastModifiedDate?: number;
  layerName?: string;
  statusColor?: string;
  statusName?: string;
}

/** Test plan test-case statistics payload. */
export interface TestPlanStatDto {
  automated?: number;
  automatedNoDurationCount?: number;
  automatedTotalDuration?: number;
  manual?: number;
  manualNoDurationCount?: number;
  manualTotalDuration?: number;
}
