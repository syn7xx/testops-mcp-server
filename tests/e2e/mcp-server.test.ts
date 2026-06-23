import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/client';
import { initApiClient, clearJwtCache } from '@shared/api.js';
import { createTestOpsServer } from '../../src/server.js';
import { createTransportPair } from '../__test-utils__/in-memory-transport.js';

describe('MCP Server E2E', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;

  beforeAll(async () => {
    initApiClient('https://testops.example.com', 'dummy-token');

    const [serverTransport, clientTransport] = createTransportPair();

    const server = await createTestOpsServer();
    const serverConnect = server.connect(serverTransport);

    client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await Promise.all([serverConnect, client.connect(clientTransport)]);

    closeTransport = async () => {
      await serverTransport.close();
    };
  }, 10000);

  afterAll(async () => {
    clearJwtCache();
    await closeTransport();
  });

  describe('tools/list', () => {
    it('returns all registered tools', async () => {
      const result = await client.listTools();
      const toolNames = result.tools.map((t) => t.name).sort();

      expect(toolNames).toContain('ping');
      expect(toolNames).toContain('project_list');
      expect(toolNames).toContain('project_find_by_name');
      expect(toolNames).toContain('project_get_by_id');
      expect(toolNames).toContain('launch_create');
      expect(toolNames).toContain('launch_stop');
      expect(toolNames).toContain('launch_get_statistic');
      expect(toolNames).toContain('launch_list_test_results');
      expect(toolNames).toContain('testplan_get');
      expect(toolNames).toContain('testplan_get_test_cases');
      expect(toolNames).toContain('testplan_run');
      expect(toolNames).toContain('testplan_sync');
    });

    it('each tool has the required structure', async () => {
      const result = await client.listTools();
      result.tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(typeof tool.name).toBe('string');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
      });
    });
  });

  describe('tools/call — ping', () => {
    it('responds with Pong', async () => {
      // MCP SDK v2 API: callTool({ name, arguments })
      const result = await client.callTool({ name: 'ping', arguments: {} });
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const [{ text }] = result.content as [{ type: 'text'; text: string }];
      expect(text).toContain('Pong');
    });
  });

  describe('tools/call — project_list (error handling)', () => {
    it('returns error when API client is not connected to real server', async () => {
      const result = await client.callTool({
        name: 'project_list',
        arguments: {},
      });
      // Should fail gracefully because we're pointing at an invalid server
      expect(result.isError).toBe(true);
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('server info', () => {
    it('reports correct server name and version', () => {
      expect(client.getServerVersion()).toBeDefined();
      expect(client.getServerVersion()?.name).toBe('testops-mcp-server');
      expect(client.getServerVersion()?.version).toBeTruthy();
    });

    it('negotiates a protocol version', () => {
      expect(client.getNegotiatedProtocolVersion()).toBeDefined();
    });
  });
});
