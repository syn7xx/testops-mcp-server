# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
On each release, [release-it](https://github.com/release-it/release-it) with `@release-it/conventional-changelog` prepends new sections from [Conventional Commits](https://www.conventionalcommits.org/) since the previous tag.

## [Unreleased]

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
