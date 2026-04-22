import type { FastifyInstance } from "fastify";
import { approvalDecisionSchema } from "../../shared/schemas";
import type { Services } from "../services/createServices";

export async function approvalRoutes(app: FastifyInstance, services: Services) {
  app.get<{ Params: { taskId: string } }>("/api/tasks/:taskId/approvals", async (request) => ({
    approvals: services.repos.approvals.list(request.params.taskId),
  }));

  app.post<{ Params: { approvalId: string } }>("/api/approvals/:approvalId/approve", async (request) => {
    const input = approvalDecisionSchema.parse(request.body ?? {});
    return { approval: services.approvals.resolve(request.params.approvalId, "approved", input.message) };
  });

  app.post<{ Params: { approvalId: string } }>("/api/approvals/:approvalId/deny", async (request) => {
    const input = approvalDecisionSchema.parse(request.body ?? {});
    return { approval: services.approvals.resolve(request.params.approvalId, "denied", input.message) };
  });
}
