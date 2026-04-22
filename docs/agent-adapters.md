# Agent Adapters

AgentDock adapters implement a shared interface and emit app-native task events through the daemon event sink.

## Mock

`MockAgentAdapter` is the default MVP runtime. It streams assistant, command, output, file, approval, summary, and completion events without external credentials. Use it to validate daemon, SQLite, WebSocket, approval, and UI behavior.

## Claude

`ClaudeAgentAdapter` is isolated behind the adapter boundary. It checks for `@anthropic-ai/claude-agent-sdk` and reports a setup event when unavailable. Real SDK execution should map SDK messages, tool approvals, user input, result states, and session ids into AgentDock task events and approval records.

## Codex

`CodexAgentAdapter` keeps app-server handling inside `server/agents/codex/` because the protocol can change. If the Codex CLI is missing, the task fails with setup guidance instead of crashing the daemon.

## Event Mapping

Adapters must not directly mutate UI state. They only call the run context:

- `appendEvent`
- `updateStatus`
- `requestApproval`
- `isCancelled`

The daemon persists and broadcasts the resulting events.
