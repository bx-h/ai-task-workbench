import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GitBranch, Plus, Settings2 } from "lucide-react";
import { AppShell } from "@/components/agentdock/AppShell";
import { TaskCard } from "@/components/agentdock/TaskCard";
import { AgentBadge } from "@/components/agentdock/AgentBadge";
import { NewTaskDialog } from "@/components/agentdock/NewTaskDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks } = useAgentDock();
  const project = projects.find((p) => p.id === id);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [open, setOpen] = useState(false);

  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === id), [tasks, id]);
  const visible = useMemo(
    () =>
      filter === "all"
        ? projectTasks
        : projectTasks.filter((t) => (filter === "waiting_approval" ? t.status.startsWith("waiting") || t.status === "blocked" : t.status === filter)),
    [projectTasks, filter],
  );

  if (!project) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Project not found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="border-b border-border bg-surface/60">
        <div className="px-4 py-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span>{project.path}</span>
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">{project.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-mono">
                  <GitBranch className="h-3 w-3" /> {project.branch}
                </span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1.5">
                  default agent <AgentBadge agent={project.defaultAgent} />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Settings
              </Button>
              <Button onClick={() => setOpen(true)} className="h-9">
                <Plus className="mr-1.5 h-4 w-4" /> New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 md:px-6">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="bg-surface-elevated">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4">
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
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">{visible.length} tasks</span>
            </div>
            {visible.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No tasks match this filter.
              </div>
            ) : (
              <div className="grid gap-2">
                {visible.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    project={project}
                    onClick={() => navigate(`/tasks/${t.id}`)}
                    highlight={t.status === "waiting_approval"}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 text-sm text-muted-foreground">
            <div className="rounded-md border border-dashed border-border p-8 text-center">
              No notes yet for this project.
            </div>
          </TabsContent>
          <TabsContent value="activity" className="mt-4 text-sm text-muted-foreground">
            <div className="rounded-md border border-dashed border-border p-8 text-center">
              Project-scoped activity feed coming soon.
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-4 text-sm text-muted-foreground">
            <div className="rounded-md border border-dashed border-border p-8 text-center">
              Project settings, agents and approval defaults.
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <NewTaskDialog open={open} onOpenChange={setOpen} defaultProjectId={project.id} />
    </AppShell>
  );
}