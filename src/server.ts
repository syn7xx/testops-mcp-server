import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
import * as z from 'zod';
import {
    registerProjectTools,
    registerTestPlanTools,
    registerTestCaseTools,
} from './presentation/index.js';

export async function createTestOpsServer() {
  const server = new McpServer(
    {
      name: 'testops-mcp-server',
      version: '0.1.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );

  registerProjectTools(server);
  registerTestPlanTools(server);
  registerTestCaseTools(server);

  server.registerTool(
    'ping',
    {
      title: 'Ping',
      description: 'Test tool to verify server connectivity',
      inputSchema: z.object({})
    },
    async () => ({
      content: [{ type: 'text', text: 'Pong! Server is running.' }]
    })
  );

  return server;
}

export async function startServer() {
  const server = await createTestOpsServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TestOps MCP Server running on stdio');
}
