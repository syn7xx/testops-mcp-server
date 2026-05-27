import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import {
  listTestCasesInTree,
  searchTestCasesByAQL,
} from '@domain/test-case/index.js';
import { handleResult } from '../../tool-utils.js';

export function registerListTools(server: McpServer) {
  server.registerTool(
    'testcase_list_in_tree',
    {
      title: 'List Test Cases in Tree',
      description:
        'List test cases under a project tree with pagination. Use parentNodeId to page into a folder.',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
        treeId: z.number().describe('Test case tree ID'),
        parentNodeId: z
          .number()
          .optional()
          .describe('Parent folder node ID (omit for tree root)'),
        search: z.string().optional().describe('Search filter'),
        filterId: z.number().optional().describe('Saved filter ID'),
        query: z.string().optional().describe('Query string'),
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
    }) =>
      handleResult(await listTestCasesInTree(args.projectId, args.treeId, args))
  );

  server.registerTool(
    'testcase_search_by_aql',
    {
      title: 'Search Test Cases by AQL',
      description: 'Search test cases using AQL query with pagination',
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
    }) =>
      handleResult(await searchTestCasesByAQL(args.projectId, args.rql, args))
  );
}
