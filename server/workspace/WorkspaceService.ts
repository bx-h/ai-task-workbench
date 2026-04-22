import fs from "node:fs";
import path from "node:path";
import { execa } from "execa";
import type { ChangedFile, Project, Task, WorkspaceMode } from "../../shared/types";
import type { AgentDockConfig } from "../config";

export interface ResolvedWorkspace {
  cwd: string;
  workspace: string;
  worktree: string;
  worktreePath?: string;
  worktreeName?: string;
}

export class WorkspaceService {
  constructor(private readonly config: AgentDockConfig) {}

  async resolveTaskWorkspace(project: Project, title: string, taskId: string, workspaceMode: WorkspaceMode): Promise<ResolvedWorkspace> {
    if (workspaceMode === "project_root" || (!project.isGitRepo && workspaceMode === "auto")) {
      return { cwd: project.rootPath, workspace: "project root", worktree: "-" };
    }
    if (!project.isGitRepo) {
      throw Object.assign(new Error("Isolated worktrees require a Git project"), { statusCode: 400, code: "worktree_requires_git" });
    }
    return this.createWorktree(project, title, taskId);
  }

  assertAllowedCwd(project: Project, task: Pick<Task, "cwd" | "worktreePath">, cwd: string) {
    const resolved = path.resolve(cwd);
    const allowed = [project.rootPath, task.worktreePath].filter(Boolean).map((value) => path.resolve(value!));
    if (!allowed.some((value) => resolved === value || resolved.startsWith(`${value}${path.sep}`))) {
      throw Object.assign(new Error("Task cwd is outside the project allowlist"), { statusCode: 403, code: "cwd_not_allowed" });
    }
  }

  async captureChanges(task: Task): Promise<ChangedFile[]> {
    try {
      const output = await execa("git", ["status", "--short"], { cwd: task.cwd });
      return output.stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const status = line.slice(0, 2);
          const file = line.slice(3).trim();
          return {
            path: file,
            change: status.includes("D") ? "deleted" : status.includes("A") || status.includes("?") ? "added" : "modified",
            additions: 0,
            deletions: 0,
          } satisfies ChangedFile;
        });
    } catch {
      return [];
    }
  }

  private async createWorktree(project: Project, title: string, taskId: string): Promise<ResolvedWorkspace> {
    const projectSlug = cleanSlug(project.name);
    const taskSlug = cleanSlug(title).slice(0, 40) || "task";
    const shortId = taskId.slice(0, 8);
    const worktreeName = `task-${taskSlug}-${shortId}`;
    const worktreePath = path.join(this.config.worktreeRoot, `${projectSlug}-${project.id.slice(0, 8)}`, worktreeName);
    fs.mkdirSync(path.dirname(worktreePath), { recursive: true });
    if (!fs.existsSync(worktreePath)) {
      const branchName = `agentdock/${taskSlug}-${shortId}`;
      await execa("git", ["worktree", "add", worktreePath, "-b", branchName], { cwd: project.rootPath });
    }
    return {
      cwd: worktreePath,
      workspace: worktreePath,
      worktree: worktreeName,
      worktreePath,
      worktreeName,
    };
  }
}

function cleanSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}
