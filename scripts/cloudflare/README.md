# AgentDock Cloudflare Tunnel

This route is optional and exposes the local daemon through `agentdock.hbx-happy.com`.

Smoke check after the daemon is running:

```bash
cloudflared tunnel --config scripts/cloudflare/agentdock-tunnel.yml run agentdock
curl -I https://agentdock.hbx-happy.com/
curl https://agentdock.hbx-happy.com/api/health
```

Keep the daemon loopback-only. The tunnel is the explicit exposure mechanism.
