import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import type { TestPlanRunRequestDto } from '@shared/openapi/launch-dto.js';
import { omitUndefined } from '@shared/record-utils.js';
import { isSuccess } from '@shared/result.js';
import {
  getTestPlan,
  getTestPlanTestCases,
  runTestPlan,
  syncTestPlan,
} from '@domain/test-plan/index.js';

const launchTagSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
});

/** Register test plan MCP tools. */
export const registerTestPlanTools = (server: McpServer) => {
  server.registerTool(
    'testplan_get',
    {
      title: 'Get Test Plan',
      description: 'Get a test plan by ID',
      inputSchema: z.object({
        id: z.number().describe('Test plan ID'),
      }),
    },
    async (args: { id: number }) => {
      const result = await getTestPlan(args.id);

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
    'testplan_get_test_cases',
    {
      title: 'Get Test Plan Test Cases',
      description: 'Get test cases from a test plan with pagination',
      inputSchema: z.object({
        id: z.number().describe('Test plan ID'),
        page: z.number().optional().describe('Page number (zero-based)'),
        size: z.number().optional().describe('Page size (max 100)'),
        sort: z.string().optional().describe('Sort (e.g., "name,ASC")'),
      }),
    },
    async (args: {
      id: number;
      page?: number;
      size?: number;
      sort?: string;
    }) => {
      const result = await getTestPlanTestCases(args.id, args);

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
                items: result.value.items,
                page: result.value.page,
                size: result.value.size,
                totalElements: result.value.totalElements,
                hasNext: result.value.hasNext,
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
    'testplan_run',
    {
      title: 'Run Test Plan',
      description:
        'Create a launch from a test plan. Body requires launchName.',
      inputSchema: z.object({
        id: z.number().describe('Test plan ID'),
        launchName: z
          .string()
          .min(1)
          .describe('Name for the new launch (1–255 chars)'),
        releaseId: z.number().optional().describe('Release ID'),
        tags: z
          .array(launchTagSchema)
          .optional()
          .describe('Launch tags (LaunchTagDto)'),
        extra: z
          .record(z.string(), z.unknown())
          .optional()
          .describe('Extra body fields (e.g. envVarValueSets, issues, links)'),
      }),
    },
    async (args: {
      id: number;
      launchName: string;
      releaseId?: number;
      tags?: Array<{ id?: number; name?: string }>;
      extra?: Record<string, unknown>;
    }) => {
      const body = {
        launchName: args.launchName,
        ...(args.releaseId !== undefined ? { releaseId: args.releaseId } : {}),
        ...(args.tags?.length ? { tags: args.tags } : {}),
        ...(args.extra ? omitUndefined(args.extra) : {}),
      } as TestPlanRunRequestDto;

      const result = await runTestPlan(args.id, body);
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
    'testplan_sync',
    {
      title: 'Sync Test Plan',
      description:
        'Sync test plan with its source: refreshes the test case list in the plan to match the current source.',
      inputSchema: z.object({
        id: z.number().describe('Test plan ID'),
      }),
    },
    async (args: { id: number }) => {
      const result = await syncTestPlan(args.id);

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
