import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import {
  getTestCase,
  getTestCaseDetail,
  getTestCaseScenario,
  getTestCaseCustomFields,
} from '@domain/test-case/index.js';
import { handleResult } from '../../tool-utils.js';
import { testCaseIdOnly } from './schemas.js';

export function registerReadTools(server: McpServer) {
  server.registerTool(
    'testcase_get',
    {
      title: 'Get Test Case',
      description: 'Get a test case by ID',
      inputSchema: z.object({
        id: z.number().describe('Test case ID'),
      }),
    },
    async (args: { id: number }) => handleResult(await getTestCase(args.id))
  );

  server.registerTool(
    'testcase_get_detail',
    {
      title: 'Get Test Case Detail',
      description:
        'Aggregated card: name, description, tags, custom fields, and step texts as a simple list.',
      annotations: { readOnlyHint: true },
      inputSchema: z.object({
        id: z.number().describe('Test case ID'),
        projectId: z
          .number()
          .optional()
          .describe('Project ID (optional, falls back to test case projectId)'),
      }),
    },
    async (args: { id: number; projectId?: number }) =>
      handleResult(await getTestCaseDetail(args.id, args.projectId))
  );

  server.registerTool(
    'testcase_get_scenario',
    {
      title: 'Get Test Case Scenario',
      description:
        'Normalized scenario JSON (scenarioSteps, step bodies, expected results).',
      annotations: { readOnlyHint: true },
      inputSchema: testCaseIdOnly,
    },
    async (args: { id: number }) =>
      handleResult(await getTestCaseScenario(args.id))
  );

  server.registerTool(
    'testcase_get_step',
    {
      title: 'Get Test Case Steps',
      description: 'Alias for testcase_get_scenario.',
      annotations: { readOnlyHint: true },
      inputSchema: testCaseIdOnly,
    },
    async (args: { id: number }) =>
      handleResult(await getTestCaseScenario(args.id))
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
    async (args: { id: number; projectId: number }) =>
      handleResult(await getTestCaseCustomFields(args.id, args.projectId))
  );
}
