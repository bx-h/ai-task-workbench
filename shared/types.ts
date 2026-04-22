import type { TaskEvent } from "./events";

export type AgentType = "claude" | "codex" | "mock";

export type TaskStatus =
  | "draft"
  | "queued"
  | "running"
  | "waiting_approval"
  | "waiting_input"
  | "blocked"
  | "completed"
  | "failed"
  | "cancelled"
  | "interrupted"
  | "idle"
  | "archived";

export type ApprovalMode = "normal" | "read_only" | "auto_safe";
export type WorkspaceMode = "auto" | "project_root" | "isolated_worktree";

export interface Project {
  id: string;
  name: string;
  rootPath: string;
  displayPath: string;
  path: string;
  branch?: string;
  defaultAgent: AgentType;
  trusted: boolean;
  isGitRepo: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}

export interface ChangedFile {
  path: string;
  change: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  initialPrompt: string;
  agent: AgentType;
  status: TaskStatus;
  currentActivity: string;
  cwd: string;
  workspace: string;
  workspaceMode: WorkspaceMode;
  worktree: string;
  worktreePath?: string;
  worktreeName?: string;
  approvalMode: ApprovalMode;
  summary?: string;
  changedFilesCount: number;
  changedFiles: ChangedFile[];
  unread: boolean;
  elapsedMinutes: number;
  updatedLabel: string;
  events: TaskEvent[];
  note?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  projectId: string;
  provider: AgentType;
  externalRequestId?: string;
  toolName: string;
  command?: string;
  cwd?: string;
  description?: string;
  reason?: string;
  riskLevel: "low" | "medium" | "high" | "unknown";
  status: "pending" | "approved" | "denied" | "expired";
  createdAt: string;
  resolvedAt?: string;
}

export interface QuickNote {
  id: string;
  projectId: string;
  taskId?: string;
  content: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  projectName: string;
  timestamp: string;
  kind: "completed" | "approval" | "note" | "running" | "failed";
}

export interface AgentSession {
  id: string;
  taskId: string;
  provider: AgentType;
  externalSessionId?: string;
  status: "active" | "completed" | "failed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
  updatedAt: string;
}

export type { TaskEvent, TaskEventType, EventType } from "./events";
