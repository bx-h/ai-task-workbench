# Local Development and Deployment

## Commands

```bash
npm run dev:server
npm run dev:web
npm run dev:all
```

The Vite dev server proxies `/api` and `/ws` to `http://127.0.0.1:3876`.

## Data Directory

Override the data directory for tests or smoke runs:

```bash
AGENTDOCK_DATA_DIR=/tmp/agentdock-dev npm run dev:server
```

## Smoke Checks

```bash
curl http://127.0.0.1:3876/api/health
npm run smoke:daemon
```

For a production-style local run:

```bash
npm run build
AGENTDOCK_SERVE_STATIC=1 NODE_ENV=production npm run server
```

Then verify:

```bash
curl -I http://127.0.0.1:3876/
curl http://127.0.0.1:3876/api/health
```

## User Service

```bash
scripts/systemd/install-user-service.sh
systemctl --user status agentdock.service --no-pager
journalctl --user -u agentdock.service -f
```

## Optional Tunnel

`scripts/cloudflare/agentdock-tunnel.yml` documents the optional `agentdock.hbx-happy.com` route. Public exposure is not automatic; run the tunnel only when that access is intended.
