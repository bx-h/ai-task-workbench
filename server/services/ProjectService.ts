import fs from "node:fs";
import path from "node:path";
import { execa } from "execa";
import { nanoid } from "nanoid";
import type { AgentType, Project } from "../../shared/types";
import type { Repositories } from "../db/repositories";
import { nowIso } from "../db/client";

export class ProjectService {
  constructor(private readonly repos: Repositories) {}

  list() {
    return this.repos.projects.list();
  }

  get(id: string) {
    return this.repos.projects.get(id);
  }

  async openProject(input: { path: string; trust?: boolean; defaultAgent?: AgentType }) {
    const rootPath = path.resolve(input.path);
    const stat = fs.existsSync(rootPath) ? fs.statSync(rootPath) : null;
    if (!stat?.isDirectory()) {
      throw Object.assign(new Error("Project path must be an existing directory"), { statusCode: 400, code: "invalid_project_path" });
    }
    return this.persistDetectedProject(rootPath, path.basename(rootPath), Boolean(input.trust), input.defaultAgent ?? "mock");
  }

  async createProject(input: { path: string; name?: string; trust?: boolean; defaultAgent?: AgentType }) {
    const rootPath = path.resolve(input.path);
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }
    const stat = fs.statSync(rootPath);
    if (!stat.isDirectory()) {
      throw Object.assign(new Error("Project path must be a directory"), { statusCode: 400, code: "invalid_project_path" });
    }
    return this.persistDetectedProject(rootPath, input.name ?? path.basename(rootPath), Boolean(input.trust), input.defaultAgent ?? "mock");
  }

  updateProject(id: string, patch: Partial<Pick<Project, "name" | "defaultAgent" | "trusted">>) {
    const updated = this.repos.projects.update(id, { ...patch, updatedAt: nowIso(), lastOpenedAt: nowIso() });
    if (!updated) throw Object.assign(new Error("Project not found"), { statusCode: 404, code: "project_not_found" });
    return updated;
  }

  deleteProject(id: string) {
    this.repos.projects.delete(id);
  }

  requireTrusted(id: string) {
    const project = this.get(id);
    if (!project) throw Object.assign(new Error("Project not found"), { statusCode: 404, code: "project_not_found" });
    if (!project.trusted) throw Object.assign(new Error("Project must be trusted before this action"), { statusCode: 403, code: "trust_required" });
    return project;
  }

  private async persistDetectedProject(rootPath: string, name: string, trusted: boolean, defaultAgent: AgentType) {
    const existing = this.repos.projects.findByRootPath(rootPath);
    const git = await detectGit(rootPath);
    const now = nowIso();
    const project: Project = {
      id: existing?.id ?? nanoid(),
      name,
      rootPath,
      displayPath: rootPath.replace(process.env.HOME ?? "", "~"),
      path: rootPath.replace(process.env.HOME ?? "", "~"),
      branch: git.branch,
      defaultAgent: existing?.defaultAgent ?? defaultAgent,
      trusted: trusted || Boolean(existing?.trusted),
      isGitRepo: git.isGitRepo,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastOpenedAt: now,
    };
    return this.repos.projects.upsert(project);
  }
}

async function detectGit(rootPath: string): Promise<{ isGitRepo: boolean; branch: string }> {
  try {
    const branch = await execa("git", ["branch", "--show-current"], { cwd: rootPath });
    await execa("git", ["rev-parse", "--show-toplevel"], { cwd: rootPath });
    return { isGitRepo: true, branch: branch.stdout.trim() || "detached" };
  } catch {
    return { isGitRepo: false, branch: "" };
  }
}
