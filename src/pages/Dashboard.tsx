import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/agentdock/AppShell";
import { TaskCard } from "@/components/agentdock/TaskCard";
import { NewTaskDialog } from "@/components/agentdock/NewTaskDialog";
import { Button } from "@/components/ui/button";
import { useAgentDock } from "@/store/useAgentDock";
import type { Task, TaskStatus } from "@/types";

export default function Dashboard() {
  const { projects, tasks } = useAgentDock();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const byStatus = (statuses: TaskStatus[]) => tasks.filter((t) => statuses.includes(t.status));
    return {
      waiting: byStatus(["waiting_approval", "waiting_input", "blocked"]),
      running: byStatus(["running"]),
      completed: byStatus(["completed"]),
    };
  }, [tasks]);

  const projectFor = (t: Task) => projects.find((p) => p.id === t.projectId);

  return (
    <AppShell>
      <div className="px-4 py-4 md:px-6 md:py-5">
        {/* Command-bar style header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
            <span className="ansi-prompt">❯</span>
            <span className="text-foreground">agentdock</span>
            <span>status</span>
            <span className="text-muted-foreground/60">--all</span>
          </div>
          <Button onClick={() => setOpen(true)} size="sm" className="h-8">
            <Plus className="mr-1 h-3.5 w-3.5" /> New Task
          </Button>
        </div>

        {/* Dense status strip */}
        <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-md border border-border bg-surface">
          <StatCell label="running" value={groups.running.length} color="text-status-running" />
          <StatCell label="waiting" value={groups.waiting.length} color="text-status-approval" pulse />
          <StatCell label="done · today" value={groups.completed.length} color="text-status-completed" />
        </div>

        <div className="mt-5 space-y-5">
          <Section title="Waiting for You" count={groups.waiting.length} accent="text-status-approval">
            {groups.waiting.length === 0 ? (
              <Empty text="No approvals pending. Inbox zero." />
            ) : (
              <div className="grid gap-1.5">
                {groups.waiting.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    project={projectFor(t)}
                    onClick={() => navigate(`/tasks/${t.id}`)}
                    highlight={t.status === "waiting_approval"}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Running Tasks" count={groups.running.length} accent="text-status-running">
            {groups.running.length === 0 ? (
              <Empty text="Nothing running." />
            ) : (
              <div className="grid gap-1.5">
                {groups.running.map((t) => (
                  <TaskCard key={t.id} task={t} project={projectFor(t)} onClick={() => navigate(`/tasks/${t.id}`)} />
                ))}
              </div>
            )}
          </Section>

          <Section title="Recently Completed" count={groups.completed.length} accent="text-status-completed">
            {groups.completed.length === 0 ? (
              <Empty text="No completed tasks yet." />
            ) : (
              <div className="grid gap-1.5">
                {groups.completed.map((t) => (
                  <TaskCard key={t.id} task={t} project={projectFor(t)} onClick={() => navigate(`/tasks/${t.id}`)} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
      <NewTaskDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function StatCell({ label, value, color, pulse }: { label: string; value: number; color: string; pulse?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", color.replace("text-", "bg-"), pulse && value > 0 && "animate-pulse-dot")} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <span className={cn("font-mono text-xl font-semibold tabular-nums leading-none", color)}>
        {String(value).padStart(2, "0")}
      </span>
    </div>
  );
}

function Section({ title, count, accent, children }: { title: string; count: number; accent: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-2">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{title}</h2>
        <span className={`font-mono text-[11px] tabular-nums ${accent}`}>[{count}]</span>
        <div className="h-px flex-1 bg-border/60" />
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">{text}</div>
  );
}