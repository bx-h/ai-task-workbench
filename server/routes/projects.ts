import type { FastifyInstance } from "fastify";
import { createProjectSchema, openProjectSchema, updateProjectSchema } from "../../shared/schemas";
import type { Services } from "../services/createServices";

export async function projectRoutes(app: FastifyInstance, services: Services) {
  app.get("/api/projects", async () => ({ projects: services.projects.list() }));

  app.post("/api/projects/open", async (request) => {
    const input = openProjectSchema.parse(request.body);
    return { project: await services.projects.openProject(input) };
  });

  app.post("/api/projects/create", async (request) => {
    const input = createProjectSchema.parse(request.body);
    return { project: await services.projects.createProject(input) };
  });

  app.get<{ Params: { projectId: string } }>("/api/projects/:projectId", async (request) => {
    const project = services.projects.get(request.params.projectId);
    if (!project) throw Object.assign(new Error("Project not found"), { statusCode: 404, code: "project_not_found" });
    return { project };
  });

  app.patch<{ Params: { projectId: string } }>("/api/projects/:projectId", async (request) => {
    const input = updateProjectSchema.parse(request.body);
    return { project: services.projects.updateProject(request.params.projectId, input) };
  });

  app.delete<{ Params: { projectId: string } }>("/api/projects/:projectId", async (request) => {
    services.projects.deleteProject(request.params.projectId);
    return { ok: true };
  });
}
