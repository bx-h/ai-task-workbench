import type { AgentType, ApprovalMode } from "../../shared/types";
import type { TaskEvent } from "../../shared/events";
import type { ApprovalDecision } from "../services/ApprovalService";

export interface StartTaskInput {
  taskId: string;
  projectId: string;
  cwd: string;
  prompt: string;
  approvalMode: ApprovalMode;
  skill?: string;
}

export interface FollowUpInput {
  taskId: string;
  message: string;
}

export interface AgentRunContext {
  appendEvent: (event: Omit<TaskEvent, "id" | "taskId" | "projectId" | "timestamp" | "createdAt"> & Partial<TaskEvent>) => TaskEvent;
  updateStatus: (status: "running" | "waiting_approval" | "waiting_input" | "blocked" | "completed" | "failed" | "cancelled" | "interrupted", activity: string) => void;
  requestApproval: (input: {
    toolName: string;
    command?: string;
    description?: string;
    reason?: string;
    riskLevel: "low" | "medium" | "high" | "unknown";
  }) => Promise<ApprovalDecision>;
  isCancelled: () => boolean;
}

export interface AgentAdapter {
  provider: AgentType;
  supportsResume: boolean;
  startTask: (input: StartTaskInput, context: AgentRunContext) => Promise<void>;
  followUp: (input: FollowUpInput, context: AgentRunContext) => Promise<void>;
  cancel: (taskId: string) => Promise<void>;
}
