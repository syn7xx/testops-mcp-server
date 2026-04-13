# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
On each release, [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) prepends new sections from [Conventional Commits](https://www.conventionalcommits.org/) since the previous tag.

## [Unreleased]

### Added

- MCP tool `launch_get_statistic` (aggregated counts by status + progress `ready` as JSON)
- MCP tool `launch_list_test_results` (flat paginated test results for a launch)
- HTTP client: query params may be arrays (repeated keys, e.g. multiple `sort`) without changing scalar usage
- Shared HTTP DTO modules: `common-dto`, `project-dto`, `test-plan-dto`, `test-case-dto` (aligned with `launch-dto`)
- TypeScript path aliases `@shared/*`, `@domain/*`, `@presentation/*`; `npm run build` runs `tsc-alias` so `dist/` keeps relative imports for Node

### Changed

- `getTestPlanStat` return type is now `TestPlanStatDto` (aligned with TestOps test-plan stat payload)
- Domain modules no longer re-export OpenAPI DTOs; import `@shared/openapi/*-dto` (or use `*Dto` return types from services) instead

## [0.1.5] - 2026-04-03

### Added

- MCP tool `testcase_list_in_tree` (project tree node listing with `treeId`)
- MCP tool `testcase_get_step` as an alias of `testcase_get_scenario` (steps and expected results)

### Changed

- Clearer tool descriptions for scenario vs detail; README test-case table
- Release tooling: `preset` for conventional-changelog as `{ "name": "conventionalcommits" }`; npm `overrides` for `conventional-changelog-conventionalcommits`

## [0.1.4] - 2026-04-03

### Added

- `prepublishOnly` runs `npm run build` before every `npm publish` (CI and local)

### Changed

- Ship `CHANGELOG.md` in the npm package (`files`); expand README **Releasing** (conventional commits, manual workflow)

## [0.1.3] - 2026-04-03

### Added

- CI (lint, build on push); GitHub Actions **Release** workflow with `release-it`
- ESLint 9 (flat config), Prettier, `typescript-eslint`
- CLI parsing via `node:util` / `parseArgs`; short flags `-u` / `-t` / `-h`; validation of `http(s)` base URL
- HTTP 401 handling: clear JWT cache and retry once
- `CHANGELOG.md` in published npm package; maintainer notes in README (Release workflow, conventional commits)

### Changed

- README: MCP setup for Cursor, VS Code (`servers`), OpenCode (`mcp` + `type: local`), Claude; **Releasing** section
- CI: npm publish removed from default pipeline (publish only via **Release** + `release-it`)

## [0.1.2] - 2026-04-03

### Fixed

- Add shebang for the `testops-mcp-server` CLI binary

### Changed

- OpenCode: document using `TESTOPS_URL` / `TESTOPS_TOKEN` in env in MCP config

## [0.1.0-alpha.2] - 2026-04-03

### Added

- `bin` field in `package.json` for the CLI executable

## [0.1.0] - 2026-04-03

### Added

- Initial **TestOps MCP Server**: tools for projects, test plans, and test cases; API client with JWT; stdio transport
