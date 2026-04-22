import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, CheckCircle2, Plus, Zap } from "lucide-react";
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
      <div className="px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">Workbench</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Local-first overview of every agent across {projects.length} projects.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="h-9">
            <Plus className="mr-1.5 h-4 w-4" /> New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Running" value={groups.running.length} icon={Zap} color="text-status-running" bg="bg-status-running-bg" />
          <StatCard
            label="Waiting for You"
            value={groups.waiting.length}
            icon={AlertTriangle}
            color="text-status-approval"
            bg="bg-status-approval-bg"
          />
          <StatCard
            label="Completed Today"
            value={groups.completed.length}
            icon={CheckCircle2}
            color="text-status-completed"
            bg="bg-status-completed-bg"
          />
        </div>

        <div className="mt-6 space-y-6">
          <Section title="Waiting for You" count={groups.waiting.length} accent="text-status-approval">
            {groups.waiting.length === 0 ? (
              <Empty text="No approvals pending. Inbox zero." />
            ) : (
              <div className="grid gap-2">
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
              <div className="grid gap-2">
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
              <div className="grid gap-2">
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold leading-none">{value}</div>
      </div>
    </div>
  );
}

function Section({ title, count, accent, children }: { title: string; count: number; accent: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className={`font-mono text-[11px] ${accent}`}>{count}</span>
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