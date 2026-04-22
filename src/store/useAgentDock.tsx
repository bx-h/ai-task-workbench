import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateTaskInput } from "@/lib/api";
import { useAgentDockEvents } from "@/hooks/useAgentDockEvents";
import { queryKeys, useAgentDockQueries } from "@/hooks/useAgentDockQueries";
import type { ActivityItem, Project, Task } from "@/types";

interface AgentDockState {
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
  currentProjectId: string | null;
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;
  setCurrentProjectId: (id: string | null) => void;
  openProject: (input: { path: string; trust?: boolean }) => Promise<Project>;
  createProject: (input: { path: string; name?: string; trust?: boolean }) => Promise<Project>;
  approveTask: (taskId: string) => Promise<void>;
  denyTask: (taskId: string) => Promise<void>;
  addTask: (input: {
    projectId: string;
    title: string;
    agent: Task["agent"];
    prompt: string;
    workspaceMode: Task["workspaceMode"];
    workspace?: string;
    worktree?: string;
    approvalMode: Task["approvalMode"];
    skill?: string;
  }) => Promise<Task>;
  followUpTask: (taskId: string, message: string) => Promise<Task>;
  cancelTask: (taskId: string) => Promise<Task>;
  archiveTask: (taskId: string) => Promise<Task>;
  updateTaskNote: (taskId: string, note: string) => Promise<void>;
  addQuickNote: (projectName: string, note: string) => Promise<void>;
}

const AgentDockCtx = createContext<AgentDockState | null>(null);

export function AgentDockProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const queries = useAgentDockQueries();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useAgentDockEvents();

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
      queryClient.invalidateQueries({ queryKey: queryKeys.activity }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
    ]);
  }, [queryClient]);

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => api.createTask(input),
    onSuccess: async () => refresh(),
  });
  const openProjectMutation = useMutation({ mutationFn: api.openProject, onSuccess: refresh });
  const createProjectMutation = useMutation({ mutationFn: api.createProject, onSuccess: refresh });

  const projects = useMemo(() => queries.projects.data ?? [], [queries.projects.data]);
  const tasks = useMemo(() => queries.tasks.data ?? [], [queries.tasks.data]);
  const activity = useMemo(() => queries.activity.data ?? [], [queries.activity.data]);
  const isOffline = Boolean(queries.projects.error || queries.tasks.error);
  const isLoading = queries.projects.isLoading || queries.tasks.isLoading;
  const error = isOffline ? "AgentDock daemon is offline. Start it with npm run dev:server." : null;

  const approveTask = useCallback(
    async (taskId: string) => {
      const approvalId = latestApprovalId(tasks.find((task) => task.id === taskId));
      if (!approvalId) return;
      await api.approve(approvalId);
      await refresh();
    },
    [tasks, refresh],
  );

  const denyTask = useCallback(
    async (taskId: string) => {
      const approvalId = latestApprovalId(tasks.find((task) => task.id === taskId));
      if (!approvalId) return;
      await api.deny(approvalId, "Denied from AgentDock UI.");
      await refresh();
    },
    [tasks, refresh],
  );

  const addTask: AgentDockState["addTask"] = useCallback(
    async ({ projectId, title, agent, prompt, workspaceMode, approvalMode, skill }) =>
      createTaskMutation.mutateAsync({ projectId, title, agent, prompt, workspaceMode, approvalMode, skill }),
    [createTaskMutation],
  );

  const followUpTask = useCallback(
    async (taskId: string, message: string) => {
      const task = await api.followUp(taskId, message);
      await refresh();
      return task;
    },
    [refresh],
  );

  const cancelTask = useCallback(
    async (taskId: string) => {
      const task = await api.cancelTask(taskId);
      await refresh();
      return task;
    },
    [refresh],
  );

  const archiveTask = useCallback(
    async (taskId: string) => {
      const task = await api.archiveTask(taskId);
      await refresh();
      return task;
    },
    [refresh],
  );

  const updateTaskNote = useCallback(
    async (taskId: string, note: string) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) return;
      await api.createNote({ projectId: task.projectId, taskId, content: note || " " });
      await refresh();
    },
    [tasks, refresh],
  );

  const addQuickNote = useCallback(
    async (projectName: string, note: string) => {
      const project = projects.find((item) => item.name === projectName) ?? projects[0];
      if (!project) return;
      await api.createNote({ projectId: project.id, content: note });
      await refresh();
    },
    [projects, refresh],
  );

  const value = useMemo<AgentDockState>(
    () => ({
      projects,
      tasks,
      activity,
      currentProjectId,
      isLoading,
      isOffline,
      error,
      setCurrentProjectId,
      openProject: (input) => openProjectMutation.mutateAsync(input),
      createProject: (input) => createProjectMutation.mutateAsync(input),
      approveTask,
      denyTask,
      addTask,
      followUpTask,
      cancelTask,
      archiveTask,
      updateTaskNote,
      addQuickNote,
    }),
    [
      projects,
      tasks,
      activity,
      currentProjectId,
      isLoading,
      isOffline,
      error,
      openProjectMutation,
      createProjectMutation,
      approveTask,
      denyTask,
      addTask,
      followUpTask,
      cancelTask,
      archiveTask,
      updateTaskNote,
      addQuickNote,
    ],
  );

  return <AgentDockCtx.Provider value={value}>{children}</AgentDockCtx.Provider>;
}

export function useAgentDock() {
  const ctx = useContext(AgentDockCtx);
  if (!ctx) throw new Error("useAgentDock must be used inside AgentDockProvider");
  return ctx;
}

function latestApprovalId(task?: Task) {
  if (!task) return undefined;
  for (let index = task.events.length - 1; index >= 0; index -= 1) {
    const approvalId = task.events[index]?.approval?.id;
    if (approvalId) return approvalId;
  }
  return undefined;
}
