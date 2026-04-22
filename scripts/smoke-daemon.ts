const baseUrl = process.env.AGENTDOCK_SMOKE_URL ?? "http://127.0.0.1:3876";

const health = await fetch(`${baseUrl}/api/health`);
if (!health.ok) {
  throw new Error(`Health check failed: ${health.status}`);
}
const body = (await health.json()) as { ok?: boolean; name?: string };
if (!body.ok || body.name !== "agentdock-daemon") {
  throw new Error(`Unexpected health response: ${JSON.stringify(body)}`);
}

await new Promise<void>((resolve, reject) => {
  const wsUrl = baseUrl.replace(/^http/, "ws");
  const socket = new WebSocket(`${wsUrl}/api/ws`);
  const timeout = setTimeout(() => {
    socket.close();
    reject(new Error("WebSocket smoke timed out"));
  }, 3000);
  socket.onmessage = () => {
    clearTimeout(timeout);
    socket.close();
    resolve();
  };
  socket.onerror = () => {
    clearTimeout(timeout);
    reject(new Error("WebSocket smoke failed"));
  };
});

console.log(`AgentDock smoke passed for ${baseUrl}`);
