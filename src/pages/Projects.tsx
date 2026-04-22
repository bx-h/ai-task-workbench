import { Link } from "react-router-dom";
import { FolderGit2, GitBranch, Plus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/agentdock/AppShell";
import { Button } from "@/components/ui/button";
import { NewTaskDialog } from "@/components/agentdock/NewTaskDialog";
import { NewProjectDialog } from "@/components/agentdock/NewProjectDialog";
import { useAgentDock } from "@/store/useAgentDock";

export default function Projects() {
  const { projects, tasks } = useAgentDock();
  const [open, setOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  return (
    <AppShell showActivity={false}>
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
            <span className="ansi-prompt">❯</span>
            <span className="text-foreground">agentdock</span>
            <span>projects</span>
            <span className="text-muted-foreground/60">--list</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setProjectOpen(true)} size="sm" variant="outline" className="h-8">
              <Plus className="mr-1 h-3.5 w-3.5" /> New Project
            </Button>
            <Button onClick={() => setOpen(true)} size="sm" className="h-8">
              <Plus className="mr-1 h-3.5 w-3.5" /> New Task
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <div className="grid grid-cols-12 gap-2 border-b border-border bg-surface-elevated px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="col-span-5">project</div>
            <div className="col-span-3">branch</div>
            <div className="col-span-1 text-right">run</div>
            <div className="col-span-1 text-right">wait</div>
            <div className="col-span-2 text-right">done</div>
          </div>
          <ul className="divide-y divide-border">
            {projects.map((p) => {
              const pt = tasks.filter((t) => t.projectId === p.id);
              const running = pt.filter((t) => t.status === "running").length;
              const waiting = pt.filter((t) => t.status === "waiting_approval" || t.status === "waiting_input" || t.status === "blocked").length;
              const done = pt.filter((t) => t.status === "completed").length;
              return (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="grid grid-cols-12 items-center gap-2 px-3 py-2.5 transition-colors hover:bg-surface-elevated"
                  >
                    <div className="col-span-5 min-w-0">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                      <div className="mt-0.5 truncate pl-5 font-mono text-[10px] text-muted-foreground">{p.path}</div>
                      {!p.trusted && <div className="mt-1 pl-5 font-mono text-[10px] text-status-approval">trust required</div>}
                    </div>
                    <div className="col-span-3 flex items-center gap-1 truncate font-mono text-[11px] text-muted-foreground">
                      <GitBranch className="h-3 w-3" /> {p.branch}
                    </div>
                    <div className="col-span-1 text-right font-mono text-xs tabular-nums text-status-running">{running || "·"}</div>
                    <div className="col-span-1 text-right font-mono text-xs tabular-nums text-status-approval">{waiting || "·"}</div>
                    <div className="col-span-2 text-right font-mono text-xs tabular-nums text-status-completed">{done || "·"}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <NewTaskDialog open={open} onOpenChange={setOpen} />
      <NewProjectDialog open={projectOpen} onOpenChange={setProjectOpen} />
    </AppShell>
  );
}
