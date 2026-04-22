import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/api/health", async () => ({
    ok: true,
    name: "agentdock-daemon",
    version: "0.1.0",
  }));
}
