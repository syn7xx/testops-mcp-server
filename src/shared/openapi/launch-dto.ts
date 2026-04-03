/**
 * Request/response DTOs for launch and test-plan run HTTP APIs.
 */

/** Tag attached to a launch. */
export interface LaunchTagDto {
  id?: number;
  name?: string;
}

/** External link on a launch. */
export interface ExternalLinkDto {
  name?: string;
  type?: string;
  url?: string;
}

/** Integration type string accepted by the backend. */
export type IntegrationTypeDto = string;

/** Issue linked to a launch. */
export interface IssueDto {
  closed?: boolean;
  displayName?: string;
  id?: number;
  integrationId?: number;
  integrationType?: IntegrationTypeDto;
  name?: string;
  status?: string;
  summary?: string;
  url?: string;
}

/** Environment variable definition. */
export interface EnvVarDto {
  createdBy?: string;
  createdDate?: number;
  id?: number;
  lastModifiedBy?: string;
  lastModifiedDate?: number;
  name?: string;
}

/** Variable value in an environment set. */
export interface EnvVarValueDto {
  id?: number;
  name?: string;
  variable?: EnvVarDto;
}

/** Named set of environment variable values. */
export interface EnvironmentSetDto {
  values?: EnvVarValueDto[];
}

/** Body for `POST /api/launch`. Required: `name`, `projectId`. */
export interface LaunchCreateDto {
  name: string;
  projectId: number;
  autoclose?: boolean;
  external?: boolean;
  issues?: IssueDto[];
  links?: ExternalLinkDto[];
  releaseId?: number;
  tags?: LaunchTagDto[];
}

/** Launch returned by `POST /api/launch` and `POST /api/testplan/{id}/run`. */
export interface LaunchDto {
  autoclose?: boolean;
  closed?: boolean;
  createdBy?: string;
  createdDate?: number;
  external?: boolean;
  id?: number;
  issues?: IssueDto[];
  lastModifiedBy?: string;
  lastModifiedDate?: number;
  links?: ExternalLinkDto[];
  name?: string;
  projectId?: number;
  releaseId?: number;
  tags?: LaunchTagDto[];
}

/** Count of test results for one status (`GET /api/launch/{id}/statistic`). */
export interface TestStatusCountDto {
  count?: number;
  /** Backend test status enum value (e.g. passed, failed, broken). */
  status?: string;
}

/** Launch progress widget payload (`GET /api/launch/{id}/progress`). */
export interface LaunchProgressDto {
  ready?: boolean;
}

/** Body for `POST /api/testplan/{id}/run`. Required: `launchName`. */
export interface TestPlanRunRequestDto {
  envVarValueSets?: EnvironmentSetDto[];
  issues?: IssueDto[];
  launchName: string;
  links?: ExternalLinkDto[];
  releaseId?: number;
  tags?: LaunchTagDto[];
}
