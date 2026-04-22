export type AgentType = "claude" | "codex";

export type TaskStatus =
  | "running"
  | "waiting_approval"
  | "waiting_input"
  | "completed"
  | "failed"
  | "blocked"
  | "idle"
  | "archived";

export type ApprovalMode = "normal" | "read_only" | "auto_safe";
export type WorkspaceMode = "auto" | "project_root" | "isolated_worktree";

export interface Project {
  id: string;
  name: string;
  path: string;
  branch: string;
  defaultAgent: AgentType;
}

export type EventType =
  | "user_prompt"
  | "assistant_message"
  | "command_started"
  | "command_output"
  | "file_changed"
  | "approval_requested"
  | "approval_granted"
  | "approval_denied"
  | "task_summary"
  | "system";

export interface TaskEvent {
  id: string;
  type: EventType;
  timestamp: string; // relative label, e.g. "18m ago"
  content?: string;
  command?: string;
  output?: string[];
  files?: { path: string; change: "added" | "modified" | "deleted"; additions?: number; deletions?: number }[];
  approval?: {
    title: string;
    description: string;
    command: string;
    cwd: string;
    reason: string;
    risk: "low" | "medium" | "high";
  };
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
  agent: AgentType;
  status: TaskStatus;
  currentActivity: string;
  workspace: string;
  worktree: string;
  approvalMode: ApprovalMode;
  elapsedMinutes: number;
  updatedLabel: string;
  changedFiles: ChangedFile[];
  events: TaskEvent[];
  note?: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  projectName: string;
  timestamp: string;
  kind: "completed" | "approval" | "note" | "running" | "failed";
}