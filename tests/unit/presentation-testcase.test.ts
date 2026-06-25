import { describe, it, expect, vi } from 'vitest';
import * as tcSvc from '@domain/test-case/index.js';
import { success, failure } from '@shared/result.js';
import { registerReadTools } from '@presentation/test-case/tools/testcase-read.js';
import { registerListTools } from '@presentation/test-case/tools/testcase-list.js';
import { registerWriteTools } from '@presentation/test-case/tools/testcase-write.js';
import { registerProjectTools } from '@presentation/test-case/tools/project-cf.js';
import { setupToolTest, getToolHandler } from '../__test-utils__/tool-test.js';

vi.mock('@domain/test-case/index.js', () => ({
  getTestCase: vi.fn(),
  getTestCaseDetail: vi.fn(),
  getTestCaseScenario: vi.fn(),
  getTestCaseCustomFields: vi.fn(),
  listTestCasesInTree: vi.fn(),
  searchTestCasesByAQL: vi.fn(),
  createTestCase: vi.fn(),
  createScenarioStep: vi.fn(),
  updateScenarioStep: vi.fn(),
  setTestCaseScenario: vi.fn(),
  updateTestCaseCustomFields: vi.fn(),
  getProjectCustomFields: vi.fn(),
  getProjectCustomFieldValues: vi.fn(),
}));

// ────────────────────────────────────────────
// Read tools
// ────────────────────────────────────────────
describe('Presentation — Test Case Read Tools', () => {
  it('testcase_get returns test case', async () => {
    vi.mocked(tcSvc.getTestCase).mockResolvedValue(
      success({ id: 1, name: 'TC-1' })
    );

    const server = setupToolTest([registerReadTools]);
    const handler = getToolHandler(server, 'testcase_get');
    const result = await handler({ id: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(1);
    expect(parsed.name).toBe('TC-1');
  });

  it('testcase_get returns error', async () => {
    vi.mocked(tcSvc.getTestCase).mockResolvedValue(
      failure(new Error('Not found'))
    );

    const server = setupToolTest([registerReadTools]);
    const handler = getToolHandler(server, 'testcase_get');
    const result = await handler({ id: 999 });

    expect(result.isError).toBe(true);
  });

  it('testcase_get_detail returns aggregated detail', async () => {
    vi.mocked(tcSvc.getTestCaseDetail).mockResolvedValue(
      success({
        id: 1,
        name: 'Detail',
        steps: ['Step A'],
        customFields: { Priority: 'High' },
        tags: ['smoke'],
        owner: 'dev',
      })
    );

    const server = setupToolTest([registerReadTools]);
    const handler = getToolHandler(server, 'testcase_get_detail');
    const result = await handler({ id: 1, projectId: 10 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.steps).toEqual(['Step A']);
    expect(parsed.customFields.Priority).toBe('High');
  });

  it('testcase_get_scenario returns scenario', async () => {
    vi.mocked(tcSvc.getTestCaseScenario).mockResolvedValue(
      success({
        root: { children: [1] },
        scenarioSteps: { 1: { body: 'Step' } },
      })
    );

    const server = setupToolTest([registerReadTools]);
    const handler = getToolHandler(server, 'testcase_get_scenario');
    const result = await handler({ id: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.root.children).toEqual([1]);
  });

  it('testcase_get_step is alias for scenario', async () => {
    vi.mocked(tcSvc.getTestCaseScenario).mockResolvedValue(
      success({ root: { children: [5] } })
    );

    const server = setupToolTest([registerReadTools]);
    const handler = getToolHandler(server, 'testcase_get_step');
    const result = await handler({ id: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.root.children).toEqual([5]);
  });

  it('testcase_get_custom_fields returns CF values', async () => {
    vi.mocked(tcSvc.getTestCaseCustomFields).mockResolvedValue(
      success([
        { customField: { name: 'Sprint' }, values: [{ id: 1, name: 'S1' }] },
      ])
    );

    const server = setupToolTest([registerReadTools]);
    const handler = getToolHandler(server, 'testcase_get_custom_fields');
    const result = await handler({ id: 1, projectId: 10 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed[0].customField.name).toBe('Sprint');
  });
});

// ────────────────────────────────────────────
// List tools
// ────────────────────────────────────────────
describe('Presentation — Test Case List Tools', () => {
  it('testcase_list_in_tree returns tree node', async () => {
    vi.mocked(tcSvc.listTestCasesInTree).mockResolvedValue(
      success({ id: 1, name: 'Root', children: { content: [] } })
    );

    const server = setupToolTest([registerListTools]);
    const handler = getToolHandler(server, 'testcase_list_in_tree');
    const result = await handler({
      projectId: 10,
      treeId: 1,
      page: 0,
      size: 10,
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(1);
  });

  it('testcase_list_in_tree returns error', async () => {
    vi.mocked(tcSvc.listTestCasesInTree).mockResolvedValue(
      failure(new Error('Tree not found'))
    );

    const server = setupToolTest([registerListTools]);
    const handler = getToolHandler(server, 'testcase_list_in_tree');
    const result = await handler({ projectId: 10, treeId: 1 });

    expect(result.isError).toBe(true);
  });

  it('testcase_search_by_aql returns results', async () => {
    vi.mocked(tcSvc.searchTestCasesByAQL).mockResolvedValue(
      success({
        testCases: [{ id: 1, name: 'Found' }],
        total: 1,
        page: 0,
        size: 10,
      })
    );

    const server = setupToolTest([registerListTools]);
    const handler = getToolHandler(server, 'testcase_search_by_aql');
    const result = await handler({ projectId: 10, rql: 'name=="TC"' });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.testCases).toHaveLength(1);
    expect(parsed.total).toBe(1);
  });

  it('testcase_search_by_aql returns error', async () => {
    vi.mocked(tcSvc.searchTestCasesByAQL).mockResolvedValue(
      failure(new Error('Invalid AQL'))
    );

    const server = setupToolTest([registerListTools]);
    const handler = getToolHandler(server, 'testcase_search_by_aql');
    const result = await handler({ projectId: 10, rql: 'bad' });

    expect(result.isError).toBe(true);
  });
});

// ────────────────────────────────────────────
// Write tools
// ────────────────────────────────────────────
describe('Presentation — Test Case Write Tools', () => {
  it('testcase_update_step updates a step', async () => {
    vi.mocked(tcSvc.updateScenarioStep).mockResolvedValue(
      success({ root: { children: [1] } })
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_update_step');
    const result = await handler({ stepId: 1, body: 'new body' });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.root.children).toEqual([1]);
  });

  it('testcase_set_scenario replaces all steps', async () => {
    vi.mocked(tcSvc.setTestCaseScenario).mockResolvedValue(
      success({ root: { children: [10, 20] } })
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_set_scenario');
    const result = await handler({
      id: 1,
      steps: [
        { action: 'Login' },
        { action: 'Click', expectedResult: 'Page opens' },
      ],
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.root.children).toEqual([10, 20]);
  });

  it('testcase_update_custom_fields patches CFs', async () => {
    vi.mocked(tcSvc.updateTestCaseCustomFields).mockResolvedValue(
      success(undefined)
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_update_custom_fields');
    const result = await handler({
      id: 1,
      fields: [{ customFieldId: 5, valueIds: [1, 2] }],
    });

    expect(result.isError).toBeUndefined();
  });

  it('testcase_create without steps', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      success({ id: 99, name: 'New TC' })
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    const result = await handler({ name: 'New TC', projectId: 10 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(99);
  });

  it('testcase_create with steps succeeds', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      success({ id: 50, name: 'With Steps' })
    );
    vi.mocked(tcSvc.createScenarioStep).mockResolvedValue(
      success({ root: { children: [200] } })
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    const result = await handler({
      name: 'With Steps',
      projectId: 10,
      steps: [{ action: 'Step 1' }],
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(50);
  });

  it('testcase_create fails immediately on API error', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      failure(new Error('Validation failed'))
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    const result = await handler({ name: 'Bad', projectId: 10 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Validation failed');
  });

  it('testcase_create created but step fails', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      success({ id: 7, name: 'Partial' })
    );
    vi.mocked(tcSvc.createScenarioStep).mockResolvedValue(
      failure(new Error('Step failed'))
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    const result = await handler({
      name: 'Partial',
      projectId: 10,
      steps: [{ action: 'Bad step' }],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Test case created (id: 7)');
    expect(result.content[0].text).toContain('Step failed');
  });

  it('testcase_create with multiple steps — second step fails', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      success({ id: 8, name: 'MultiStep' })
    );
    vi.mocked(tcSvc.createScenarioStep)
      .mockResolvedValueOnce(success({ root: { children: [100] } }))
      .mockResolvedValueOnce(failure(new Error('Second step failed')));

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    const result = await handler({
      name: 'MultiStep',
      projectId: 10,
      steps: [{ action: 'Step 1' }, { action: 'Step 2' }],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Second step failed');
  });

  it('testcase_create with customFields using customFieldId+valueIds', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      success({ id: 42, name: 'CF TC' })
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    const result = await handler({
      name: 'CF TC',
      projectId: 10,
      customFields: [{ customFieldId: 1, valueIds: [10, 20] }],
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(42);

    expect(tcSvc.createTestCase).toHaveBeenLastCalledWith(
      expect.objectContaining({
        customFields: [
          { customField: { id: 1 }, id: 10 },
          { customField: { id: 1 }, id: 20 },
        ],
      })
    );
  });

  it('testcase_create with customFields using id/name fallback', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      success({ id: 3, name: 'Fallback CF' })
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    await handler({
      name: 'Fallback CF',
      projectId: 10,
      customFields: [
        { id: 100, name: 'SomeValue', customFieldId: 5 },
        { id: 200, name: 'Plain' },
      ],
    });

    expect(tcSvc.createTestCase).toHaveBeenLastCalledWith(
      expect.objectContaining({
        customFields: [
          { id: 100, name: 'SomeValue', customField: { id: 5 } },
          { id: 200, name: 'Plain', customField: undefined },
        ],
      })
    );
  });

  it('testcase_create normalizes \\n in text fields', async () => {
    vi.mocked(tcSvc.createTestCase).mockResolvedValue(
      success({ id: 1, name: 'NL' })
    );

    const server = setupToolTest([registerWriteTools]);
    const handler = getToolHandler(server, 'testcase_create');
    await handler({
      name: 'NL',
      projectId: 10,
      precondition: 'Line1\\nLine2',
      postcondition: 'End',
    });

    expect(tcSvc.createTestCase).toHaveBeenLastCalledWith(
      expect.objectContaining({
        precondition: 'Line1\nLine2',
        postcondition: 'End',
      })
    );
  });
});

// ────────────────────────────────────────────
// Project CF tools (from project-cf.ts)
// ────────────────────────────────────────────
describe('Presentation — Project CF Tools', () => {
  it('project_get_custom_fields returns definitions', async () => {
    vi.mocked(tcSvc.getProjectCustomFields).mockResolvedValue(
      success({
        items: [{ id: 1, name: 'Sprint' }],
        total: 1,
        page: 0,
        size: 50,
      })
    );

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_get_custom_fields');
    const result = await handler({ projectId: 10 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].name).toBe('Sprint');
  });

  it('project_get_custom_field_values returns values', async () => {
    vi.mocked(tcSvc.getProjectCustomFieldValues).mockResolvedValue(
      success({ items: [{ id: 10, name: 'S1' }], total: 1, page: 0, size: 50 })
    );

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_get_custom_field_values');
    const result = await handler({ projectId: 10, customFieldId: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].name).toBe('S1');
  });
});
