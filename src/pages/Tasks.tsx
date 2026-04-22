import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/agentdock/AppShell";
import { TaskCard } from "@/components/agentdock/TaskCard";
import { useAgentDock } from "@/store/useAgentDock";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

const FILTERS: { id: "all" | TaskStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "running", label: "Running" },
  { id: "waiting_approval", label: "Waiting" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export default function Tasks() {
  const { tasks, projects } = useAgentDock();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? tasks
        : tasks.filter((t) =>
            filter === "waiting_approval"
              ? t.status.startsWith("waiting") || t.status === "blocked"
              : t.status === filter,
          ),
    [tasks, filter],
  );

  return (
    <AppShell showActivity={false}>
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
            <span className="ansi-prompt">❯</span>
            <span className="text-foreground">agentdock</span>
            <span>tasks</span>
            <span className="text-muted-foreground/60">--filter={filter}</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">{visible.length} tasks</span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-7 rounded-md px-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                filter === f.id
                  ? "bg-surface-elevated text-foreground ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No tasks match this filter.
          </div>
        ) : (
          <div className="grid gap-1.5">
            {visible.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                project={projects.find((p) => p.id === t.projectId)}
                onClick={() => navigate(`/tasks/${t.id}`)}
                highlight={t.status === "waiting_approval"}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}