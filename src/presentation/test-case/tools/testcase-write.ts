import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { isSuccess } from '@shared/result.js';
import { omitUndefined } from '@shared/record-utils.js';
import type {
  TestCaseCreateV2Dto,
  CustomFieldValueWithCfDto,
} from '@shared/openapi/test-case-dto.js';
import {
  createTestCase,
  createScenarioStep,
  updateScenarioStep,
  setTestCaseScenario,
  updateTestCaseCustomFields,
} from '@domain/test-case/index.js';
import { handleResult } from '../../tool-utils.js';
import { testCaseCreateSchema } from './schemas.js';

function normalizeLineBreaks(text: string | undefined): string | undefined {
  if (!text) return text;
  return text.replace(/\\n/g, '\n');
}

export function registerWriteTools(server: McpServer) {
  server.registerTool(
    'testcase_update_step',
    {
      title: 'Update Scenario Step',
      description: 'Update one scenario step by its step id.',
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
    async (args: { stepId: number; body?: string; expectedResult?: string }) =>
      handleResult(
        await updateScenarioStep(args.stepId, {
          body: args.body,
          expectedResult: args.expectedResult,
        })
      )
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
    }) => handleResult(await setTestCaseScenario(args.id, args.steps))
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
    }) => handleResult(await updateTestCaseCustomFields(args.id, args.fields))
  );

  server.registerTool(
    'testcase_create',
    {
      title: 'Create Test Case',
      description:
        'Create a new test case in TestOps. Required: name and projectId. Optional: steps, customFields, tags, precondition, etc.',
      inputSchema: testCaseCreateSchema,
    },
    async (args: z.infer<typeof testCaseCreateSchema>) => {
      const createData: TestCaseCreateV2Dto = {
        name: args.name,
        projectId: args.projectId,
      };

      Object.assign(
        createData,
        omitUndefined({
          description: args.description,
          automated: args.automated,
          external: args.external,
          fullName: args.fullName,
          precondition: normalizeLineBreaks(args.precondition),
          postcondition: normalizeLineBreaks(args.postcondition),
          expectedResult: args.expectedResult,
          statusId: args.statusId,
          testLayerId: args.testLayerId,
          workflowId: args.workflowId,
          tags: args.tags,
          links: args.links,
          members: args.members,
          customFields: args.customFields?.flatMap(
            (cf): CustomFieldValueWithCfDto[] => {
              if (cf.customFieldId && cf.valueIds?.length) {
                return cf.valueIds.map((vid) => ({
                  customField: { id: cf.customFieldId },
                  id: vid,
                }));
              }

              return [
                {
                  id: cf.id,
                  name: cf.name,
                  customField: cf.customFieldId
                    ? { id: cf.customFieldId }
                    : undefined,
                },
              ];
            }
          ),
        })
      );

      const result = await createTestCase(createData);
      if (!isSuccess(result)) {
        return handleResult(result);
      }

      const testCase = result.value;

      if (!args.steps?.length) {
        return handleResult(result);
      }

      const stepResults = await args.steps.reduce<
        Promise<{ lastStepId?: number; error?: string }>
      >(
        async (accPromise, step) => {
          const acc = await accPromise;
          if (acc.error) return acc;

          const stepResult = await createScenarioStep(
            testCase.id,
            step.action,
            step.expectedResult,
            acc.lastStepId
          );

          if (!isSuccess(stepResult)) {
            return {
              lastStepId: acc.lastStepId,
              error: `Test case created (id: ${testCase.id}), but failed to add step: ${stepResult.error.message}`,
            };
          }

          const { root } = stepResult.value;

          return {
            lastStepId: root?.children?.length
              ? root.children[root.children.length - 1]
              : acc.lastStepId,
          };
        },
        Promise.resolve({ lastStepId: undefined })
      );

      if (stepResults.error) {
        return {
          content: [{ type: 'text', text: stepResults.error }],
          isError: true,
        };
      }

      return handleResult(result);
    }
  );
}
