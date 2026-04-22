import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialActivity, initialProjects, initialTasks } from "@/data/mockData";
import type { ActivityItem, Project, Task, TaskEvent, TaskStatus } from "@/types";

interface AgentDockState {
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  approveTask: (taskId: string) => void;
  denyTask: (taskId: string) => void;
  addTask: (input: { projectId: string; title: string; agent: Task["agent"]; prompt: string; workspace: Task["workspace"]; worktree: string; approvalMode: Task["approvalMode"] }) => Task;
  updateTaskNote: (taskId: string, note: string) => void;
  addQuickNote: (projectName: string, note: string) => void;
}

const AgentDockCtx = createContext<AgentDockState | null>(null);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function AgentDockProvider({ children }: { children: ReactNode }) {
  const [projects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const pushActivity = useCallback((item: ActivityItem) => {
    setActivity((prev) => [item, ...prev].slice(0, 30));
  }, []);

  const mutateTask = useCallback((taskId: string, fn: (t: Task) => Task) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? fn(t) : t)));
  }, []);

  const approveTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const newEvent: TaskEvent = {
        id: uid("e"),
        type: "approval_granted",
        timestamp: "just now",
        content: "Approval granted. Continuing task…",
      };
      mutateTask(taskId, (t) => ({
        ...t,
        status: "running" as TaskStatus,
        currentActivity: "Running npm test…",
        updatedLabel: "just now",
        events: [...t.events, newEvent],
      }));
      const project = projects.find((p) => p.id === task.projectId);
      pushActivity({
        id: uid("a"),
        text: `Approval granted for "${task.title}"`,
        projectName: project?.name ?? "",
        timestamp: "just now",
        kind: "running",
      });
    },
    [tasks, projects, mutateTask, pushActivity],
  );

  const denyTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const newEvent: TaskEvent = {
        id: uid("e"),
        type: "approval_denied",
        timestamp: "just now",
        content: "Approval denied. Task is now blocked.",
      };
      mutateTask(taskId, (t) => ({
        ...t,
        status: "blocked" as TaskStatus,
        currentActivity: "Blocked: approval denied",
        updatedLabel: "just now",
        events: [...t.events, newEvent],
      }));
      const project = projects.find((p) => p.id === task.projectId);
      pushActivity({
        id: uid("a"),
        text: `Approval denied for "${task.title}"`,
        projectName: project?.name ?? "",
        timestamp: "just now",
        kind: "failed",
      });
    },
    [tasks, projects, mutateTask, pushActivity],
  );

  const addTask: AgentDockState["addTask"] = useCallback(
    ({ projectId, title, agent, prompt, workspace, worktree, approvalMode }) => {
      const newTask: Task = {
        id: uid("t"),
        projectId,
        title,
        agent,
        status: "running",
        currentActivity: "Initializing task…",
        workspace,
        worktree,
        approvalMode,
        elapsedMinutes: 0,
        updatedLabel: "just now",
        changedFiles: [],
        events: [
          { id: uid("e"), type: "user_prompt", timestamp: "just now", content: prompt },
          { id: uid("e"), type: "system", timestamp: "just now", content: `Task created. Agent ${agent} starting in ${workspace}.` },
        ],
        note: "",
      };
      setTasks((prev) => [newTask, ...prev]);
      const project = projects.find((p) => p.id === projectId);
      pushActivity({
        id: uid("a"),
        text: `${agent === "claude" ? "Claude" : "Codex"} started "${title}"`,
        projectName: project?.name ?? "",
        timestamp: "just now",
        kind: "running",
      });
      return newTask;
    },
    [projects, pushActivity],
  );

  const updateTaskNote = useCallback(
    (taskId: string, note: string) => mutateTask(taskId, (t) => ({ ...t, note })),
    [mutateTask],
  );

  const addQuickNote = useCallback(
    (projectName: string, note: string) => {
      pushActivity({
        id: uid("a"),
        text: `Quick note saved: "${note.slice(0, 60)}${note.length > 60 ? "…" : ""}"`,
        projectName,
        timestamp: "just now",
        kind: "note",
      });
    },
    [pushActivity],
  );

  const value = useMemo<AgentDockState>(
    () => ({
      projects,
      tasks,
      activity,
      currentProjectId,
      setCurrentProjectId,
      approveTask,
      denyTask,
      addTask,
      updateTaskNote,
      addQuickNote,
    }),
    [projects, tasks, activity, currentProjectId, approveTask, denyTask, addTask, updateTaskNote, addQuickNote],
  );

  return <AgentDockCtx.Provider value={value}>{children}</AgentDockCtx.Provider>;
}

export function useAgentDock() {
  const ctx = useContext(AgentDockCtx);
  if (!ctx) throw new Error("useAgentDock must be used inside AgentDockProvider");
  return ctx;
}