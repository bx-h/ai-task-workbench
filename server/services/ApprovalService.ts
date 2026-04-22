import { nanoid } from "nanoid";
import type { ApprovalRequest } from "../../shared/types";
import type { Repositories } from "../db/repositories";
import { nowIso } from "../db/client";
import type { EventBus } from "./EventBus";

export interface ApprovalDecision {
  status: "approved" | "denied";
  message?: string;
}

export class ApprovalService {
  private readonly waiters = new Map<string, (decision: ApprovalDecision) => void>();

  constructor(
    private readonly repos: Repositories,
    private readonly events: EventBus,
  ) {}

  async request(input: Omit<ApprovalRequest, "id" | "status" | "createdAt">): Promise<ApprovalDecision> {
    const createdAt = nowIso();
    const request = this.repos.approvals.create({
      ...input,
      id: nanoid(),
      status: "pending",
      createdAt,
    });
    this.events.append({
      id: nanoid(),
      taskId: request.taskId,
      projectId: request.projectId,
      type: "approval_requested",
      timestamp: "just now",
      createdAt,
      content: request.description ?? "Approval requested",
      approval: {
        id: request.id,
        title: "Permission required",
        description: request.description ?? `${request.provider} wants to use ${request.toolName}`,
        command: request.command ?? request.toolName,
        cwd: request.cwd ?? "",
        reason: request.reason ?? "Agent requested user approval.",
        risk: request.riskLevel,
        request,
      },
    });
    return new Promise((resolve) => {
      this.waiters.set(request.id, resolve);
    });
  }

  resolve(id: string, status: "approved" | "denied", message?: string) {
    const request = this.repos.approvals.resolve(id, status, nowIso());
    if (!request) throw Object.assign(new Error("Approval not found or already resolved"), { statusCode: 404, code: "approval_not_found" });
    this.events.append({
      id: nanoid(),
      taskId: request.taskId,
      projectId: request.projectId,
      type: status === "approved" ? "approval_granted" : "approval_denied",
      timestamp: "just now",
      createdAt: nowIso(),
      content: status === "approved" ? "Approval granted. Continuing task." : message ?? "Approval denied. Task is blocked.",
      approval: {
        id: request.id,
        title: status === "approved" ? "Approval granted" : "Approval denied",
        description: request.description ?? "",
        command: request.command ?? request.toolName,
        cwd: request.cwd ?? "",
        reason: message ?? request.reason ?? "",
        risk: request.riskLevel,
        request,
      },
    });
    const waiter = this.waiters.get(id);
    if (waiter) {
      waiter({ status, message });
      this.waiters.delete(id);
    }
    return request;
  }
}
