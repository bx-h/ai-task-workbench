import type Database from "better-sqlite3";
import type { AgentType, Project } from "../../../shared/types";

interface ProjectRow {
  id: string;
  name: string;
  root_path: string;
  display_path: string;
  branch: string | null;
  default_agent: AgentType;
  trusted: number;
  is_git_repo: number;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    rootPath: row.root_path,
    displayPath: row.display_path,
    path: row.display_path,
    branch: row.branch ?? "",
    defaultAgent: row.default_agent,
    trusted: row.trusted === 1,
    isGitRepo: row.is_git_repo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at,
  };
}

export class ProjectsRepo {
  constructor(private readonly db: Database.Database) {}

  list(): Project[] {
    return this.db.prepare("SELECT * FROM projects ORDER BY last_opened_at DESC").all().map((row) => toProject(row as ProjectRow));
  }

  get(id: string): Project | null {
    const row = this.db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as ProjectRow | undefined;
    return row ? toProject(row) : null;
  }

  findByRootPath(rootPath: string): Project | null {
    const row = this.db.prepare("SELECT * FROM projects WHERE root_path = ?").get(rootPath) as ProjectRow | undefined;
    return row ? toProject(row) : null;
  }

  upsert(project: Project): Project {
    this.db
      .prepare(
        `INSERT INTO projects (
          id, name, root_path, display_path, branch, default_agent, trusted, is_git_repo, created_at, updated_at, last_opened_at
        ) VALUES (
          @id, @name, @rootPath, @displayPath, @branch, @defaultAgent, @trusted, @isGitRepo, @createdAt, @updatedAt, @lastOpenedAt
        )
        ON CONFLICT(root_path) DO UPDATE SET
          name = excluded.name,
          display_path = excluded.display_path,
          branch = excluded.branch,
          default_agent = excluded.default_agent,
          trusted = excluded.trusted,
          is_git_repo = excluded.is_git_repo,
          updated_at = excluded.updated_at,
          last_opened_at = excluded.last_opened_at`,
      )
      .run({
        ...project,
        branch: project.branch ?? null,
        trusted: project.trusted ? 1 : 0,
        isGitRepo: project.isGitRepo ? 1 : 0,
      });
    return this.findByRootPath(project.rootPath) ?? project;
  }

  update(id: string, patch: Partial<Pick<Project, "name" | "defaultAgent" | "trusted" | "updatedAt" | "lastOpenedAt">>): Project | null {
    const current = this.get(id);
    if (!current) return null;
    const next = { ...current, ...patch };
    this.upsert(next);
    return this.get(id);
  }

  delete(id: string) {
    this.db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  }
}
