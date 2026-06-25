# TestOps MCP Server

[![npm](https://img.shields.io/npm/v/@syn7xx/testops-mcp-server.svg?logo=npm&label=npm)](https://www.npmjs.com/package/@syn7xx/testops-mcp-server)

MCP server for TestOps 5.25. Lets AI assistants (Cursor, VS Code, Claude, OpenCode, Windsurf, Zed, Kilo Code) work directly with projects, launches, test plans, and test cases in TestOps.

---

## What you can do

Once connected, an AI assistant can:

- Find projects, launches, and test plans
- Create and stop test launches
- Read, create, and edit test cases
- Work with scenarios and custom fields
- Search test cases using AQL

---

## Quick start

### Install

```bash
npm install @syn7xx/testops-mcp-server
```

Or run without installing — via npx:

```bash
npx @syn7xx/testops-mcp-server --url https://your-testops.com --token your-token
```

Short flags: `-u` (url), `-t` (token), `-h` (help).

You can also use environment variables:

```bash
export TESTOPS_URL=https://your-testops.com
export TESTOPS_TOKEN=your-token
npx @syn7xx/testops-mcp-server
```

CLI flags take priority over environment variables.

---

## Connecting to an AI tool

### Cursor, Windsurf, Kilo Code, Zed

`mcp.json` in your project or home folder:

```json
{
  "mcpServers": {
    "testops": {
      "command": "npx",
      "args": ["-y", "@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```

### Visual Studio Code

`.vscode/mcp.json` in your project (key is `servers`, not `mcpServers`):

```json
{
  "servers": {
    "testops": {
      "command": "npx",
      "args": ["-y", "@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"]
    }
  }
}
```

### OpenCode

`opencode.jsonc`:

```jsonc
{
  "mcp": {
    "testops": {
      "type": "local",
      "command": ["npx", "-y", "@syn7xx/testops-mcp-server", "--url", "https://your-testops.com", "--token", "your-token"],
      "enabled": true
    }
  }
}
```

Or with environment variables:

```jsonc
{
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

`claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`):

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

> Never commit real tokens. Use environment variables or local-only configs.

---

## Available tools

### Projects

| Tool | Description |
|---|---|
| `project_list` | List projects with pagination |
| `project_find_by_name` | Find project by exact or partial name match |
| `project_get_by_id` | Get project by ID |

### Launches

| Tool | Description |
|---|---|
| `launch_create` | Create a test launch |
| `launch_stop` | Stop a running launch |
| `launch_get_statistic` | Launch summary: counts by status + progress |
| `launch_list_test_results` | Flat paginated test results for a launch |

### Test Plans

| Tool | Description |
|---|---|
| `testplan_get` | Get test plan by ID |
| `testplan_get_test_cases` | Get test cases from a test plan |
| `testplan_run` | Create a launch from a test plan |
| `testplan_sync` | Sync test plan with its source |

### Test Cases

| Tool | Description |
|---|---|
| `testcase_get` | Get test case by ID |
| `testcase_get_detail` | Summary: flattened step strings, custom fields, tags |
| `testcase_get_scenario` | Full scenario JSON (steps + expected results) |
| `testcase_get_step` | Same as `testcase_get_scenario` (alias) |
| `testcase_get_custom_fields` | Get custom field values for a test case |
| `testcase_update_step` | Update a single scenario step |
| `testcase_set_scenario` | Replace all steps in a scenario |
| `testcase_update_custom_fields` | Set custom field values |
| `testcase_search_by_aql` | Search test cases using AQL query |
| `testcase_list_in_tree` | List test cases in a project tree |
| `testcase_create` | Create a test case (with steps, tags, custom fields) |

### Project Custom Fields

| Tool | Description |
|---|---|
| `project_get_custom_fields` | Custom field definitions for a project |
| `project_get_custom_field_values` | Available values for a custom field |

---

## Self-signed certificates

If TestOps uses a self-signed certificate and Node.js fails TLS validation:

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

This disables certificate checks for all HTTPS requests in that process. Use only when necessary and in a trusted environment.

---

## Build and run from source

```bash
# Clone
git clone https://github.com/syn7xx/testops-mcp-server.git
cd testops-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run
npm start -- --url https://your-testops.com --token your-token
```

For working on the codebase, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT
