import { nanoid } from "nanoid";
import type { AgentType, Task, TaskStatus } from "../../shared/types";
import type { TaskEvent } from "../../shared/events";
import { nowIso } from "../db/client";
import type { Repositories } from "../db/repositories";
import type { WorkspaceService } from "../workspace/WorkspaceService";
import type { ProjectService } from "./ProjectService";
import type { ApprovalService } from "./ApprovalService";
import type { EventBus } from "./EventBus";
import type { AgentAdapter } from "../agents/AgentAdapter";

export class TaskOrchestrator {
  private readonly cancelled = new Set<string>();

  constructor(
    private readonly repos: Repositories,
    private readonly projects: ProjectService,
    private readonly workspace: WorkspaceService,
    private readonly approvals: ApprovalService,
    private readonly events: EventBus,
    private readonly adapters: Record<AgentType, AgentAdapter>,
  ) {}

  list(projectId?: string, includeEvents = true) {
    return this.repos.tasks.list(projectId).map((task) => this.withEvents(task, includeEvents));
  }

  get(taskId: string, includeEvents = true) {
    const task = this.repos.tasks.get(taskId);
    return task ? this.withEvents(task, includeEvents) : null;
  }

  async createTask(projectId: string, input: { title: string; prompt: string; agent: AgentType; workspaceMode: Task["workspaceMode"]; approvalMode: Task["approvalMode"]; skill?: string }) {
    const project = this.projects.requireTrusted(projectId);
    const id = nanoid();
    const resolved = await this.workspace.resolveTaskWorkspace(project, input.title, id, input.workspaceMode);
    const now = nowIso();
    const task: Task = {
      id,
      projectId,
      title: input.title,
      initialPrompt: input.prompt,
      agent: input.agent,
      status: "queued",
      currentActivity: "Queued",
      cwd: resolved.cwd,
      workspaceMode: input.workspaceMode,
      workspace: resolved.workspace,
      worktree: resolved.worktree,
      worktreePath: resolved.worktreePath,
      worktreeName: resolved.worktreeName,
      approvalMode: input.approvalMode,
      changedFilesCount: 0,
      changedFiles: [],
      unread: true,
      elapsedMinutes: 0,
      updatedLabel: "just now",
      events: [],
      createdAt: now,
      updatedAt: now,
    };
    const saved = this.repos.tasks.create(task);
    this.appendEvent(saved, { type: "task_created", content: `Task created for ${input.agent}.` });
    this.appendEvent(saved, { type: "user_prompt", content: input.prompt });
    void this.start(saved.id, input.skill);
    return this.get(saved.id)!;
  }

  async followUp(taskId: string, message: string) {
    const task = this.requireTask(taskId);
    const adapter = this.adapters[task.agent];
    const context = this.createContext(task);
    void adapter.followUp({ taskId, message }, context).catch((error: unknown) => {
      this.failTask(taskId, error instanceof Error ? error.message : String(error));
    });
    return this.get(taskId)!;
  }

  async cancel(taskId: string) {
    const task = this.requireTask(taskId);
    this.cancelled.add(taskId);
    await this.adapters[task.agent].cancel(taskId);
    const updated = this.updateStatus(taskId, "cancelled", "Cancelled by user");
    this.appendEvent(updated, { type: "task_cancelled", content: "Task cancelled by user." });
    return this.get(taskId)!;
  }

  archive(taskId: string) {
    const updated = this.updateStatus(taskId, "archived", "Archived");
    this.appendEvent(updated, { type: "system", content: "Task archived." });
    return this.get(taskId)!;
  }

  updateTaskNote(taskId: string, note: string) {
    return this.repos.tasks.update(taskId, { note, updatedAt: nowIso() });
  }

  private async start(taskId: string, skill?: string) {
    const task = this.requireTask(taskId);
    const adapter = this.adapters[task.agent];
    const started = this.updateStatus(task.id, "running", "Starting agent...");
    this.repos.tasks.update(task.id, { startedAt: nowIso() });
    try {
      await adapter.startTask(
        {
          taskId: started.id,
          projectId: started.projectId,
          cwd: started.cwd,
          prompt: started.initialPrompt,
          approvalMode: started.approvalMode,
          skill,
        },
        this.createContext(started),
      );
      const current = this.requireTask(taskId);
      if (current.status === "completed") {
        const changes = await this.workspace.captureChanges(current);
        if (changes.length > 0) {
          const updated = this.repos.tasks.update(taskId, {
            changedFiles: changes,
            changedFilesCount: changes.length,
            updatedAt: nowIso(),
          })!;
          this.appendEvent(updated, { type: "diff_updated", content: `${changes.length} changed file(s) captured.`, files: changes });
        }
      }
    } catch (error) {
      this.failTask(taskId, error instanceof Error ? error.message : String(error));
    }
  }

  private createContext(task: Task) {
    return {
      appendEvent: (event: Omit<TaskEvent, "id" | "taskId" | "projectId" | "timestamp" | "createdAt"> & Partial<TaskEvent>) =>
        this.appendEvent(this.requireTask(task.id), event),
      updateStatus: (status: TaskStatus, activity: string) => {
        this.updateStatus(task.id, status, activity);
      },
      requestApproval: async (input: {
        toolName: string;
        command?: string;
        description?: string;
        reason?: string;
        riskLevel: "low" | "medium" | "high" | "unknown";
      }) => {
        const waiting = this.updateStatus(task.id, "waiting_approval", input.description ?? "Waiting for approval");
        const decision = await this.approvals.request({
          ...input,
          taskId: waiting.id,
          projectId: waiting.projectId,
          provider: waiting.agent,
          cwd: waiting.cwd,
        });
        return decision;
      },
      isCancelled: () => this.cancelled.has(task.id),
    };
  }

  private appendEvent(task: Task, event: Omit<TaskEvent, "id" | "taskId" | "projectId" | "timestamp" | "createdAt"> & Partial<TaskEvent>) {
    const createdAt = nowIso();
    const saved = this.events.append({
      ...event,
      id: event.id ?? nanoid(),
      taskId: task.id,
      projectId: task.projectId,
      timestamp: event.timestamp ?? "just now",
      createdAt,
    });
    if (event.files?.length) {
      this.repos.tasks.update(task.id, {
        changedFiles: event.files,
        changedFilesCount: event.files.length,
        updatedAt: createdAt,
      });
    } else {
      this.repos.tasks.update(task.id, { updatedAt: createdAt });
    }
    return saved;
  }

  private updateStatus(taskId: string, status: TaskStatus, activity: string) {
    const completedAt = ["completed", "failed", "cancelled", "interrupted"].includes(status) ? nowIso() : undefined;
    const task = this.repos.tasks.update(taskId, {
      status,
      currentActivity: activity,
      completedAt,
      updatedAt: nowIso(),
    });
    if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404, code: "task_not_found" });
    return task;
  }

  private failTask(taskId: string, message: string) {
    const task = this.updateStatus(taskId, "failed", message);
    this.appendEvent(task, { type: "task_failed", content: message });
  }

  private requireTask(taskId: string) {
    const task = this.repos.tasks.get(taskId);
    if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404, code: "task_not_found" });
    return task;
  }

  private withEvents(task: Task, includeEvents: boolean) {
    return includeEvents ? { ...task, events: this.repos.events.list(task.id) } : task;
  }
}
