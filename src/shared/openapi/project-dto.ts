/** Project HTTP DTOs. */

export interface ProjectDto {
  id: number;
  name: string;
  abbr?: string;
  automationPercent?: number;
  createdBy?: string;
  createdDate?: number;
  description?: string;
  descriptionHtml?: string;
  favorite?: boolean;
  isPublic?: boolean;
  isVersioned?: boolean;
  lastModifiedBy?: string;
  lastModifiedDate?: number;
  launchCount?: number;
}

/** Suggest endpoint row; same core fields as list items. */
export type ProjectSuggestionDto = Pick<ProjectDto, 'id' | 'name'>;
