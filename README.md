# TestOps MCP Server

Model Context Protocol server for TestOps 5.25

Package: `@syn7xx/testops-mcp-server`

## Installation

```bash
npm install @syn7xx/testops-mcp-server
```

Or use directly via npx:

```bash
npx @syn7xx/testops-mcp-server --url <testops-url> --token <api-token>
```

Short flags: `-u` / `-t` / `-h` (same as `--url`, `--token`, `--help`).  
Environment variables: `TESTOPS_URL`, `TESTOPS_TOKEN` (used when flags are omitted).

## Build

```bash
npm run build
```

## Run

```bash
npm start -- --url <testops-url> --token <api-token>
```

Or with npx (if not installed globally):

```bash
npx @syn7xx/testops-mcp-server --url <testops-url> --token <api-token>
```

## MCP setup in AI tools

Configs differ by product:

| Product | Typical config file | Root key | Notes |
|--------|---------------------|----------|--------|
| Cursor, Windsurf, Kilo Code, Zed | `mcp.json` (paths vary) | **`mcpServers`** | `command` + `args` |
| **Visual Studio Code** | `.vscode/mcp.json` or user MCP config | **`servers`** | [Official docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) — not `mcpServers` |
| Claude Desktop | `claude_desktop_config.json` | **`mcpServers`** | Same idea as Cursor |
| **OpenCode** | `opencode.jsonc` (project or [user config](https://open-code.ai/en/docs/config)) | **`mcp`** | **`type: "local"`**, `command` as **array**, env under **`environment`** |

Do **not** commit real tokens; use env vars or local-only config.

### Cursor, Windsurf, Kilo Code, Zed

These use top-level **`mcpServers`**, each entry has **`command`** (string) and **`args`** (array).

**Cursor** — `~/.cursor/mcp.json` or project `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": [
        "-y",
        "@syn7xx/testops-mcp-server",
        "--url",
        "https://your-testops.com",
        "--token",
        "your-token"
      ]
    }
  }
}
```

**Windsurf** — `~/.config/windsurf/mcp.json` or project `.windsurf/mcp.json` (same structure).

**Kilo Code** — `~/.kilocode/mcp.json` or project `.kilocode/mcp.json` (same structure).

**Zed** — `~/.config/zed/mcp.json` (same structure).

### Visual Studio Code

VS Code stores MCP config in **`mcp.json`** with top-level **`servers`**, not `mcpServers` (see [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) and the [MCP configuration reference](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration)).

Workspace file: **`.vscode/mcp.json`**, or run **MCP: Open User Configuration** for a global file.

```json
{
  "servers": {
    "testops": {
      "command": "npx",
      "args": [
        "-y",
        "@syn7xx/testops-mcp-server",
        "--url",
        "https://your-testops.com",
        "--token",
        "your-token"
      ]
    }
  }
}
```

For sensitive values, prefer [input variables](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration#_input-variables-for-sensitive-data) or env files as described in the reference.

### OpenCode

OpenCode does **not** use `mcpServers`. Define servers under **`mcp`**, set **`type: "local"`**, pass the process as a **`command`** array (e.g. `npx`, `-y`, `@syn7xx/testops-mcp-server`, …), and optional env in **`environment`** (not `env`). See [OpenCode MCP servers](https://open-code.ai/docs/en/mcp-servers).

Example — `opencode.jsonc` in the project root or in the [global OpenCode config](https://open-code.ai/en/docs/config):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "testops": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@syn7xx/testops-mcp-server",
        "--url",
        "https://your-testops.com",
        "--token",
        "your-token"
      ],
      "enabled": true
    }
  }
}
```

Using environment variables instead of flags:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "testops": {
      "type": "local",
      "command": ["npx", "-y", "@syn7xx/testops-mcp-server"],
      "environment": {
        "TESTOPS_URL": "https://your-testops.com",
        "TESTOPS_TOKEN": "your-token"
      },
      "enabled": true
    }
  }
}
```

### Claude Desktop

**macOS** — `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": [
        "@syn7xx/testops-mcp-server",
        "--url",
        "https://your-testops.com",
        "--token",
        "your-token"
      ]
    }
  }
}
```

On **Windows**, the config lives under `%APPDATA%\Claude\` — see Anthropic’s Claude Desktop documentation for the exact path.

### Global install (optional)

If you prefer a fixed binary path instead of `npx`:

```bash
npm install -g @syn7xx/testops-mcp-server
```

Then use `"command": "testops-mcp-server"` and `"args": ["--url", "...", "--token", "..."]` under **`mcpServers`** (Cursor, Claude, …) or **`servers`** (VS Code), or the **`command`** array in OpenCode.

## Tools

### Project

| Tool | Description |
|------|-------------|
| `project_list` | List projects with pagination |
| `project_find_by_name` | Find project by exact or partial name match |
| `project_get_by_id` | Get project by ID |

### Test Plan

| Tool | Description |
|------|-------------|
| `testplan_get` | Get test plan by ID |
| `testplan_get_test_cases` | Get test cases from test plan with pagination |

### Test Case

Routing is defined in each tool’s **description** in `tools/list`. For step actions and expected results from `/api/testcase/{id}/step`, use **`testcase_get_scenario`** or **`testcase_get_step`** (same behavior).

| Tool | Description |
|------|-------------|
| `testcase_get` | Get test case by ID |
| `testcase_get_detail` | Summary with flattened step strings and custom fields (not raw scenario JSON) |
| `testcase_get_scenario` | Scenario JSON: steps and expected results |
| `testcase_get_step` | Same as `testcase_get_scenario` (alias for LLM-friendly naming) |
| `testcase_update_step` | Update a step in scenario |
| `testcase_set_scenario` | Replace all steps in scenario |
| `testcase_get_custom_fields` | Get custom field values |
| `testcase_update_custom_fields` | Update custom field values |
| `testcase_search_by_aql` | Search test cases using AQL |
| `testcase_list_in_tree` | List test cases in a project tree (`treeId`, optional `parentNodeId`) |

## Project Structure

```
src/
├── shared/           # Utilities (Result, pagination, API client)
├── domain/           # Business logic (project, test-plan, test-case)
├── presentation/     # MCP tools
├── index.ts          # Entry point
└── server.ts         # MCP server configuration
```

## Releasing

Publishing to **npm** is only via the GitHub Actions workflow **Release** (`release-it`). The **CI** workflow only runs lint and build.

**This workflow does not run on `git push`.** It is triggered **only** when someone opens **Actions → Release → Run workflow**, selects branch **`main`**, and chooses **patch** / **minor** / **major**. A plain merge or push to `main` will not start `release-it` (by design, so every commit does not bump the version).

Steps:

1. Repository secret **`NPM_TOKEN`** (npm token with publish access for `@syn7xx`).
2. **Actions** tab → **Release** in the left list → **Run workflow** → branch **main** → run.

That bumps `package.json`, updates **`CHANGELOG.md`** (from conventional commits since the last tag), creates a git tag, pushes to `main`, and runs **`npm publish`**. Use commit messages like `feat: ...`, `fix: ...`, `chore: ...` so the changelog has meaningful entries. Locally you can use `npm run release` (interactive) or `npm run release:patch` / `:minor` / `:major` instead.

If you do not want a changelog at all, remove the `@release-it/conventional-changelog` plugin from `release-it.json` and delete `CHANGELOG.md`.

If the **Release** workflow is missing in **Actions**, ensure `.github/workflows/release.yml` is on the **default branch** and that Actions are allowed in the repository **Settings → Actions → General**.

## License

MIT
