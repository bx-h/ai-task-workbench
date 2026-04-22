import { Clock, FileCode2, FolderGit2 } from "lucide-react";
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
        "group relative w-full rounded-lg border bg-surface text-left transition-all hover:border-border hover:bg-surface-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "border-border/70 shadow-sm",
        highlight && "border-status-approval/50 shadow-[0_0_0_1px_hsl(var(--status-approval)/0.25)]",
        compact ? "p-3" : "p-4",
      )}
    >
      {highlight && (
        <span className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-[2px] rounded-r bg-status-approval" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {project && (
              <span className="inline-flex items-center gap-1 font-mono">
                <FolderGit2 className="h-3 w-3" />
                {project.name}
              </span>
            )}
            <span className="text-border">/</span>
            <AgentBadge agent={task.agent} />
          </div>
          <h3 className="mt-1.5 truncate text-sm font-medium text-foreground">{task.title}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            <span className="font-mono">›</span> {task.currentActivity}
          </p>
        </div>
        <StatusChip status={task.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {task.elapsedMinutes < 60 ? `${task.elapsedMinutes}m elapsed` : `${Math.round(task.elapsedMinutes / 60)}h elapsed`}
        </span>
        {task.changedFiles.length > 0 && (
          <span className="inline-flex items-center gap-1 font-mono">
            <FileCode2 className="h-3 w-3" />
            {task.changedFiles.length} {task.changedFiles.length === 1 ? "file" : "files"}
          </span>
        )}
        <span className="text-muted-foreground/70">{task.updatedLabel}</span>
      </div>
    </button>
  );
}