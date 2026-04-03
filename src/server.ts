import { createRequire } from 'node:module';
import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
import * as z from 'zod';
import {
  registerProjectTools,
  registerLaunchTools,
  registerTestPlanTools,
  registerTestCaseTools,
} from './presentation/index.js';

const require = createRequire(import.meta.url);
const { version: packageVersion } = require('../package.json') as {
  version: string;
};

export async function createTestOpsServer() {
  const server = new McpServer(
    {
      name: 'testops-mcp-server',
      version: packageVersion,
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  registerProjectTools(server);
  registerLaunchTools(server);
  registerTestPlanTools(server);
  registerTestCaseTools(server);

  server.registerTool(
    'ping',
    {
      title: 'Ping',
      description: 'Test tool to verify server connectivity',
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: 'text', text: 'Pong! Server is running.' }],
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
