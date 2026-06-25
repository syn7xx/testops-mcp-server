# Contributing

## Prerequisites

- **Node.js >= 24**
- Git

## Getting started

```bash
git clone https://github.com/syn7xx/testops-mcp-server.git
cd testops-mcp-server
npm install
npm run build
```

## Project layout

```
src/
├── index.ts                  # CLI entry point
├── args.ts                   # CLI argument parsing
├── server.ts                 # MCP server setup and tool registration
│
├── shared/
│   ├── api.ts                # HTTP client with JWT auth, 401 retry, fetch wrapper
│   ├── result.ts             # Result<T, E> ADT (success/failure) — no thrown exceptions
│   ├── pagination.ts         # Page normalization, Paginated<T> builder
│   ├── record-utils.ts       # omitUndefined helper
│   └── openapi/              # API DTO type definitions (generated from OpenAPI)
│
├── domain/                   # Business logic — call APIs, return Result<T>
│   ├── project/service.ts    # findProjects, findProjectByName, getProjectById
│   ├── launch/service.ts     # createLaunch, stopLaunch, getLaunch*, etc.
│   ├── test-plan/service.ts  # getTestPlan, runTestPlan, syncTestPlan, etc.
│   └── test-case/            # getTestCase, getTestCaseDetail, createTestCase,
│       ├── service.ts        #   listTestCasesInTree, searchTestCasesByAQL
│       ├── scenario.ts       #   getTestCaseScenario, createScenarioStep, etc.
│       ├── custom-fields.ts  #   getProjectCustomFields, updateTestCaseCustomFields
│       └── create.ts         #   createTestCase (POST to API)
│
└── presentation/             # MCP tool registration — thin wrappers over domain
    ├── tool-utils.ts         # handleResult helper (Result → tool response)
    ├── project/tools.ts      # registerProjectTools
    ├── launch/tools.ts       # registerLaunchTools
    ├── test-plan/tools.ts    # registerTestPlanTools
    └── test-case/tools.ts    # delegates to read/write/list/project-cf registrars
        ├── testcase-read.ts
        ├── testcase-write.ts
        ├── testcase-list.ts
        └── project-cf.ts
```

**Architecture rules:**

- **Domain layer** never throws — all functions return `Result<T, Error>`. Errors are caught at the boundary (API client) and wrapped as `Result` failures.
- **Presentation layer** maps `Result` to MCP tool responses via `handleResult()`.
- **`shared/api.ts`** is the single HTTP client. It handles JWT caching, 401 retry, and error wrapping.

## Scripts

| Command | What it does |
|---|---|
| `npm run build` | Compile TypeScript with path alias resolution |
| `npm start` | Run the built server |
| `npm test` | Run all tests (vitest) |
| `npm run test:unit` | Unit tests only |
| `npm run test:e2e` | E2E tests only |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier auto-format |
| `npm run format:check` | Prettier check |

## Tests

Tests live in `tests/` and use **vitest**.

```
tests/
├── __test-utils__/
│   ├── fetch-mock.ts          # Mock fetch, JWT, and API responses
│   ├── in-memory-transport.ts # Paired Transport for MCP E2E testing (no network)
│   └── tool-test.ts           # Extract tool handlers from McpServer internals
├── unit/
│   ├── api.test.ts            # HTTP client: JWT, 401 retry, error handling
│   ├── args.test.ts           # CLI argument parsing
│   ├── pagination.test.ts     # Page normalization and paginated view
│   ├── result.test.ts         # Result ADT
│   ├── record-utils.test.ts   # omitUndefined
│   ├── tool-utils.test.ts     # handleResult
│   ├── domain-*.test.ts       # Domain services (mocked fetch)
│   └── presentation-*.test.ts # Tool handlers (mocked domain)
└── e2e/
    └── mcp-server.test.ts     # Full MCP server: tool registration + ping call
```

### Writing tests

**Domain tests** mock `fetch` (global) to simulate API responses:

```typescript
const fetchMock = setupFetchMock();
initTestApiClient();
mockJwtResponse(fetchMock);                                // JWT endpoint responds
fetchMock.mockResolvedValueOnce(mockApiResponse({ ... })); // API endpoint responds

const result = await someServiceFunction();
expect(isSuccess(result)).toBe(true);
```

**Presentation tests** mock the domain layer and extract tool handlers:

```typescript
vi.mock('@domain/project/index.js', () => ({
  findProjects: vi.fn(),
  // ...
}));

const server = setupToolTest([registerProjectTools]);
const handler = getToolHandler(server, 'project_list');
const result = await handler({ page: 0 });
```

**E2E tests** use an in-memory transport pair to connect a real `McpServer` and `Client`:

```typescript
const [serverTransport, clientTransport] = createTransportPair();
await server.connect(serverTransport);
await client.connect(clientTransport);
const result = await client.callTool({ name: 'ping', arguments: {} });
```

## Pre-commit checks

Husky runs automatically on `git commit`:

1. **TypeScript** — `tsc --noEmit` (type-check only, no output)
2. **ESLint** — on all `src/**/*.ts` and `tests/**/*.ts`
3. **Tests** — `vitest run` (all 147 tests)

Commit messages must follow [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `build:`, `test:`, `docs:`, etc.). A commitlint hook validates this.

## Code style

- TypeScript strict mode
- Prefer `Result<T, Error>` over throwing exceptions
- No unused variables or parameters in production code (tests are more lenient)
- Prettier for formatting, ESLint (Airbnb base) for linting
- Imports use `~`, `@shared`, `@domain`, `@presentation` aliases (configured in `tsconfig.json` and `vitest.config.ts`)

## Before submitting a PR

1. Run the full pre-commit suite: `npm test && npm run lint && npx tsc --noEmit`
2. Make sure all new code has corresponding tests
3. Use a descriptive commit message following conventional commits

## Releasing

Releases are managed with `commit-and-tag-version`. From the `main` branch:

```bash
npm run release:patch   # for fixes (0.3.0 → 0.3.1)
npm run release:minor   # for features (0.3.0 → 0.4.0)
npm run release:major   # for breaking changes (0.3.0 → 1.0.0)
```

This bumps the version, updates `CHANGELOG.md`, and creates a git tag. Push the tag to trigger the CI release workflow.
