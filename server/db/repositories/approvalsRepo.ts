import type Database from "better-sqlite3";
import type { AgentType, ApprovalRequest } from "../../../shared/types";

interface ApprovalRow {
  id: string;
  task_id: string;
  project_id: string;
  provider: AgentType;
  external_request_id: string | null;
  tool_name: string;
  command: string | null;
  cwd: string | null;
  description: string | null;
  reason: string | null;
  risk_level: ApprovalRequest["riskLevel"];
  status: ApprovalRequest["status"];
  created_at: string;
  resolved_at: string | null;
}

function toApproval(row: ApprovalRow): ApprovalRequest {
  return {
    id: row.id,
    taskId: row.task_id,
    projectId: row.project_id,
    provider: row.provider,
    externalRequestId: row.external_request_id ?? undefined,
    toolName: row.tool_name,
    command: row.command ?? undefined,
    cwd: row.cwd ?? undefined,
    description: row.description ?? undefined,
    reason: row.reason ?? undefined,
    riskLevel: row.risk_level,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

export class ApprovalsRepo {
  constructor(private readonly db: Database.Database) {}

  create(request: ApprovalRequest): ApprovalRequest {
    this.db
      .prepare(
        `INSERT INTO approval_requests (
          id, task_id, project_id, provider, external_request_id, tool_name, command, cwd, description,
          reason, risk_level, status, created_at, resolved_at
        ) VALUES (
          @id, @taskId, @projectId, @provider, @externalRequestId, @toolName, @command, @cwd, @description,
          @reason, @riskLevel, @status, @createdAt, @resolvedAt
        )`,
      )
      .run({
        ...request,
        externalRequestId: request.externalRequestId ?? null,
        command: request.command ?? null,
        cwd: request.cwd ?? null,
        description: request.description ?? null,
        reason: request.reason ?? null,
        resolvedAt: request.resolvedAt ?? null,
      });
    return this.get(request.id)!;
  }

  get(id: string): ApprovalRequest | null {
    const row = this.db.prepare("SELECT * FROM approval_requests WHERE id = ?").get(id) as ApprovalRow | undefined;
    return row ? toApproval(row) : null;
  }

  list(taskId?: string): ApprovalRequest[] {
    const rows = taskId
      ? this.db.prepare("SELECT * FROM approval_requests WHERE task_id = ? ORDER BY created_at DESC").all(taskId)
      : this.db.prepare("SELECT * FROM approval_requests ORDER BY created_at DESC").all();
    return rows.map((row) => toApproval(row as ApprovalRow));
  }

  pendingForTask(taskId: string): ApprovalRequest | null {
    const row = this.db
      .prepare("SELECT * FROM approval_requests WHERE task_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1")
      .get(taskId) as ApprovalRow | undefined;
    return row ? toApproval(row) : null;
  }

  resolve(id: string, status: "approved" | "denied", resolvedAt: string): ApprovalRequest | null {
    this.db.prepare("UPDATE approval_requests SET status = ?, resolved_at = ? WHERE id = ? AND status = 'pending'").run(status, resolvedAt, id);
    return this.get(id);
  }
}
