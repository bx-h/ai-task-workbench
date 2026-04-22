import { FileDiff, FilePlus2, FileX2, Sparkles, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskEvent } from "@/types";
import { ApprovalCard } from "./ApprovalCard";
import { TerminalBlock } from "./TerminalBlock";
import { DiffBlock } from "./DiffBlock";

interface Props {
  events: TaskEvent[];
  cwd?: string;
  onApprove: () => void;
  onDeny: () => void;
}

/**
 * Developer-feed style stream: a left timeline rail, dense rows, no chat bubbles.
 * Each event is a typed log entry: USR, ASST, CMD, OUT, DIFF, APP, SYS.
 */
export function ConversationStream({ events, cwd = "~", onApprove, onDeny }: Props) {
  return (
    <ol className="relative">
      <span aria-hidden className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
      {events.map((e, i) => (
        <li key={e.id} className="relative pl-6 pb-3 last:pb-0">
          <span
            className={cn(
              "absolute left-[3px] top-2 h-2 w-2 rounded-full ring-2 ring-background",
              dotColor(e.type),
            )}
          />
          <EventRow event={e} cwd={cwd} index={i} onApprove={onApprove} onDeny={onDeny} />
        </li>
      ))}
    </ol>
  );
}

function dotColor(type: TaskEvent["type"]) {
  switch (type) {
    case "user_prompt":
      return "bg-foreground";
    case "assistant_message":
      return "bg-status-running";
    case "command_started":
    case "command_output":
      return "bg-terminal-cyan";
    case "file_changed":
      return "bg-status-completed";
    case "approval_requested":
      return "bg-status-approval animate-pulse-dot";
    case "approval_denied":
      return "bg-status-failed";
    case "approval_granted":
    case "task_summary":
      return "bg-status-completed";
    default:
      return "bg-muted-foreground/60";
  }
}

function Tag({ children, color = "text-muted-foreground" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={cn("font-mono text-[10px] uppercase tracking-[0.12em]", color)}>{children}</span>
  );
}

function MetaRow({
  icon: Icon,
  tag,
  tagColor,
  time,
  index,
}: {
  icon: LucideIcon;
  tag: string;
  tagColor?: string;
  time: string;
  index: number;
}) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <Icon className={cn("h-3 w-3", tagColor ?? "text-muted-foreground")} />
      <Tag color={tagColor}>{tag}</Tag>
      <span className="font-mono text-[10px] text-muted-foreground/60">
        #{String(index + 1).padStart(3, "0")}
      </span>
      <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">{time}</span>
    </div>
  );
}

function EventRow({
  event,
  cwd,
  index,
  onApprove,
  onDeny,
}: {
  event: TaskEvent;
  cwd: string;
  index: number;
  onApprove: () => void;
  onDeny: () => void;
}) {
  switch (event.type) {
    case "user_prompt":
      return (
        <div>
          <MetaRow icon={User} tag="usr" time={event.timestamp} index={index} tagColor="text-foreground" />
          <p className="text-[13px] leading-snug text-foreground">{event.content}</p>
        </div>
      );

    case "assistant_message":
      return (
        <div>
          <MetaRow icon={Sparkles} tag="asst" time={event.timestamp} index={index} tagColor="text-status-running" />
          <p className="text-[13px] leading-relaxed text-foreground/90">{renderInlineCode(event.content ?? "")}</p>
        </div>
      );

    case "command_started":
      return (
        <TerminalBlock
          cwd={cwd}
          command={event.command}
          status="running"
          timestamp={event.timestamp}
        />
      );

    case "command_output":
      return (
        <TerminalBlock
          cwd={cwd}
          output={event.output}
          exitCode={event.exitCode ?? 0}
          durationMs={event.durationMs}
          timestamp={event.timestamp}
        />
      );

    case "file_changed": {
      return (
        <div className="space-y-2">
          <MetaRow icon={FileDiff} tag="diff" time={event.timestamp} index={index} tagColor="text-status-completed" />
          <ul className="divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-surface-elevated font-mono text-[12px]">
            {event.files?.map((f) => {
              const Icon = f.change === "added" ? FilePlus2 : f.change === "deleted" ? FileX2 : FileDiff;
              const color =
                f.change === "added"
                  ? "text-diff-add-fg"
                  : f.change === "deleted"
                    ? "text-diff-del-fg"
                    : "text-status-running";
              const tag = f.change === "added" ? "A" : f.change === "deleted" ? "D" : "M";
              return (
                <li key={f.path} className="flex items-center gap-2 px-2.5 py-1">
                  <span className={cn("w-3 text-[10px]", color)}>{tag}</span>
                  <Icon className={cn("h-3 w-3 shrink-0", color)} />
                  <span className="truncate text-foreground">{f.path}</span>
                  <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px]">
                    {f.additions != null && <span className="text-diff-add-fg">+{f.additions}</span>}
                    {f.deletions != null && <span className="text-diff-del-fg">−{f.deletions}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          {event.diff && <DiffBlock path={event.diff.path} hunks={event.diff.hunks} />}
        </div>
      );
    }

    case "approval_requested":
      if (!event.approval) return null;
      return (
        <div>
          <MetaRow icon={Sparkles} tag="approval" time={event.timestamp} index={index} tagColor="text-status-approval" />
          <ApprovalCard {...event.approval} onApprove={onApprove} onDeny={onDeny} />
        </div>
      );

    case "approval_granted":
      return (
        <div className="flex items-center gap-2 font-mono text-[12px] text-status-completed">
          <Tag color="text-status-completed">granted</Tag>
          <span>{event.content}</span>
          <span className="ml-auto text-[10px] text-muted-foreground/70">{event.timestamp}</span>
        </div>
      );

    case "approval_denied":
      return (
        <div className="flex items-center gap-2 font-mono text-[12px] text-status-failed">
          <Tag color="text-status-failed">denied</Tag>
          <span>{event.content}</span>
          <span className="ml-auto text-[10px] text-muted-foreground/70">{event.timestamp}</span>
        </div>
      );

    case "task_summary":
      return (
        <div className="rounded-md border border-status-completed/30 bg-status-completed-bg/15 p-2.5">
          <MetaRow icon={Sparkles} tag="summary" time={event.timestamp} index={index} tagColor="text-status-completed" />
          <p className="text-[13px] text-foreground">{event.content}</p>
        </div>
      );

    case "system":
    default:
      return (
        <div className="flex items-baseline gap-2 font-mono text-[11px] text-muted-foreground">
          <Tag>sys</Tag>
          <span>{event.content}</span>
          <span className="ml-auto text-[10px] text-muted-foreground/60">{event.timestamp}</span>
        </div>
      );
  }
}

/** Render inline `code` spans inside assistant prose without pulling in a markdown lib. */
function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((p, i) =>
    p.startsWith("`") && p.endsWith("`") ? (
      <code
        key={i}
        className="rounded border border-border bg-surface-elevated px-1 py-px font-mono text-[12px] text-terminal-cyan"
      >
        {p.slice(1, -1)}
      </code>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
