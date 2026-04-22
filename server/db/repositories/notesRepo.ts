import type Database from "better-sqlite3";
import type { QuickNote } from "../../../shared/types";

interface NoteRow {
  id: string;
  project_id: string;
  task_id: string | null;
  content: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

function toNote(row: NoteRow): QuickNote {
  return {
    id: row.id,
    projectId: row.project_id,
    taskId: row.task_id ?? undefined,
    content: row.content,
    filePath: row.file_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class NotesRepo {
  constructor(private readonly db: Database.Database) {}

  list(projectId?: string): QuickNote[] {
    const rows = projectId
      ? this.db.prepare("SELECT * FROM notes WHERE project_id = ? ORDER BY updated_at DESC").all(projectId)
      : this.db.prepare("SELECT * FROM notes ORDER BY updated_at DESC").all();
    return rows.map((row) => toNote(row as NoteRow));
  }

  get(id: string): QuickNote | null {
    const row = this.db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as NoteRow | undefined;
    return row ? toNote(row) : null;
  }

  create(note: QuickNote): QuickNote {
    this.db
      .prepare(
        `INSERT INTO notes (id, project_id, task_id, content, file_path, created_at, updated_at)
         VALUES (@id, @projectId, @taskId, @content, @filePath, @createdAt, @updatedAt)`,
      )
      .run({ ...note, taskId: note.taskId ?? null });
    return this.get(note.id) ?? note;
  }

  update(id: string, content: string, updatedAt: string): QuickNote | null {
    this.db.prepare("UPDATE notes SET content = ?, updated_at = ? WHERE id = ?").run(content, updatedAt, id);
    return this.get(id);
  }

  delete(id: string) {
    this.db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  }
}
