import { describe, it, expect, vi } from 'vitest';
import * as launchSvc from '@domain/launch/index.js';
import { success, failure } from '@shared/result.js';
import { registerLaunchTools } from '@presentation/launch/tools.js';
import { setupToolTest, getToolHandler } from '../__test-utils__/tool-test.js';

vi.mock('@domain/launch/index.js', () => ({
  listLaunches: vi.fn(),
  getLaunch: vi.fn(),
  createLaunch: vi.fn(),
  stopLaunch: vi.fn(),
  getLaunchStatistic: vi.fn(),
  getLaunchProgress: vi.fn(),
  getLaunchTestResultsFlat: vi.fn(),
}));

describe('Presentation — Launch Tools', () => {
  it('launch_list returns paginated launches', async () => {
    vi.mocked(launchSvc.listLaunches).mockResolvedValue(
      success({
        items: [{ id: 1, name: 'Launch 1' }],
        page: 0,
        size: 50,
        totalElements: 5,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_list');
    const result = await handler({ projectId: 10, page: 0, size: 50 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.totalElements).toBe(5);
  });

  it('launch_list returns error on failure', async () => {
    vi.mocked(launchSvc.listLaunches).mockResolvedValue(
      failure(new Error('Project not found'))
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_list');
    const result = await handler({ projectId: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Project not found');
  });

  it('launch_get returns launch by ID', async () => {
    vi.mocked(launchSvc.getLaunch).mockResolvedValue(
      success({ id: 42, name: 'My Launch', projectId: 10 })
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_get');
    const result = await handler({ launchId: 42 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(42);
    expect(parsed.name).toBe('My Launch');
  });

  it('launch_get returns error on failure', async () => {
    vi.mocked(launchSvc.getLaunch).mockResolvedValue(
      failure(new Error('Launch not found'))
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_get');
    const result = await handler({ launchId: 999 });

    expect(result.isError).toBe(true);
  });

  it('launch_create returns created launch', async () => {
    vi.mocked(launchSvc.createLaunch).mockResolvedValue(
      success({ id: 1, name: 'My Launch' })
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_create');
    const result = await handler({ name: 'My Launch', projectId: 10 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(1);
    expect(parsed.name).toBe('My Launch');
  });

  it('launch_create with extra fields merges correctly', async () => {
    vi.mocked(launchSvc.createLaunch).mockResolvedValue(
      success({ id: 2, name: 'Extra Launch' })
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_create');
    const result = await handler({
      name: 'Extra Launch',
      projectId: 10,
      autoclose: true,
      tags: [{ name: 'smoke' }],
      extra: { releaseId: 5 },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(2);
  });

  it('launch_create with envVarValueSets includes them in body', async () => {
    vi.mocked(launchSvc.createLaunch).mockResolvedValue(
      success({ id: 3, name: 'Env Launch' })
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_create');
    await handler({
      name: 'Env Launch',
      projectId: 10,
      envVarValueSets: [{ values: [{ id: 1, name: 'VAR1' }] }],
    });

    expect(launchSvc.createLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        envVarValueSets: [{ values: [{ id: 1, name: 'VAR1' }] }],
      })
    );
  });

  it('launch_stop returns ok with launchId', async () => {
    vi.mocked(launchSvc.stopLaunch).mockResolvedValue(success(undefined));

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_stop');
    const result = await handler({ launchId: 99 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.ok).toBe(true);
    expect(parsed.launchId).toBe(99);
  });

  it('launch_stop returns error on failure', async () => {
    vi.mocked(launchSvc.stopLaunch).mockResolvedValue(
      failure(new Error('Not running'))
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_stop');
    const result = await handler({ launchId: 99 });

    expect(result.isError).toBe(true);
  });

  it('launch_get_statistic returns combined stat and progress', async () => {
    vi.mocked(launchSvc.getLaunchStatistic).mockResolvedValue(
      success([{ status: 'PASSED', count: 3 }])
    );
    vi.mocked(launchSvc.getLaunchProgress).mockResolvedValue(
      success({ ready: true })
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_get_statistic');
    const result = await handler({ launchId: 1 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.statistic[0].status).toBe('PASSED');
    expect(parsed.progress.ready).toBe(true);
  });

  it('launch_get_statistic returns error when statistic fails', async () => {
    vi.mocked(launchSvc.getLaunchStatistic).mockResolvedValue(
      failure(new Error('Launch not found'))
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_get_statistic');
    const result = await handler({ launchId: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Launch not found');
  });

  it('launch_get_statistic returns error when progress fails', async () => {
    vi.mocked(launchSvc.getLaunchStatistic).mockResolvedValue(
      success([{ status: 'PASSED', count: 1 }])
    );
    vi.mocked(launchSvc.getLaunchProgress).mockResolvedValue(
      failure(new Error('Progress unavailable'))
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_get_statistic');
    const result = await handler({ launchId: 1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Progress unavailable');
  });

  it('launch_list_test_results returns paged results', async () => {
    vi.mocked(launchSvc.getLaunchTestResultsFlat).mockResolvedValue(
      success({ content: [{ id: 1 }], totalElements: 1 })
    );

    const server = setupToolTest([registerLaunchTools]);
    const handler = getToolHandler(server, 'launch_list_test_results');
    const result = await handler({
      launchId: 1,
      page: 0,
      size: 10,
      sort: 'name,ASC',
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.content).toHaveLength(1);
  });
});
