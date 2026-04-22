import type Database from "better-sqlite3";
import type { AgentType, ApprovalMode, ChangedFile, Task, TaskStatus, WorkspaceMode } from "../../../shared/types";
import { parseJson } from "../client";

interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  initial_prompt: string;
  agent: AgentType;
  status: TaskStatus;
  current_activity: string;
  cwd: string;
  workspace_mode: WorkspaceMode;
  workspace: string;
  worktree: string;
  worktree_path: string | null;
  worktree_name: string | null;
  approval_mode: ApprovalMode;
  summary: string | null;
  changed_files_count: number;
  changed_files_json: string;
  unread: number;
  note: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

function minutesSince(start: string, end?: string | null) {
  const elapsed = new Date(end ?? Date.now()).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(elapsed / 60000));
}

function labelFor(time: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(time).getTime()) / 1000));
  if (seconds < 60) return seconds < 5 ? "just now" : `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return new Date(time).toLocaleDateString();
}

export function toTask(row: TaskRow): Task {
  const changedFiles = parseJson<ChangedFile[]>(row.changed_files_json, []);
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    initialPrompt: row.initial_prompt,
    agent: row.agent,
    status: row.status,
    currentActivity: row.current_activity,
    cwd: row.cwd,
    workspaceMode: row.workspace_mode,
    workspace: row.workspace,
    worktree: row.worktree,
    worktreePath: row.worktree_path ?? undefined,
    worktreeName: row.worktree_name ?? undefined,
    approvalMode: row.approval_mode,
    summary: row.summary ?? undefined,
    changedFilesCount: row.changed_files_count,
    changedFiles,
    unread: row.unread === 1,
    elapsedMinutes: minutesSince(row.started_at ?? row.created_at, row.completed_at),
    updatedLabel: labelFor(row.updated_at),
    events: [],
    note: row.note ?? undefined,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    updatedAt: row.updated_at,
  };
}

export class TasksRepo {
  constructor(private readonly db: Database.Database) {}

  list(projectId?: string): Task[] {
    const rows = projectId
      ? this.db.prepare("SELECT * FROM tasks WHERE project_id = ? ORDER BY updated_at DESC").all(projectId)
      : this.db.prepare("SELECT * FROM tasks ORDER BY updated_at DESC").all();
    return rows.map((row) => toTask(row as TaskRow));
  }

  get(id: string): Task | null {
    const row = this.db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
    return row ? toTask(row) : null;
  }

  create(task: Task): Task {
    this.db
      .prepare(
        `INSERT INTO tasks (
          id, project_id, title, initial_prompt, agent, status, current_activity, cwd, workspace_mode, workspace, worktree,
          worktree_path, worktree_name, approval_mode, summary, changed_files_count, changed_files_json, unread, note,
          created_at, started_at, completed_at, updated_at
        ) VALUES (
          @id, @projectId, @title, @initialPrompt, @agent, @status, @currentActivity, @cwd, @workspaceMode, @workspace, @worktree,
          @worktreePath, @worktreeName, @approvalMode, @summary, @changedFilesCount, @changedFilesJson, @unread, @note,
          @createdAt, @startedAt, @completedAt, @updatedAt
        )`,
      )
      .run({
        ...task,
        worktreePath: task.worktreePath ?? null,
        worktreeName: task.worktreeName ?? null,
        summary: task.summary ?? null,
        changedFilesJson: JSON.stringify(task.changedFiles ?? []),
        unread: task.unread ? 1 : 0,
        note: task.note ?? null,
        startedAt: task.startedAt ?? null,
        completedAt: task.completedAt ?? null,
      });
    return this.get(task.id) ?? task;
  }

  update(id: string, patch: Partial<Task>): Task | null {
    const current = this.get(id);
    if (!current) return null;
    const next = { ...current, ...patch };
    this.db
      .prepare(
        `UPDATE tasks SET
          title = @title,
          initial_prompt = @initialPrompt,
          agent = @agent,
          status = @status,
          current_activity = @currentActivity,
          cwd = @cwd,
          workspace_mode = @workspaceMode,
          workspace = @workspace,
          worktree = @worktree,
          worktree_path = @worktreePath,
          worktree_name = @worktreeName,
          approval_mode = @approvalMode,
          summary = @summary,
          changed_files_count = @changedFilesCount,
          changed_files_json = @changedFilesJson,
          unread = @unread,
          note = @note,
          started_at = @startedAt,
          completed_at = @completedAt,
          updated_at = @updatedAt
        WHERE id = @id`,
      )
      .run({
        ...next,
        worktreePath: next.worktreePath ?? null,
        worktreeName: next.worktreeName ?? null,
        summary: next.summary ?? null,
        changedFilesJson: JSON.stringify(next.changedFiles ?? []),
        unread: next.unread ? 1 : 0,
        note: next.note ?? null,
        startedAt: next.startedAt ?? null,
        completedAt: next.completedAt ?? null,
      });
    return this.get(id);
  }
}
