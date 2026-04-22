import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Project, Task } from "../../shared/types";
import { WorkspaceService } from "../workspace/WorkspaceService";

function project(rootPath: string): Project {
  return {
    id: "project-1",
    name: "Project One",
    rootPath,
    displayPath: rootPath,
    path: rootPath,
    branch: "main",
    defaultAgent: "mock",
    trusted: true,
    isGitRepo: false,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
    lastOpenedAt: "2026-04-22T00:00:00.000Z",
  };
}

describe("WorkspaceService", () => {
  it("rejects cwd outside the project allowlist", () => {
    const rootPath = fs.mkdtempSync(path.join(os.tmpdir(), "agentdock-project-"));
    const service = new WorkspaceService({
      host: "127.0.0.1",
      port: 3876,
      dataDir: rootPath,
      logDir: rootPath,
      worktreeRoot: rootPath,
      staticDir: rootPath,
      serveStatic: false,
      mockDelayMs: 1,
    });
    const task = { cwd: rootPath, worktreePath: undefined } as Pick<Task, "cwd" | "worktreePath">;
    expect(() => service.assertAllowedCwd(project(rootPath), task, path.join(os.tmpdir(), "outside"))).toThrow(/allowlist/);
    fs.rmSync(rootPath, { recursive: true, force: true });
  });

  it("uses project root for non-git auto workspaces", async () => {
    const rootPath = fs.mkdtempSync(path.join(os.tmpdir(), "agentdock-project-"));
    const service = new WorkspaceService({
      host: "127.0.0.1",
      port: 3876,
      dataDir: rootPath,
      logDir: rootPath,
      worktreeRoot: rootPath,
      staticDir: rootPath,
      serveStatic: false,
      mockDelayMs: 1,
    });
    await expect(service.resolveTaskWorkspace(project(rootPath), "Task", "task-1", "auto")).resolves.toMatchObject({
      cwd: rootPath,
      workspace: "project root",
    });
    fs.rmSync(rootPath, { recursive: true, force: true });
  });
});
