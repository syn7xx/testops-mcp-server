import * as z from 'zod';
import { isSuccess } from '../../shared/result.js';
import {
    getTestCase,
    getTestCaseDetail,
    getTestCaseScenario,
    updateScenarioStep,
    setTestCaseScenario,
    getTestCaseCustomFields,
    updateTestCaseCustomFields,
    searchTestCasesByAQL,
} from '../../domain/test-case/index.js';

export const registerTestCaseTools = (server: any) => {
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
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
        },
    );

    server.registerTool(
        'testcase_get_detail',
        {
            title: 'Get Test Case Detail',
            description: 'Get test case with steps and custom fields',
            inputSchema: z.object({
                id: z.number().describe('Test case ID'),
            }),
        },
        async (args: { id: number }) => {
            const result = await getTestCaseDetail(args.id);
            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
        },
    );

    server.registerTool(
        'testcase_get_scenario',
        {
            title: 'Get Test Case Scenario',
            description: 'Get scenario (steps and expected results) for a test case',
            inputSchema: z.object({
                id: z.number().describe('Test case ID'),
            }),
        },
        async (args: { id: number }) => {
            const result = await getTestCaseScenario(args.id);
            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
        },
    );

    server.registerTool(
        'testcase_update_step',
        {
            title: 'Update Scenario Step',
            description: 'Update a step in a test case scenario',
            inputSchema: z.object({
                testCaseId: z.number().describe('Test case ID'),
                stepId: z.number().describe('Step ID to update'),
                body: z.string().optional().describe('New step action'),
                expectedResult: z.string().optional().describe('New expected result'),
            }),
        },
        async (args: { testCaseId: number; stepId: number; body?: string; expectedResult?: string }) => {
            const result = await updateScenarioStep(args.testCaseId, args.stepId, {
                body: args.body,
                expectedResult: args.expectedResult,
            });
            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
        },
    );

    server.registerTool(
        'testcase_set_scenario',
        {
            title: 'Set Test Case Scenario',
            description: 'Replace all steps in a test case scenario',
            inputSchema: z.object({
                id: z.number().describe('Test case ID'),
                steps: z.array(z.object({
                    action: z.string().describe('Step action'),
                    expectedResult: z.string().optional().describe('Expected result'),
                })).describe('Steps to set'),
            }),
        },
        async (args: { id: number; steps: Array<{ action: string; expectedResult?: string }> }) => {
            const result = await setTestCaseScenario(args.id, args.steps);
            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
        },
    );

    server.registerTool(
        'testcase_get_custom_fields',
        {
            title: 'Get Test Case Custom Fields',
            description: 'Get custom field values for a test case',
            inputSchema: z.object({
                id: z.number().describe('Test case ID'),
            }),
        },
        async (args: { id: number }) => {
            const result = await getTestCaseCustomFields(args.id);
            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
        },
    );

    server.registerTool(
        'testcase_update_custom_fields',
        {
            title: 'Update Test Case Custom Fields',
            description: 'Update custom field values for a test case',
            inputSchema: z.object({
                id: z.number().describe('Test case ID'),
                fields: z.array(z.object({
                    customFieldId: z.number().describe('Custom field ID'),
                    valueIds: z.array(z.number()).describe('Value IDs to set'),
                })).describe('Custom fields to update'),
            }),
        },
        async (args: { id: number; fields: Array<{ customFieldId: number; valueIds: number[] }> }) => {
            const result = await updateTestCaseCustomFields(args.id, args.fields);
            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return { content: [{ type: 'text', text: 'Custom fields updated successfully' }] };
        },
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
        async (args: { projectId: number; rql: string; deleted?: boolean; page?: number; size?: number; sort?: string }) => {
            const result = await searchTestCasesByAQL(args.projectId, args.rql, args);
            if (!isSuccess(result)) {
                return { content: [{ type: 'text', text: `Error: ${result.error.message}` }], isError: true };
            }
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        testCases: result.value.testCases,
                        total: result.value.total,
                        page: result.value.page,
                        size: result.value.size,
                    }, null, 2),
                }],
            };
        },
    );
};
