import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseTestOpsServerArgs } from '../../src/args.js';

// Helper: run parseTestOpsServerArgs catching the forced-exit error
function tryParse(argv: string[]) {
  try {
    return parseTestOpsServerArgs(argv);
  } catch {
    // When process.exit mock throws, there's no return value
    return null;
  }
}

describe('parseTestOpsServerArgs', () => {
  const originalExit = process.exit;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Mock process.exit to throw instead of actually exiting
    process.exit = vi.fn((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as unknown as typeof process.exit;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    delete process.env.TESTOPS_URL;
    delete process.env.TESTOPS_TOKEN;
  });

  afterEach(() => {
    process.exit = originalExit;
    Object.assign(process.env, originalEnv);
    vi.restoreAllMocks();
  });

  it('parses --url and --token from CLI', () => {
    const result = parseTestOpsServerArgs([
      'node',
      'testops',
      '--url',
      'https://testops.example.com',
      '--token',
      'my-secret-token',
    ]);
    expect(result.url).toBe('https://testops.example.com');
    expect(result.token).toBe('my-secret-token');
  });

  it('parses -u and -t short flags', () => {
    const result = parseTestOpsServerArgs([
      'node',
      'testops',
      '-u',
      'https://testops.example.com',
      '-t',
      'abc123',
    ]);
    expect(result.url).toBe('https://testops.example.com');
    expect(result.token).toBe('abc123');
  });

  it('strips trailing slashes from URL', () => {
    const result = parseTestOpsServerArgs([
      'node',
      'testops',
      '-u',
      'https://testops.example.com///',
      '-t',
      'token',
    ]);
    expect(result.url).toBe('https://testops.example.com');
  });

  it('reads from TESTOPS_URL and TESTOPS_TOKEN env vars', () => {
    process.env.TESTOPS_URL = 'https://env.example.com';
    process.env.TESTOPS_TOKEN = 'env-token';
    const result = parseTestOpsServerArgs(['node', 'testops']);
    expect(result.url).toBe('https://env.example.com');
    expect(result.token).toBe('env-token');
  });

  it('CLI flags override env vars', () => {
    process.env.TESTOPS_URL = 'https://env.example.com';
    process.env.TESTOPS_TOKEN = 'env-token';
    const result = parseTestOpsServerArgs([
      'node',
      'testops',
      '--url',
      'https://cli.example.com',
      '--token',
      'cli-token',
    ]);
    expect(result.url).toBe('https://cli.example.com');
    expect(result.token).toBe('cli-token');
  });

  it('exits with error when URL is missing', () => {
    const r = tryParse(['node', 'testops', '--token', 't']);
    expect(r).toBeNull();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits with error when token is missing', () => {
    const r = tryParse(['node', 'testops', '--url', 'https://x.com']);
    expect(r).toBeNull();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits with error for invalid URL scheme (non-http)', () => {
    const r = tryParse([
      'node',
      'testops',
      '--url',
      'ftp://x.com',
      '--token',
      't',
    ]);
    expect(r).toBeNull();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits with error for malformed URL string', () => {
    const r = tryParse([
      'node',
      'testops',
      '--url',
      'not-a-url',
      '--token',
      't',
    ]);
    expect(r).toBeNull();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits 0 on --help', () => {
    const r = tryParse(['node', 'testops', '--help']);
    expect(r).toBeNull();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('trims token whitespace', () => {
    const result = parseTestOpsServerArgs([
      'node',
      'testops',
      '-u',
      'https://example.com',
      '-t',
      '  token-with-spaces  ',
    ]);
    expect(result.token).toBe('token-with-spaces');
  });

  it('handles URL with query params', () => {
    const result = parseTestOpsServerArgs([
      'node',
      'testops',
      '--url',
      'https://example.com?foo=bar',
      '--token',
      't',
    ]);
    expect(result.url).toBe('https://example.com?foo=bar');
  });
});
