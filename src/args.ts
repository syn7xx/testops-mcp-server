export type TestOpsServerArgs = {
  url: string;
  token: string;
};

/**
 * Parse process args: --url <base> --token <apitoken>
 * Or from env: TESTOPS_URL, TESTOPS_TOKEN
 * Base URL is stored without a trailing slash.
 */
export function parseTestOpsServerArgs(argv: string[]): TestOpsServerArgs {
  // First check environment variables (for OpenCode and other MCP clients)
  let url = process.env.TESTOPS_URL;
  let token = process.env.TESTOPS_TOKEN;

  // Override with CLI args if provided
  const raw = argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '--url' && raw[i + 1] !== undefined) {
      url = raw[++i];
    } else if (raw[i] === '--token' && raw[i + 1] !== undefined) {
      token = raw[++i];
    }
  }

  if (!url?.trim() || !token?.trim()) {
    console.error(
      'Required: --url <TESTOPS_BASE_URL> --token <API_TOKEN>\nOr env: TESTOPS_URL, TESTOPS_TOKEN',
    );
    process.exit(1);
  }

  return {
    url: url.replace(/\/+$/, ''),
    token: token.trim(),
  };
}
