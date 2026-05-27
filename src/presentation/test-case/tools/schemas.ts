import * as z from 'zod';

export const testCaseIdOnly = z.object({
  id: z.number().describe('Allure test case ID (same as in TestOps UI / URL)'),
});

export const pageParams = {
  page: z.number().optional().describe('Zero-based page index'),
  size: z.number().optional().describe('Page size (max 500, default 50)'),
} as const;

export const testCaseCreateSchema = z.object({
  name: z.string().describe('Test case name (required)'),
  projectId: z.number().describe('Project ID (required)'),
  description: z.string().optional().describe('Test case description'),
  automated: z.boolean().optional().describe('Is automated test case'),
  external: z.boolean().optional().describe('Is external test case'),
  fullName: z.string().optional().describe('Full qualified name'),
  precondition: z
    .string()
    .optional()
    .describe('Precondition text (use \\n for line breaks)'),
  postcondition: z
    .string()
    .optional()
    .describe('Postcondition text (use \\n for line breaks)'),
  expectedResult: z.string().optional().describe('Expected result'),
  statusId: z.number().optional().describe('Status ID'),
  testLayerId: z.number().optional().describe('Test layer ID'),
  workflowId: z.number().optional().describe('Workflow ID'),
  tags: z
    .array(z.object({ name: z.string() }))
    .optional()
    .describe('Tags to attach'),
  steps: z
    .array(
      z.object({
        action: z.string().describe('Step action text'),
        expectedResult: z
          .string()
          .optional()
          .describe('Expected result for this step'),
      })
    )
    .optional()
    .describe('Scenario steps'),
  customFields: z
    .array(
      z.object({
        id: z.number().optional().describe('Custom field value ID'),
        name: z.string().optional().describe('Custom field value name'),
        customFieldId: z
          .number()
          .optional()
          .describe('Custom field definition ID'),
        valueIds: z
          .array(z.number())
          .optional()
          .describe('Array of value IDs to set (for multi-select fields)'),
      })
    )
    .optional()
    .describe('Custom field values'),
  links: z
    .array(
      z.object({
        name: z.string().optional(),
        type: z.string().optional(),
        url: z.string().optional(),
      })
    )
    .optional()
    .describe('External links'),
  members: z
    .array(z.object({ id: z.number() }))
    .optional()
    .describe('Team members'),
});
