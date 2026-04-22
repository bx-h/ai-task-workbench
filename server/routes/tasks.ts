import type { FastifyInstance } from "fastify";
import { createTaskSchema, followUpSchema } from "../../shared/schemas";
import type { Services } from "../services/createServices";

export async function taskRoutes(app: FastifyInstance, services: Services) {
  app.get("/api/tasks", async () => ({ tasks: services.tasks.list(undefined, true) }));

  app.get<{ Params: { projectId: string } }>("/api/projects/:projectId/tasks", async (request) => ({
    tasks: services.tasks.list(request.params.projectId, true),
  }));

  app.post<{ Params: { projectId: string } }>("/api/projects/:projectId/tasks", async (request) => {
    const input = createTaskSchema.parse(request.body);
    return { task: await services.tasks.createTask(request.params.projectId, input) };
  });

  app.get<{ Params: { taskId: string } }>("/api/tasks/:taskId", async (request) => {
    const task = services.tasks.get(request.params.taskId, true);
    if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404, code: "task_not_found" });
    return { task };
  });

  app.get<{ Params: { taskId: string } }>("/api/tasks/:taskId/events", async (request) => ({
    events: services.repos.events.list(request.params.taskId),
  }));

  app.post<{ Params: { taskId: string } }>("/api/tasks/:taskId/follow-up", async (request) => {
    const input = followUpSchema.parse(request.body);
    return { task: await services.tasks.followUp(request.params.taskId, input.message) };
  });

  app.post<{ Params: { taskId: string } }>("/api/tasks/:taskId/cancel", async (request) => ({
    task: await services.tasks.cancel(request.params.taskId),
  }));

  app.post<{ Params: { taskId: string } }>("/api/tasks/:taskId/archive", async (request) => ({
    task: services.tasks.archive(request.params.taskId),
  }));
}
