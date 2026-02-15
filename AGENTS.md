# claude-orchestrator

## What this is
A Claude Code plugin that dispatches coding work to external agents (Codex, Claude CLI, etc.)
via MCP tools. It uses a provider-agnostic interface so new agent backends can be added easily.

## Key patterns
- All providers implement the AgentProvider interface in src/providers/base.ts
- Job state is managed by JobManager in src/jobs/manager.ts
- MCP tools in src/tools/ are thin wrappers that call providers via the registry
- Child processes are spawned detached with stdout/stderr buffering

## Build & test
npm install
npm run build      # tsc
npm run dev        # ts-node with watch

## Test locally with Claude Code
claude --plugin-dir .

## Conventions
- TypeScript strict mode
- No default exports
- Error handling: never throw in MCP tool handlers, return error in content
- Logging: use src/utils/logger.ts, write to stderr (stdout is MCP transport)
