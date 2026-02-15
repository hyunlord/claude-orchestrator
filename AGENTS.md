# claude-orchestrator

Claude Code plugin that dispatches coding work to external agents.
Provider-agnostic: Codex, Claude CLI, Gemini, or any future agent.

## Build
npm install && npm run build

## Conventions
- TypeScript strict, no `any`
- stdout is MCP transport — all logging to stderr
- Never throw in MCP tool handlers, return error as content
- One provider = one file in src/providers/