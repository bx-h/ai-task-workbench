import type { ActivityItem, AgentType, ApprovalMode, Project, QuickNote, Task, WorkspaceMode } from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = response.headers.get("content-type")?.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new ApiError(body?.message ?? body?.error ?? response.statusText, response.status, body?.error);
  }
  return body as T;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  agent: AgentType;
  prompt: string;
  workspaceMode: WorkspaceMode;
  approvalMode: ApprovalMode;
  skill?: string;
}

export const api = {
  async health() {
    return request<{ ok: boolean; name: string; version: string }>("/api/health");
  },
  async listProjects() {
    const data = await request<{ projects: Project[] }>("/api/projects");
    return data.projects;
  },
  async openProject(input: { path: string; trust?: boolean }) {
    const data = await request<{ project: Project }>("/api/projects/open", { method: "POST", body: JSON.stringify(input) });
    return data.project;
  },
  async createProject(input: { path: string; name?: string; trust?: boolean }) {
    const data = await request<{ project: Project }>("/api/projects/create", { method: "POST", body: JSON.stringify(input) });
    return data.project;
  },
  async updateProject(projectId: string, input: Partial<Pick<Project, "name" | "defaultAgent" | "trusted">>) {
    const data = await request<{ project: Project }>(`/api/projects/${projectId}`, { method: "PATCH", body: JSON.stringify(input) });
    return data.project;
  },
  async listTasks() {
    const data = await request<{ tasks: Task[] }>("/api/tasks");
    return data.tasks;
  },
  async getTask(taskId: string) {
    const data = await request<{ task: Task }>(`/api/tasks/${taskId}`);
    return data.task;
  },
  async createTask(input: CreateTaskInput) {
    const data = await request<{ task: Task }>(`/api/projects/${input.projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        agent: input.agent,
        prompt: input.prompt,
        workspaceMode: input.workspaceMode,
        approvalMode: input.approvalMode,
        skill: input.skill,
      }),
    });
    return data.task;
  },
  async approve(approvalId: string) {
    return request(`/api/approvals/${approvalId}/approve`, { method: "POST", body: JSON.stringify({ scope: "once" }) });
  },
  async deny(approvalId: string, message?: string) {
    return request(`/api/approvals/${approvalId}/deny`, { method: "POST", body: JSON.stringify({ message }) });
  },
  async followUp(taskId: string, message: string) {
    const data = await request<{ task: Task }>(`/api/tasks/${taskId}/follow-up`, { method: "POST", body: JSON.stringify({ message }) });
    return data.task;
  },
  async cancelTask(taskId: string) {
    const data = await request<{ task: Task }>(`/api/tasks/${taskId}/cancel`, { method: "POST" });
    return data.task;
  },
  async archiveTask(taskId: string) {
    const data = await request<{ task: Task }>(`/api/tasks/${taskId}/archive`, { method: "POST" });
    return data.task;
  },
  async listActivity() {
    const data = await request<{ activity: ActivityItem[] }>("/api/activity");
    return data.activity;
  },
  async listNotes() {
    const data = await request<{ notes: QuickNote[] }>("/api/notes");
    return data.notes;
  },
  async createNote(input: { projectId: string; taskId?: string; content: string }) {
    const data = await request<{ note: QuickNote }>(`/api/projects/${input.projectId}/notes`, {
      method: "POST",
      body: JSON.stringify({ taskId: input.taskId, content: input.content }),
    });
    return data.note;
  },
};

export { ApiError };
