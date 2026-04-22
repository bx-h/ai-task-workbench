import type { FastifyInstance } from "fastify";
import { createNoteSchema, updateNoteSchema } from "../../shared/schemas";
import type { Services } from "../services/createServices";

export async function noteRoutes(app: FastifyInstance, services: Services) {
  app.get("/api/notes", async () => ({ notes: services.notes.list() }));

  app.get<{ Params: { projectId: string } }>("/api/projects/:projectId/notes", async (request) => ({
    notes: services.notes.list(request.params.projectId),
  }));

  app.post<{ Params: { projectId: string } }>("/api/projects/:projectId/notes", async (request) => {
    const body = typeof request.body === "object" && request.body ? request.body : {};
    const input = createNoteSchema.parse({ ...body, projectId: request.params.projectId });
    return { note: services.notes.create({ projectId: request.params.projectId, taskId: input.taskId, content: input.content }) };
  });

  app.patch<{ Params: { noteId: string } }>("/api/notes/:noteId", async (request) => {
    const input = updateNoteSchema.parse(request.body);
    return { note: services.notes.update(request.params.noteId, input.content) };
  });

  app.delete<{ Params: { noteId: string } }>("/api/notes/:noteId", async (request) => {
    services.notes.delete(request.params.noteId);
    return { ok: true };
  });
}
