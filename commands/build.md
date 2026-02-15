---
description: Dispatch implementation work to external coding agents (Codex, Claude CLI)
---

# /claude-orchestrator:build

Use the dispatch_agent tool to send implementation work to external coding agents.

When the user invokes this command with $ARGUMENTS:
1. Break the request into tickets (each targeting 1-2 files)
2. For each ticket, call dispatch_agent with provider "codex"
3. Monitor progress with list_jobs
4. When all complete, call collect_results
5. Review and integrate the results

Default provider: codex
Default model: gpt-5.3-codex
