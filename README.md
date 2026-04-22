# AgentDock

AgentDock is a local-first AI coding task workbench. The React UI stays close to the original prototype, while a local daemon owns projects, tasks, approvals, notes, event streaming, and persistence.

## Development

```bash
npm install
npm run dev:server
npm run dev:web
```

Or run both:

```bash
npm run dev:all
```

The daemon defaults to `http://127.0.0.1:3876` and stores state in `~/.agentdock/state.db`.

## Verification

```bash
npm run build
npm run test
npm run lint
AGENTDOCK_SMOKE_URL=http://127.0.0.1:3876 npm run smoke:daemon
```

## Production-Style Local Run

```bash
npm run build
AGENTDOCK_SERVE_STATIC=1 NODE_ENV=production npm run server
```

The daemon serves the built React app, REST API, and WebSocket endpoint from the same origin.

## Scope

This MVP intentionally avoids login, cloud sync, multi-user collaboration, full IDE behavior, and automatic GitHub PR creation. Projects must be explicitly trusted before tasks or notes can write local state.
