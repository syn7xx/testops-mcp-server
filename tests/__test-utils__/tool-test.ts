import { McpServer } from '@modelcontextprotocol/server';

/**
 * Create a bare McpServer for testing tool registration.
 * The server is NOT connected — we only use it to register tools
 * and capture the handler functions.
 */
export function createTestServer() {
  return new McpServer(
    { name: 'test', version: '0.0.0' },
    { capabilities: { tools: {} } }
  );
}

type ToolHandlerFn = (args: unknown) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}>;

type ServerInternals = {
  _registeredTools: Record<string, { handler: ToolHandlerFn }>;
};

/** Extract a registered tool handler by name. Returns the handler function. */
export function getToolHandler(
  server: McpServer,
  toolName: string
): ToolHandlerFn {
  const internals = server as unknown as ServerInternals;
  const tool = internals._registeredTools[toolName];
  if (!tool) throw new Error(`Tool ${toolName} not registered`);
  return tool.handler;
}

/** Register given tool registrars and return the server. */
export function setupToolTest(
  registrars: Array<(server: McpServer) => void>
): McpServer {
  const server = createTestServer();
  registrars.forEach((register) => register(server));
  return server;
}
