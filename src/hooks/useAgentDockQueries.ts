import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const queryKeys = {
  projects: ["agentdock", "projects"] as const,
  tasks: ["agentdock", "tasks"] as const,
  activity: ["agentdock", "activity"] as const,
  notes: ["agentdock", "notes"] as const,
};

export function useAgentDockQueries() {
  const projects = useQuery({ queryKey: queryKeys.projects, queryFn: api.listProjects, retry: false });
  const tasks = useQuery({ queryKey: queryKeys.tasks, queryFn: api.listTasks, retry: false });
  const activity = useQuery({ queryKey: queryKeys.activity, queryFn: api.listActivity, retry: false });
  const notes = useQuery({ queryKey: queryKeys.notes, queryFn: api.listNotes, retry: false });

  return { projects, tasks, activity, notes };
}
