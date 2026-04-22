import type { FastifyInstance } from "fastify";
import type { ActivityItem } from "../../shared/types";
import type { Services } from "../services/createServices";

export async function activityRoutes(app: FastifyInstance, services: Services) {
  app.get("/api/activity", async () => {
    const projects = new Map(services.projects.list().map((project) => [project.id, project]));
    const events = services.repos.events.listAfter().slice(-40).reverse();
    const activity: ActivityItem[] = events.map((event) => {
      const project = event.projectId ? projects.get(event.projectId) : undefined;
      const kind: ActivityItem["kind"] =
        event.type === "approval_requested"
          ? "approval"
          : event.type === "task_completed"
            ? "completed"
            : event.type === "task_failed"
              ? "failed"
              : event.type === "summary_updated"
                ? "note"
                : "running";
      return {
        id: event.id,
        text: event.content ?? event.type,
        projectName: project?.name ?? "",
        timestamp: event.timestamp,
        kind,
      };
    });
    return { activity };
  });
}
