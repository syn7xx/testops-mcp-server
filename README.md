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

<details>
<summary><b>Configuration in AI Editors</b> (click to expand)</summary>

Use `@syn7xx/testops-mcp-server` package:

```bash
npm install -g @syn7xx/testops-mcp-server
```

### Cursor

Add to `~/.cursor/mcp.json` or project `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": ["@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```

### Windsurf (Codeium)

Add to `~/.config/windsurf/mcp.json` or project `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": ["@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```

### Kilo Code

Add to `~/.kilocode/mcp.json` or project `.kilocode/mcp.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": ["@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```

### OpenCode

Add to `~/.opencode/mcp.json` or project `.opencode/mcp.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": ["@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": ["@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```

### Zed

Add to `~/.config/zed/mcp.json`:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": ["@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```
</details>

## License

MIT
