import { parseTestOpsServerArgs } from './args.js';
import { initApiClient } from './shared/api.js';
import { startServer } from './server.js';

const { url, token } = parseTestOpsServerArgs(process.argv);
initApiClient(url, token);

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
