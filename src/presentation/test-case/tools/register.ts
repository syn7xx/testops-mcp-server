import type { McpServer } from '@modelcontextprotocol/server';
import { registerReadTools } from './testcase-read.js';
import { registerWriteTools } from './testcase-write.js';
import { registerListTools } from './testcase-list.js';
import { registerProjectTools } from './project-cf.js';

export const registerTestCaseTools = (server: McpServer) => {
  registerReadTools(server);
  registerWriteTools(server);
  registerListTools(server);
  registerProjectTools(server);
};
