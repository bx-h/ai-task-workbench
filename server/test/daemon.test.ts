import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";

const cleanup: string[] = [];

afterEach(() => {
  for (const dir of cleanup.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function tempDir(prefix: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  cleanup.push(dir);
  return dir;
}

describe("agentdock daemon", () => {
  it("initializes sqlite state and persists projects across app instances", async () => {
    const dataDir = tempDir("agentdock-data-");
    const projectDir = tempDir("agentdock-project-");
    const first = await buildApp({ dataDir, mockDelayMs: 1 });

    const opened = await first.app.inject({
      method: "POST",
      url: "/api/projects/open",
      payload: { path: projectDir, trust: true },
    });
    expect(opened.statusCode).toBe(200);
    expect(JSON.parse(opened.body).project.trusted).toBe(true);
    await first.app.close();

    const second = await buildApp({ dataDir, mockDelayMs: 1 });
    const listed = await second.app.inject({ method: "GET", url: "/api/projects" });
    expect(JSON.parse(listed.body).projects).toHaveLength(1);
    await second.app.close();
  });

  it("rejects invalid project paths without writing records", async () => {
    const dataDir = tempDir("agentdock-data-");
    const built = await buildApp({ dataDir, mockDelayMs: 1 });
    const response = await built.app.inject({
      method: "POST",
      url: "/api/projects/open",
      payload: { path: path.join(dataDir, "missing"), trust: true },
    });
    expect(response.statusCode).toBe(400);
    const listed = await built.app.inject({ method: "GET", url: "/api/projects" });
    expect(JSON.parse(listed.body).projects).toHaveLength(0);
    await built.app.close();
  });

  it("enforces trust before task creation", async () => {
    const dataDir = tempDir("agentdock-data-");
    const projectDir = tempDir("agentdock-project-");
    const built = await buildApp({ dataDir, mockDelayMs: 1 });
    const opened = await built.app.inject({
      method: "POST",
      url: "/api/projects/open",
      payload: { path: projectDir, trust: false },
    });
    const projectId = JSON.parse(opened.body).project.id;
    const created = await built.app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/tasks`,
      payload: { title: "Blocked", prompt: "Should not run", agent: "mock", workspaceMode: "project_root" },
    });
    expect(created.statusCode).toBe(403);
    await built.app.close();
  });
});
