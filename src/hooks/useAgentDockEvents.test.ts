import { describe, expect, it } from "vitest";
import { mergeTaskEvent } from "./useAgentDockEvents";
import type { Task } from "@/types";

const baseTask: Task = {
  id: "task-1",
  projectId: "project-1",
  title: "Test task",
  initialPrompt: "Prompt",
  agent: "mock",
  status: "running",
  currentActivity: "Running",
  cwd: "/tmp/project",
  workspace: "project root",
  workspaceMode: "project_root",
  worktree: "-",
  approvalMode: "normal",
  changedFilesCount: 0,
  changedFiles: [],
  unread: false,
  elapsedMinutes: 0,
  updatedLabel: "just now",
  events: [],
  createdAt: "2026-04-22T00:00:00.000Z",
  updatedAt: "2026-04-22T00:00:00.000Z",
};

describe("mergeTaskEvent", () => {
  it("appends new events and updates status", () => {
    const result = mergeTaskEvent([baseTask], {
      id: "event-1",
      taskId: "task-1",
      projectId: "project-1",
      seq: 1,
      type: "approval_requested",
      timestamp: "just now",
      content: "Approval required",
    });
    expect(result[0].status).toBe("waiting_approval");
    expect(result[0].events).toHaveLength(1);
  });

  it("ignores duplicate event ids", () => {
    const once = mergeTaskEvent([baseTask], {
      id: "event-1",
      taskId: "task-1",
      projectId: "project-1",
      seq: 1,
      type: "assistant_message",
      timestamp: "just now",
      content: "Hello",
    });
    const twice = mergeTaskEvent(once, {
      id: "event-1",
      taskId: "task-1",
      projectId: "project-1",
      seq: 1,
      type: "assistant_message",
      timestamp: "just now",
      content: "Hello",
    });
    expect(twice[0].events).toHaveLength(1);
  });
});
