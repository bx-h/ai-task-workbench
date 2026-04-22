import type { ApprovalRequest, ChangedFile } from "./types";

export type TaskEventType =
  | "task_created"
  | "task_started"
  | "user_message"
  | "assistant_message"
  | "assistant_delta"
  | "command_started"
  | "command_output_delta"
  | "command_completed"
  | "file_changed"
  | "diff_updated"
  | "approval_requested"
  | "approval_resolved"
  | "input_requested"
  | "input_resolved"
  | "plan_updated"
  | "summary_updated"
  | "task_completed"
  | "task_failed"
  | "task_cancelled"
  | "system"
  | "user_prompt"
  | "command_output"
  | "approval_granted"
  | "approval_denied"
  | "task_summary";

export type EventType = TaskEventType;

export interface DiffHunk {
  header: string;
  lines: { kind: "add" | "del" | "ctx" | "meta"; text: string }[];
}

export interface TaskEvent {
  id: string;
  taskId?: string;
  projectId?: string;
  seq?: number;
  type: TaskEventType;
  payload?: unknown;
  createdAt?: string;
  timestamp: string;
  content?: string;
  command?: string;
  output?: string[];
  exitCode?: number;
  durationMs?: number;
  files?: ChangedFile[];
  diff?: { path: string; hunks: DiffHunk[] };
  approval?: {
    id?: string;
    title: string;
    description: string;
    command: string;
    cwd: string;
    reason: string;
    risk: "low" | "medium" | "high" | "unknown";
    affects?: string[];
    request?: ApprovalRequest;
  };
}

export interface WebSocketEnvelope {
  type: "hello" | "task_event" | "task_updated" | "project_updated" | "activity" | "error";
  taskId?: string;
  projectId?: string;
  event?: TaskEvent;
  payload?: unknown;
}
