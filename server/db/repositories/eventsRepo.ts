import type Database from "better-sqlite3";
import type { TaskEvent, TaskEventType } from "../../../shared/events";
import { parseJson } from "../client";

interface EventRow {
  id: string;
  task_id: string;
  project_id: string;
  seq: number;
  type: TaskEventType;
  payload_json: string;
  timestamp: string;
  created_at: string;
}

function toEvent(row: EventRow): TaskEvent {
  const payload = parseJson<Record<string, unknown>>(row.payload_json, {});
  return {
    id: row.id,
    taskId: row.task_id,
    projectId: row.project_id,
    seq: row.seq,
    type: row.type,
    payload,
    createdAt: row.created_at,
    timestamp: row.timestamp,
    content: typeof payload.content === "string" ? payload.content : undefined,
    command: typeof payload.command === "string" ? payload.command : undefined,
    output: Array.isArray(payload.output) ? (payload.output as string[]) : undefined,
    exitCode: typeof payload.exitCode === "number" ? payload.exitCode : undefined,
    durationMs: typeof payload.durationMs === "number" ? payload.durationMs : undefined,
    files: Array.isArray(payload.files) ? (payload.files as TaskEvent["files"]) : undefined,
    diff: typeof payload.diff === "object" && payload.diff ? (payload.diff as TaskEvent["diff"]) : undefined,
    approval: typeof payload.approval === "object" && payload.approval ? (payload.approval as TaskEvent["approval"]) : undefined,
  };
}

export class EventsRepo {
  constructor(private readonly db: Database.Database) {}

  append(input: Omit<TaskEvent, "seq"> & { taskId: string; projectId: string; createdAt: string }): TaskEvent {
    const seq =
      ((this.db.prepare("SELECT MAX(seq) AS max_seq FROM task_events WHERE task_id = ?").get(input.taskId) as { max_seq?: number | null })
        .max_seq ?? 0) + 1;
    const payload = {
      ...(typeof input.payload === "object" && input.payload ? (input.payload as Record<string, unknown>) : {}),
      content: input.content,
      command: input.command,
      output: input.output,
      exitCode: input.exitCode,
      durationMs: input.durationMs,
      files: input.files,
      diff: input.diff,
      approval: input.approval,
    };
    this.db
      .prepare(
        `INSERT INTO task_events (id, task_id, project_id, seq, type, payload_json, timestamp, created_at)
         VALUES (@id, @taskId, @projectId, @seq, @type, @payloadJson, @timestamp, @createdAt)`,
      )
      .run({
        id: input.id,
        taskId: input.taskId,
        projectId: input.projectId,
        seq,
        type: input.type,
        payloadJson: JSON.stringify(payload),
        timestamp: input.timestamp,
        createdAt: input.createdAt,
      });
    return this.get(input.taskId, seq)!;
  }

  get(taskId: string, seq: number): TaskEvent | null {
    const row = this.db.prepare("SELECT * FROM task_events WHERE task_id = ? AND seq = ?").get(taskId, seq) as EventRow | undefined;
    return row ? toEvent(row) : null;
  }

  list(taskId: string): TaskEvent[] {
    return this.db
      .prepare("SELECT * FROM task_events WHERE task_id = ? ORDER BY seq ASC")
      .all(taskId)
      .map((row) => toEvent(row as EventRow));
  }

  listAfter(createdAfter?: string): TaskEvent[] {
    const rows = createdAfter
      ? this.db.prepare("SELECT * FROM task_events WHERE created_at > ? ORDER BY created_at ASC, seq ASC").all(createdAfter)
      : this.db.prepare("SELECT * FROM task_events ORDER BY created_at DESC LIMIT 200").all().reverse();
    return rows.map((row) => toEvent(row as EventRow));
  }
}
