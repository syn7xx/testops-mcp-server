import { describe, it, expect, vi } from 'vitest';
import * as projectSvc from '@domain/project/index.js';
import { success, failure } from '@shared/result.js';
import { registerProjectTools } from '@presentation/project/tools.js';
import { setupToolTest, getToolHandler } from '../__test-utils__/tool-test.js';

vi.mock('@domain/project/index.js', () => ({
  findProjects: vi.fn(),
  findProjectByName: vi.fn(),
  getProjectById: vi.fn(),
}));

describe('Presentation — Project Tools', () => {
  it('project_list returns paginated items', async () => {
    vi.mocked(projectSvc.findProjects).mockResolvedValue(
      success({
        items: [{ id: 1, name: 'P1' }],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
    );

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_list');
    const result = await handler({ page: 0, size: 50 });

    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].name).toBe('P1');
  });

  it('project_list returns error on failure', async () => {
    vi.mocked(projectSvc.findProjects).mockResolvedValue(
      failure(new Error('API down'))
    );

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_list');
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('API down');
  });

  it('project_find_by_name returns match', async () => {
    vi.mocked(projectSvc.findProjectByName).mockResolvedValue(
      success({ id: 42, name: 'Found' })
    );

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_find_by_name');
    const result = await handler({ name: 'Found' });

    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(42);
  });

  it('project_find_by_name returns not found', async () => {
    vi.mocked(projectSvc.findProjectByName).mockResolvedValue(success(null));

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_find_by_name');
    const result = await handler({ name: 'Ghost' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('not found');
  });

  it('project_find_by_name returns error on API failure', async () => {
    vi.mocked(projectSvc.findProjectByName).mockResolvedValue(
      failure(new Error('Network error'))
    );

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_find_by_name');
    const result = await handler({ name: 'Anything' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Network error');
  });

  it('project_get_by_id fetches project', async () => {
    vi.mocked(projectSvc.getProjectById).mockResolvedValue(
      success({ id: 1, name: 'P' })
    );

    const server = setupToolTest([registerProjectTools]);
    const handler = getToolHandler(server, 'project_get_by_id');
    const result = await handler({ id: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(1);
  });
});
