import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import type { TestPlanRunRequestDto } from '@shared/openapi/launch-dto.js';
import { omitUndefined } from '@shared/record-utils.js';
import { isSuccess } from '@shared/result.js';
import {
  listTestPlans,
  getTestPlan,
  getTestPlanStat,
  getTestPlanTestCases,
  runTestPlan,
  syncTestPlan,
} from '@domain/test-plan/index.js';
import { handleResult } from '../tool-utils.js';

const launchTagSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
});

export const registerTestPlanTools = (server: McpServer) => {
  server.registerTool(
    'testplan_list',
    {
      title: 'List Test Plans',
      description: 'List test plans for a project with pagination',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
        page: z.number().optional().describe('Page number (zero-based)'),
        size: z.number().optional().describe('Page size (max 100)'),
        sort: z.string().optional().describe('Sort (e.g., "name,ASC")'),
      }),
    },
    async (args: {
      projectId: number;
      page?: number;
      size?: number;
      sort?: string;
    }) => {
      const result = await listTestPlans(args.projectId, args);
      if (!isSuccess(result)) {
        return handleResult(result);
      }
      const { items, page, size, totalElements, hasNext } = result.value;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { items, page, size, totalElements, hasNext },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    'testplan_get',
    {
      title: 'Get Test Plan',
      description: 'Get a test plan by ID',
      inputSchema: z.object({
        id: z.number().describe('Test plan ID'),
      }),
    },
    async (args: { id: number }) => handleResult(await getTestPlan(args.id))
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
        return handleResult(result);
      }
      const { items, page, size, totalElements, hasNext } = result.value;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { items, page, size, totalElements, hasNext },
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
      const body: TestPlanRunRequestDto = {
        launchName: args.launchName,
        ...omitUndefined({
          releaseId: args.releaseId,
          tags: args.tags?.length ? args.tags : undefined,
          ...args.extra,
        }),
      };

      return handleResult(await runTestPlan(args.id, body));
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
    async (args: { id: number }) => handleResult(await syncTestPlan(args.id))
  );

  server.registerTool(
    'testplan_get_stat',
    {
      title: 'Get Test Plan Statistic',
      description:
        'Test plan statistics: automated/manual counts, durations. Useful before running to estimate effort.',
      inputSchema: z.object({
        id: z.number().describe('Test plan ID'),
      }),
    },
    async (args: { id: number }) => handleResult(await getTestPlanStat(args.id))
  );
};
