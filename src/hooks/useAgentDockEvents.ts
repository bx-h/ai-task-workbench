import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectAgentDockSocket } from "@/lib/ws";
import { queryKeys } from "@/hooks/useAgentDockQueries";
import type { Task, TaskEvent } from "@/types";

export function mergeTaskEvent(tasks: Task[] | undefined, event: TaskEvent) {
  if (!tasks || !event.taskId) return tasks ?? [];
  return tasks.map((task) => {
    if (task.id !== event.taskId) return task;
    if (task.events.some((existing) => existing.id === event.id || (event.seq && existing.seq === event.seq))) return task;
    const events = [...task.events, event].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
    const changedFiles = event.files?.length ? event.files : task.changedFiles;
    const status = statusFromEvent(event) ?? task.status;
    return {
      ...task,
      status,
      currentActivity: event.content ?? task.currentActivity,
      changedFiles,
      changedFilesCount: changedFiles.length,
      events,
      updatedLabel: "just now",
    };
  });
}

export function useAgentDockEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return connectAgentDockSocket({
      onMessage(message) {
        if (message.type === "task_event" && message.event) {
          queryClient.setQueryData<Task[]>(queryKeys.tasks, (tasks) => mergeTaskEvent(tasks, message.event!));
          notifyForEvent(message.event);
        }
      },
    });
  }, [queryClient]);
}

function statusFromEvent(event: TaskEvent): Task["status"] | null {
  switch (event.type) {
    case "approval_requested":
      return "waiting_approval";
    case "approval_granted":
      return "running";
    case "approval_denied":
      return "blocked";
    case "task_completed":
      return "completed";
    case "task_failed":
      return "failed";
    case "task_cancelled":
      return "cancelled";
    default:
      return null;
  }
}

function notifyForEvent(event: TaskEvent) {
  if (!["approval_requested", "input_requested", "task_completed", "task_failed"].includes(event.type)) return;
  toast(event.content ?? event.type);
  if (Notification.permission === "granted") {
    const notification = new Notification("AgentDock", { body: event.content ?? event.type });
    notification.onclick = () => {
      if (event.taskId) window.location.assign(`/tasks/${event.taskId}`);
    };
  } else if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}
