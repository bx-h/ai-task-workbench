# AgentDock Architecture

AgentDock is a single repository with three layers:

- `src/`: existing Vite/React/shadcn front end.
- `server/`: local Node.js daemon.
- `shared/`: TypeScript contracts and schemas used by both sides.

The daemon owns durable state and execution. The browser only renders state and sends user actions.

## Data Flow

1. The front end reads projects, tasks, activity, and notes over REST.
2. Mutations such as task creation and approval decisions go to REST routes.
3. The daemon appends task events to SQLite and broadcasts them over WebSocket.
4. The front-end reducer merges live events into the task list and task detail timeline.

## Persistence

Default state lives under `~/.agentdock`:

- `state.db`: SQLite database.
- `logs/`: daemon logs when supervised.
- `worktrees/`: daemon-created Git worktrees.

Trusted projects may also receive `.agentdock/notes/YYYY-MM-DD.md` for quick notes.

## Safety

The daemon binds to `127.0.0.1:3876` by default. Project paths are validated server-side, projects must be trusted before unsafe actions, and task working directories are limited to the project root or daemon-created worktree.
