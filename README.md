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

| Tool | Description |
|------|-------------|
| `testcase_get` | Get test case by ID |
| `testcase_get_detail` | Get test case with steps and custom fields |
| `testcase_get_scenario` | Get scenario (steps and expected results) |
| `testcase_update_step` | Update a step in scenario |
| `testcase_set_scenario` | Replace all steps in scenario |
| `testcase_get_custom_fields` | Get custom field values |
| `testcase_update_custom_fields` | Update custom field values |
| `testcase_search_by_aql` | Search test cases using AQL |

## Project Structure

```
src/
├── shared/           # Utilities (Result, pagination, API client)
├── domain/           # Business logic (project, test-plan, test-case)
├── presentation/     # MCP tools
├── index.ts          # Entry point
└── server.ts         # MCP server configuration
```

## License

MIT
