import { FileCode2, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, Task } from "@/types";
import { AgentBadge } from "./AgentBadge";
import { StatusChip } from "./StatusChip";

interface Props {
  task: Task;
  project?: Project;
  onClick?: () => void;
  highlight?: boolean;
  compact?: boolean;
}

export function TaskCard({ task, project, onClick, highlight, compact }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-md border bg-surface text-left transition-all hover:border-border hover:bg-surface-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "border-border/70",
        highlight && "border-status-approval/50 shadow-[inset_2px_0_0_hsl(var(--status-approval))]",
        compact ? "px-3 py-2" : "px-3 py-2.5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            {project && (
              <span className="inline-flex items-center gap-1">
                <FolderGit2 className="h-3 w-3" />
                {project.name}
              </span>
            )}
            <span className="text-border">/</span>
            <AgentBadge agent={task.agent} />
            <span className="text-border">·</span>
            <span className="truncate">{task.worktree}</span>
          </div>
          <h3 className="mt-1 truncate text-[13px] font-medium text-foreground">{task.title}</h3>
          <p className="mt-0.5 line-clamp-1 font-mono text-[11px] text-muted-foreground">
            <span className="ansi-prompt">❯</span> {task.currentActivity}
          </p>
        </div>
        <StatusChip status={task.status} size="xs" />
      </div>
      <div className="mt-1.5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span className="tabular-nums">
          {task.elapsedMinutes < 60 ? `${task.elapsedMinutes}m` : `${Math.round(task.elapsedMinutes / 60)}h`}
        </span>
        {task.changedFiles.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <FileCode2 className="h-3 w-3" />
            {task.changedFiles.length}f
            <span className="text-diff-add-fg">+{task.changedFiles.reduce((s, f) => s + f.additions, 0)}</span>
            <span className="text-diff-del-fg">−{task.changedFiles.reduce((s, f) => s + f.deletions, 0)}</span>
          </span>
        )}
        <span className="ml-auto text-muted-foreground/70">{task.updatedLabel}</span>
      </div>
    </button>
  );
}