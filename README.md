# claude-orchestrator

Claude Code plugin that dispatches implementation work to external coding agents.

## Features

- Provider-agnostic dispatch interface
- Built-in providers for Codex and Claude CLI
- MCP tools for dispatch, status, listing jobs, and collecting results
- In-memory job tracking for v0.1

## Install

```bash
npm install
npm run build
```

## Run

```bash
npm run dev
```

## Use with Claude Code

```bash
claude --plugin-dir .
```

## Tools

- `dispatch_agent`
- `agent_status`
- `list_jobs`
- `collect_results`
