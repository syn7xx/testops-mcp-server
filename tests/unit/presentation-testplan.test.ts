import { describe, it, expect, vi } from 'vitest';
import * as tpSvc from '@domain/test-plan/index.js';
import { success, failure } from '@shared/result.js';
import { registerTestPlanTools } from '@presentation/test-plan/tools.js';
import { setupToolTest, getToolHandler } from '../__test-utils__/tool-test.js';

vi.mock('@domain/test-plan/index.js', () => ({
  getTestPlan: vi.fn(),
  getTestPlanTestCases: vi.fn(),
  runTestPlan: vi.fn(),
  syncTestPlan: vi.fn(),
}));

describe('Presentation — Test Plan Tools', () => {
  it('testplan_get returns test plan', async () => {
    vi.mocked(tpSvc.getTestPlan).mockResolvedValue(
      success({
        id: 1,
        name: 'Plan',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    );

    const server = setupToolTest([registerTestPlanTools]);
    const handler = getToolHandler(server, 'testplan_get');
    const result = await handler({ id: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(1);
    expect(parsed.name).toBe('Plan');
  });

  it('testplan_get_test_cases returns paginated list', async () => {
    vi.mocked(tpSvc.getTestPlanTestCases).mockResolvedValue(
      success({
        items: [{ id: 10, name: 'TC-1' }],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
    );

    const server = setupToolTest([registerTestPlanTools]);
    const handler = getToolHandler(server, 'testplan_get_test_cases');
    const result = await handler({ id: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.totalElements).toBe(1);
  });

  it('testplan_run creates launch', async () => {
    vi.mocked(tpSvc.runTestPlan).mockResolvedValue(
      success({ id: 100, name: 'Run' })
    );

    const server = setupToolTest([registerTestPlanTools]);
    const handler = getToolHandler(server, 'testplan_run');
    const result = await handler({
      id: 1,
      launchName: 'My Run',
      tags: [{ name: 'regression' }],
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(100);
  });

  it('testplan_sync returns synced plan', async () => {
    vi.mocked(tpSvc.syncTestPlan).mockResolvedValue(
      success({
        id: 1,
        name: 'Synced',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    );

    const server = setupToolTest([registerTestPlanTools]);
    const handler = getToolHandler(server, 'testplan_sync');
    const result = await handler({ id: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.name).toBe('Synced');
  });

  it('testplan_get_test_cases returns error on failure', async () => {
    vi.mocked(tpSvc.getTestPlanTestCases).mockResolvedValue(
      failure(new Error('Not found'))
    );

    const server = setupToolTest([registerTestPlanTools]);
    const handler = getToolHandler(server, 'testplan_get_test_cases');
    const result = await handler({ id: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Not found');
  });
});
