import fs from "node:fs";
import path from "node:path";
import fastify, { type FastifyError } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import { ZodError } from "zod";
import type { AgentDockConfig } from "./config";
import { loadConfig } from "./config";
import { createDatabase, type DatabaseHandle } from "./db/client";
import { createServices, type Services } from "./services/createServices";
import { activityRoutes } from "./routes/activity";
import { approvalRoutes } from "./routes/approvals";
import { healthRoutes } from "./routes/health";
import { noteRoutes } from "./routes/notes";
import { projectRoutes } from "./routes/projects";
import { taskRoutes } from "./routes/tasks";

export interface AppBuild {
  app: ReturnType<typeof fastify>;
  config: AgentDockConfig;
  database: DatabaseHandle;
  services: Services;
}

export async function buildApp(overrides: Partial<AgentDockConfig> = {}): Promise<AppBuild> {
  const config = loadConfig(overrides);
  fs.mkdirSync(config.logDir, { recursive: true });
  fs.mkdirSync(config.worktreeRoot, { recursive: true });
  const database = createDatabase(config);
  const services = createServices(config, database);
  const app = fastify({ logger: false });

  app.setErrorHandler((error: FastifyError | ZodError, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: "validation_error", details: error.flatten() });
    }
    const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
    const code = typeof (error as { code?: unknown }).code === "string" ? (error as { code: string }).code : "internal_error";
    return reply.status(statusCode).send({ error: code, message: error.message });
  });

  await app.register(fastifyWebsocket);
  app.get("/api/ws", { websocket: true }, (socket) => {
    const unregister = services.events.registerClient(socket);
    socket.on("close", unregister);
  });
  app.get("/ws", { websocket: true }, (socket) => {
    const unregister = services.events.registerClient(socket);
    socket.on("close", unregister);
  });

  await healthRoutes(app);
  await projectRoutes(app, services);
  await taskRoutes(app, services);
  await approvalRoutes(app, services);
  await noteRoutes(app, services);
  await activityRoutes(app, services);

  if (config.serveStatic && fs.existsSync(config.staticDir)) {
    await app.register(fastifyStatic, {
      root: config.staticDir,
      prefix: "/",
    });
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api") || request.url.startsWith("/ws")) {
        return reply.status(404).send({ error: "not_found" });
      }
      return reply.sendFile("index.html");
    });
  }

  app.addHook("onClose", async () => {
    database.close();
  });

  return { app, config, database, services };
}

export function staticDirFromCwd(cwd = process.cwd()) {
  return path.resolve(cwd, "dist");
}
