# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.2.4](https://github.com/syn7xx/testops-mcp-server/compare/v0.2.3...v0.2.4) (2026-04-21)

## 0.2.3 (2026-04-21)


### Features

* add testcase_get_step alias and clarify scenario vs detail ([3b0bc35](https://github.com/syn7xx/testops-mcp-server/commit/3b0bc35233ed162babfe96262e1171941bcc4ec6))
* add testcase_list_in_tree MCP tool ([b606284](https://github.com/syn7xx/testops-mcp-server/commit/b606284b8e8aacf7f1632114fd84625b398181aa))
* CI, lint, CLI parsing, JWT 401 retry, MCP docs ([e091df4](https://github.com/syn7xx/testops-mcp-server/commit/e091df40cfbe73a9066f638f20b03276e1211876))
* initial release 0.1.0 ([2ea3134](https://github.com/syn7xx/testops-mcp-server/commit/2ea3134b8b9ec00f4623f2cf282b220e41da92f0))
* launch MCP tools and test plan run/sync ([825c7de](https://github.com/syn7xx/testops-mcp-server/commit/825c7deda798fb3a638e3b3099e3fb352b55c137))
* launch_stop, no-content HTTP handling, docs and API errors ([f8015f3](https://github.com/syn7xx/testops-mcp-server/commit/f8015f3dd5be2091f3e1412ea2bc1e0908fb6ed5))


### Bug Fixes

* add shebang for CLI executable ([7d30c58](https://github.com/syn7xx/testops-mcp-server/commit/7d30c58b0e446031f74ce1d9672d51e7d7480868))
* CFV null-safety, release changelog staging, scenario step API shape ([220f657](https://github.com/syn7xx/testops-mcp-server/commit/220f6572b1346dd28f9476edbd8c5a3b718ef289))

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
