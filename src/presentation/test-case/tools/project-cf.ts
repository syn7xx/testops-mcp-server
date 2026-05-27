import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import {
  getProjectCustomFields,
  getProjectCustomFieldValues,
} from '@domain/test-case/index.js';
import { handleResult } from '../../tool-utils.js';
import { pageParams } from './schemas.js';

export function registerProjectTools(server: McpServer) {
  server.registerTool(
    'project_get_custom_fields',
    {
      title: 'Get Project Custom Fields',
      description:
        'Get custom field definitions for a project with pagination. Returns { items, total, page, size } for chunked fetching.',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
        ...pageParams,
      }),
    },
    async (args: { projectId: number; page?: number; size?: number }) =>
      handleResult(
        await getProjectCustomFields(args.projectId, {
          page: args.page,
          size: args.size,
        })
      )
  );

  server.registerTool(
    'project_get_custom_field_values',
    {
      title: 'Get Project Custom Field Values',
      description:
        'Get available values for a custom field with pagination. Returns { items, total, page, size } so the model can fetch in chunks.',
      inputSchema: z.object({
        projectId: z.number().describe('Project ID'),
        customFieldId: z.number().describe('Custom field ID'),
        ...pageParams,
      }),
    },
    async (args: {
      projectId: number;
      customFieldId: number;
      page?: number;
      size?: number;
    }) =>
      handleResult(
        await getProjectCustomFieldValues(args.projectId, args.customFieldId, {
          page: args.page,
          size: args.size,
        })
      )
  );
}
