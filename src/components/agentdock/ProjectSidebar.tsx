import { FolderGit2, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAgentDock } from "@/store/useAgentDock";
import { useState } from "react";
import { NewProjectDialog } from "./NewProjectDialog";

export function ProjectSidebar() {
  const { projects, tasks, setCurrentProjectId } = useAgentDock();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <aside className="hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex items-center justify-between px-3 py-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Projects</span>
        <span className="font-mono text-[10px] text-muted-foreground">{projects.length}</span>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2">
        {projects.map((p) => {
          const projectTasks = tasks.filter((t) => t.projectId === p.id);
          const running = projectTasks.filter((t) => t.status === "running").length;
          const waiting = projectTasks.filter((t) => t.status === "waiting_approval" || t.status === "waiting_input").length;
          const completed = projectTasks.filter((t) => t.status === "completed").length;
          const isActive = location.pathname === `/projects/${p.id}`;

          return (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              onClick={() => setCurrentProjectId(p.id)}
              className={cn(
                "group mb-0.5 block rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate font-medium">{p.name}</span>
              </div>
              <div className="mt-0.5 truncate pl-5 font-mono text-[10px] text-muted-foreground">{p.path}</div>
              <div className="mt-1.5 flex items-center gap-2 pl-5 font-mono text-[10px]">
                {running > 0 && (
                  <span className="inline-flex items-center gap-1 text-status-running">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-running animate-pulse-dot" />
                    {running}
                  </span>
                )}
                {waiting > 0 && (
                  <span className="inline-flex items-center gap-1 text-status-approval">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-approval" />
                    {waiting}
                  </span>
                )}
                {completed > 0 && (
                  <span className="inline-flex items-center gap-1 text-status-completed">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-completed" />
                    {completed}
                  </span>
                )}
                {running + waiting + completed === 0 && <span className="text-muted-foreground/60">idle</span>}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-md border border-dashed border-border px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </button>
      </div>
      <NewProjectDialog open={open} onOpenChange={setOpen} />
    </aside>
  );
}
