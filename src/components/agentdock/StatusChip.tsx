import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  draft: "Draft",
  queued: "Queued",
  running: "Running",
  waiting_approval: "Waiting Approval",
  waiting_input: "Waiting Input",
  completed: "Completed",
  failed: "Failed",
  blocked: "Blocked",
  cancelled: "Cancelled",
  interrupted: "Interrupted",
  idle: "Idle",
  archived: "Archived",
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  draft: "bg-status-idle-bg text-status-idle ring-status-idle/30",
  queued: "bg-status-idle-bg text-status-idle ring-status-idle/30",
  running: "bg-status-running-bg text-status-running ring-status-running/30",
  waiting_approval: "bg-status-approval-bg text-status-approval ring-status-approval/40",
  waiting_input: "bg-status-input-bg text-status-input ring-status-input/40",
  completed: "bg-status-completed-bg text-status-completed ring-status-completed/30",
  failed: "bg-status-failed-bg text-status-failed ring-status-failed/40",
  blocked: "bg-status-failed-bg text-status-failed ring-status-failed/40",
  cancelled: "bg-status-idle-bg text-status-idle ring-status-idle/30",
  interrupted: "bg-status-failed-bg text-status-failed ring-status-failed/40",
  idle: "bg-status-idle-bg text-status-idle ring-status-idle/30",
  archived: "bg-status-idle-bg text-status-idle ring-status-idle/30",
};

const DOT_CLASS: Record<TaskStatus, string> = {
  draft: "bg-status-idle",
  queued: "bg-status-idle",
  running: "bg-status-running animate-pulse-dot",
  waiting_approval: "bg-status-approval",
  waiting_input: "bg-status-input",
  completed: "bg-status-completed",
  failed: "bg-status-failed",
  blocked: "bg-status-failed",
  cancelled: "bg-status-idle",
  interrupted: "bg-status-failed",
  idle: "bg-status-idle",
  archived: "bg-status-idle",
};

export function StatusChip({ status, size = "sm", className }: { status: TaskStatus; size?: "xs" | "sm" | "md"; className?: string }) {
  const sizeCls = size === "xs" ? "text-[10px] px-1.5 py-0.5" : size === "md" ? "text-xs px-2.5 py-1" : "text-[11px] px-2 py-0.5";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide ring-1 ring-inset",
        STATUS_CLASS[status],
        sizeCls,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
