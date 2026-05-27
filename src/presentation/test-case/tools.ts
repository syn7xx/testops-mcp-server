import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { isSuccess } from '@shared/result.js';
import {
  getTestCase,
  getTestCaseDetail,
  getTestCaseScenario,
  updateScenarioStep,
  setTestCaseScenario,
  getTestCaseCustomFields,
  updateTestCaseCustomFields,
  searchTestCasesByAQL,
  listTestCasesInTree,
  createTestCase,
  createScenarioStep,
  getProjectCustomFields,
  getProjectCustomFieldValues,
} from '@domain/test-case/index.js';

function normalizeLineBreaks(text: string | undefined): string | undefined {
  if (!text) return text;
  return text.replace(/\\n/g, '\n');
}

const testCaseIdOnly = z.object({
  id: z.number().describe('Allure test case ID (same as in TestOps UI / URL)'),
});

async function handleGetTestCaseScenario(args: { id: number }) {
  const result = await getTestCaseScenario(args.id);
  if (!isSuccess(result)) {
    return {
      content: [
        { type: 'text' as const, text: `Error: ${result.error.message}` },
      ],
      isError: true,
    };
  }
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result.value, null, 2),
      },
    ],
  };
}

/** Register test case MCP tools. */
export const registerTestCaseTools = (server: McpServer) => {
  server.registerTool(
    'testcase_get',
    {
      title: 'Get Test Case',
      description: 'Get a test case by ID',
      inputSchema: z.object({
        id: z.number().describe('Test case ID'),
      }),
    },
    async (args: { id: number }) => {
      const result = await getTestCase(args.id);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_get_detail',
    {
      title: 'Get Test Case Detail',
      description:
        'Aggregated card: name, description, tags, custom fields, and step texts as a simple list. For the raw scenario graph (step actions and expected results per step), use testcase_get_scenario or testcase_get_step instead — not this tool.',
      annotations: { readOnlyHint: true },
      inputSchema: z.object({
        id: z.number().describe('Test case ID'),
        projectId: z.number().optional().describe('Project ID (optional, will use test case projectId if omitted)'),
      }),
    },
    async (args: { id: number; projectId?: number }) => {
      const result = await getTestCaseDetail(args.id, args.projectId);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_get_scenario',
    {
      title: 'Get Test Case Scenario',
      description:
        'Normalized scenario JSON (scenarioSteps, step bodies, expected results). For steps and expected results use this or testcase_get_step only — call by this exact name from tools/list.',
      annotations: { readOnlyHint: true },
      inputSchema: testCaseIdOnly,
    },
    handleGetTestCaseScenario
  );

  server.registerTool(
    'testcase_get_step',
    {
      title: 'Get Test Case Steps',
      description:
        'Same as testcase_get_scenario (alias). Use either name from tools/list for scenario JSON; do not invent variants (e.g. get_steps).',
      annotations: { readOnlyHint: true },
      inputSchema: testCaseIdOnly,
    },
    handleGetTestCaseScenario
  );

  server.registerTool(
    'testcase_update_step',
    {
      title: 'Update Scenario Step',
      description:
        'Update one scenario step by its step id from testcase_get_scenario; test case id is not used by the API.',
      inputSchema: z.object({
        stepId: z
          .number()
          .describe(
            'Scenario step id (from normalized scenario / testcase_get_scenario)'
          ),
        body: z.string().optional().describe('New step action'),
        expectedResult: z.string().optional().describe('New expected result'),
      }),
    },
    async (args: {
      stepId: number;
      body?: string;
      expectedResult?: string;
    }) => {
      const result = await updateScenarioStep(args.stepId, {
        body: args.body,
        expectedResult: args.expectedResult,
      });
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_set_scenario',
    {
      title: 'Set Test Case Scenario',
      description: 'Replace all steps in a test case scenario',
      inputSchema: z.object({
        id: z.number().describe('Test case ID'),
        steps: z
          .array(
            z.object({
              action: z.string().describe('Step action'),
              expectedResult: z.string().optional().describe('Expected result'),
            })
          )
          .describe('Steps to set'),
      }),
    },
    async (args: {
      id: number;
      steps: Array<{ action: string; expectedResult?: string }>;
    }) => {
      const result = await setTestCaseScenario(args.id, args.steps);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_get_custom_fields',
    {
      title: 'Get Test Case Custom Fields',
      description: 'Get custom field values for a test case',
      inputSchema: z.object({
        id: z.number().describe('Test case ID'),
        projectId: z.number().describe('Project ID'),
      }),
    },
    async (args: { id: number; projectId: number }) => {
      const result = await getTestCaseCustomFields(args.id, args.projectId);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_update_custom_fields',
    {
      title: 'Update Test Case Custom Fields',
      description: 'Update custom field values for a test case',
      inputSchema: z.object({
        id: z.number().describe('Test case ID'),
        fields: z
          .array(
            z.object({
              customFieldId: z.number().describe('Custom field ID'),
              valueIds: z.array(z.number()).describe('Value IDs to set'),
            })
          )
          .describe('Custom fields to update'),
      }),
    },
    async (args: {
      id: number;
      fields: Array<{ customFieldId: number; valueIds: number[] }>;
    }) => {
      const result = await updateTestCaseCustomFields(args.id, args.fields);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true }, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_list_in_tree',
    {
      title: 'List Test Cases in Tree',
      description:
        'List test cases under a project tree. Requires treeId. Returns a tree node with paginated children; leaf nodes include testCaseId. Use parentNodeId to page into a folder.',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
        treeId: z.number().describe('Test case tree ID'),
        parentNodeId: z
          .number()
          .optional()
          .describe('Parent folder node ID (omit for tree root)'),
        search: z.string().optional().describe('Search filter'),
        filterId: z.number().optional().describe('Saved filter ID'),
        query: z.string().optional().describe('Query string (API `query`)'),
        baseAql: z
          .string()
          .optional()
          .describe('Base AQL applied on the server'),
        page: z.number().optional().describe('Page index (0-based)'),
        size: z.number().optional().describe('Page size'),
        sort: z.string().optional().describe('Sort, e.g. name,ASC'),
      }),
    },
    async (args: {
      projectId: number;
      treeId: number;
      parentNodeId?: number;
      search?: string;
      filterId?: number;
      query?: string;
      baseAql?: string;
      page?: number;
      size?: number;
      sort?: string;
    }) => {
      const result = await listTestCasesInTree(
        args.projectId,
        args.treeId,
        args
      );
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_search_by_aql',
    {
      title: 'Search Test Cases by AQL',
      description: 'Search test cases using AQL query',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
        rql: z.string().describe('AQL query'),
        deleted: z.boolean().optional().describe('Include deleted'),
        page: z.number().optional().describe('Page number'),
        size: z.number().optional().describe('Page size'),
        sort: z.string().optional().describe('Sort criteria'),
      }),
    },
    async (args: {
      projectId: number;
      rql: string;
      deleted?: boolean;
      page?: number;
      size?: number;
      sort?: string;
    }) => {
      const result = await searchTestCasesByAQL(args.projectId, args.rql, args);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                testCases: result.value.testCases,
                total: result.value.total,
                page: result.value.page,
                size: result.value.size,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    'testcase_create',
    {
      title: 'Create Test Case',
      description:
        'Create a new test case in TestOps. Required: name and projectId. Optional: description, automated, tags, scenario steps, customFields, etc.',
      inputSchema: z.object({
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
      }),
    },
    async (args) => {
      const createData: {
        name: string;
        projectId: number;
        description?: string;
        automated?: boolean;
        external?: boolean;
        fullName?: string;
        precondition?: string;
        postcondition?: string;
        expectedResult?: string;
        statusId?: number;
        testLayerId?: number;
        workflowId?: number;
        tags?: Array<{ name: string }>;
        customFields?: Array<{ id?: number; name?: string; customField?: { id: number }; valueIds?: number[] }>;
        links?: Array<{ name?: string; type?: string; url?: string }>;
        members?: Array<{ id?: number }>;
      } = {
        name: args.name,
        projectId: args.projectId,
      };

      if (args.description !== undefined) createData.description = args.description;
      if (args.automated !== undefined) createData.automated = args.automated;
      if (args.external !== undefined) createData.external = args.external;
      if (args.fullName !== undefined) createData.fullName = args.fullName;
      if (args.precondition !== undefined) createData.precondition = normalizeLineBreaks(args.precondition);
      if (args.postcondition !== undefined) createData.postcondition = normalizeLineBreaks(args.postcondition);
      if (args.expectedResult !== undefined) createData.expectedResult = args.expectedResult;
      if (args.statusId !== undefined) createData.statusId = args.statusId;
      if (args.testLayerId !== undefined) createData.testLayerId = args.testLayerId;
      if (args.workflowId !== undefined) createData.workflowId = args.workflowId;
      if (args.tags !== undefined) createData.tags = args.tags;
      if (args.links !== undefined) createData.links = args.links;
      if (args.members !== undefined) createData.members = args.members;

      if (args.customFields !== undefined) {
        createData.customFields = args.customFields.map((cf) => ({
          id: cf.id,
          name: cf.name,
          customField: cf.customFieldId
            ? { id: cf.customFieldId }
            : undefined,
          valueIds: cf.valueIds,
        }));
      }

      const result = await createTestCase(createData);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }

      const testCase = result.value;

      if (args.steps && args.steps.length > 0 && testCase.id) {
        let lastStepId: number | undefined;

        for (const step of args.steps) {
          const stepResult = await createScenarioStep(
            testCase.id,
            step.action,
            step.expectedResult,
            lastStepId
          );

          if (!isSuccess(stepResult)) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Test case created (id: ${testCase.id}), but failed to add step: ${stepResult.error.message}`,
                },
              ],
              isError: true,
            };
          }

          const scenario = stepResult.value;
          if (scenario.root?.children?.length) {
            lastStepId = scenario.root.children[scenario.root.children.length - 1];
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(testCase, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'project_get_custom_fields',
    {
      title: 'Get Project Custom Fields',
      description:
        'Get all custom fields for a project. Returns custom field definitions with their IDs and names.',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
      }),
    },
    async (args: { projectId: number }) => {
      const result = await getProjectCustomFields(args.projectId);
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    'project_get_custom_field_values',
    {
      title: 'Get Project Custom Field Values',
      description:
        'Get all available values for a specific custom field in a project. Use this to find the value IDs for setting custom fields.',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
        customFieldId: z.number().describe('Custom field ID'),
      }),
    },
    async (args: { projectId: number; customFieldId: number }) => {
      const result = await getProjectCustomFieldValues(
        args.projectId,
        args.customFieldId
      );
      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify(result.value, null, 2) },
        ],
      };
    }
  );
};
