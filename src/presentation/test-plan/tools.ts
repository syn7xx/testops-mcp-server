import * as z from 'zod';
import { isSuccess } from '../../shared/result.js';
import {
    getTestPlan,
    getTestPlanTestCases,
} from '../../domain/test-plan/index.js';

export const registerTestPlanTools = (server: any) => {
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
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }

            return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
        },
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
        async (args: { id: number; page?: number; size?: number; sort?: string }) => {
            const result = await getTestPlanTestCases(args.id, args);

            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        items: result.value.items,
                        page: result.value.page,
                        size: result.value.size,
                        totalElements: result.value.totalElements,
                        hasNext: result.value.hasNext,
                    }, null, 2),
                }],
            };
        },
    );
};
