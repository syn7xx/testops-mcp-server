import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import type { LaunchCreateDto } from '../../shared/openapi/launch-dto.js';
import { omitUndefined } from '../../shared/record-utils.js';
import { isSuccess } from '../../shared/result.js';
import {
  createLaunch,
  getLaunchProgress,
  getLaunchStatistic,
} from '../../domain/launch/index.js';

const launchTagSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
});

export const registerLaunchTools = (server: McpServer) => {
  server.registerTool(
    'launch_create',
    {
      title: 'Create Launch',
      description:
        'Create a test run (launch). POST /api/launch; body needs name and projectId.',
      inputSchema: z.object({
        name: z.string().min(1).describe('Launch name'),
        projectId: z.number().describe('Project ID'),
        autoclose: z.boolean().optional().describe('Autoclose when finished'),
        external: z.boolean().optional().describe('External launch flag'),
        releaseId: z.number().optional().describe('Release ID'),
        tags: z
          .array(launchTagSchema)
          .optional()
          .describe('Launch tags (id and/or name per LaunchTagDto)'),
        extra: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            'Extra LaunchCreateDto fields (e.g. issues, links) merged into JSON body'
          ),
      }),
    },
    async (args: {
      name: string;
      projectId: number;
      autoclose?: boolean;
      external?: boolean;
      releaseId?: number;
      tags?: Array<{ id?: number; name?: string }>;
      extra?: Record<string, unknown>;
    }) => {
      const body = {
        name: args.name,
        projectId: args.projectId,
        ...(args.autoclose !== undefined ? { autoclose: args.autoclose } : {}),
        ...(args.external !== undefined ? { external: args.external } : {}),
        ...(args.releaseId !== undefined ? { releaseId: args.releaseId } : {}),
        ...(args.tags?.length ? { tags: args.tags } : {}),
        ...(args.extra ? omitUndefined(args.extra) : {}),
      } as LaunchCreateDto;

      const result = await createLaunch(body);
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
    'launch_get_statistic',
    {
      title: 'Get Launch Statistic',
      description:
        'Launch run summary: counts by test status and progress (ready). GET /api/launch/{id}/statistic and GET /api/launch/{id}/progress.',
      inputSchema: z.object({
        launchId: z.number().describe('Launch ID'),
      }),
    },
    async (args: { launchId: number }) => {
      const [statisticResult, progressResult] = await Promise.all([
        getLaunchStatistic(args.launchId),
        getLaunchProgress(args.launchId),
      ]);
      if (!isSuccess(statisticResult)) {
        return {
          content: [
            { type: 'text', text: `Error: ${statisticResult.error.message}` },
          ],
          isError: true,
        };
      }
      if (!isSuccess(progressResult)) {
        return {
          content: [
            { type: 'text', text: `Error: ${progressResult.error.message}` },
          ],
          isError: true,
        };
      }
      const payload = {
        statistic: statisticResult.value,
        progress: progressResult.value,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
      };
    }
  );
};
