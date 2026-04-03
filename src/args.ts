import { parseArgs } from 'node:util';

export type TestOpsServerArgs = {
  url: string;
  token: string;
};

const usage = `Usage: testops-mcp-server --url <BASE_URL> --token <API_TOKEN>
       testops-mcp-server -u <BASE_URL> -t <API_TOKEN>
       testops-mcp-server --url=<BASE> --token=<TOKEN>
Environment: TESTOPS_URL, TESTOPS_TOKEN (used if CLI flags are omitted)
CLI flags override environment variables when both are set.`;

function printCliError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(msg);
  console.error(usage);
  process.exit(1);
}

function normalizeBaseUrl(raw: string): string {
  const s = raw.trim();
  let parsed: URL;
  try {
    parsed = new URL(s);
  } catch {
    console.error(
      'Invalid --url / TESTOPS_URL: expected an absolute http(s) URL (e.g. https://testops.example.com)\n' +
        usage
    );
    process.exit(1);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    console.error(
      'Invalid --url: only http: and https: are supported\n' + usage
    );
    process.exit(1);
  }
  return s.replace(/\/+$/, '');
}

/** Parse CLI argv and env into base URL and API token. */
export function parseTestOpsServerArgs(argv: string[]): TestOpsServerArgs {
  let values: { url?: string; token?: string; help?: boolean };
  try {
    ({ values } = parseArgs({
      args: argv.slice(2),
      options: {
        url: { type: 'string', short: 'u' },
        token: { type: 'string', short: 't' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: false,
      strict: true,
    }));
  } catch (err) {
    printCliError(err);
  }

  if (values.help) {
    console.log(usage);
    process.exit(0);
  }

  const urlRaw = values.url ?? process.env.TESTOPS_URL;
  const tokenRaw = values.token ?? process.env.TESTOPS_TOKEN;

  if (!urlRaw?.trim() || !tokenRaw?.trim()) {
    console.error(
      'Required: --url / -u and --token / -t (or env TESTOPS_URL, TESTOPS_TOKEN)\n\n' +
        usage
    );
    process.exit(1);
  }

  return {
    url: normalizeBaseUrl(urlRaw),
    token: tokenRaw.trim(),
  };
}
