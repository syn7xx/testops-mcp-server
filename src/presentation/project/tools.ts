import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { isSuccess } from '../../shared/result.js';
import {
  findProjects,
  findProjectByName,
  getProjectById,
} from '../../domain/project/index.js';

export const registerProjectTools = (server: McpServer) => {
  server.registerTool(
    'project_list',
    {
      title: 'List Projects',
      description: 'List all projects with pagination',
      inputSchema: z.object({
        page: z.number().optional().describe('Page number (zero-based)'),
        size: z.number().optional().describe('Page size (max 100)'),
        sort: z.string().optional().describe('Sort (e.g., "name,ASC")'),
      }),
    },
    async (args: { page?: number; size?: number; sort?: string }) => {
      const result = await findProjects(args);

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
    'project_find_by_name',
    {
      title: 'Find Project by Name',
      description: 'Find a project by exact or partial name match',
      inputSchema: z.object({
        name: z.string().describe('Project name to search'),
      }),
    },
    async (args: { name: string }) => {
      const result = await findProjectByName(args.name);

      if (!isSuccess(result)) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error.message}` }],
          isError: true,
        };
      }

      if (!result.value) {
        return {
          content: [{ type: 'text', text: `Project "${args.name}" not found` }],
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
    'project_get_by_id',
    {
      title: 'Get Project by ID',
      description: 'Get a project by its ID',
      inputSchema: z.object({
        id: z.number().describe('Project ID'),
      }),
    },
    async (args: { id: number }) => {
      const result = await getProjectById(args.id);

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
