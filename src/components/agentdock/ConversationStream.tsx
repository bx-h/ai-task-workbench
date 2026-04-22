import { ChevronRight, FileDiff, FilePlus2, FileX2, Sparkles, Terminal as TerminalIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskEvent } from "@/types";
import { ApprovalCard } from "./ApprovalCard";

interface Props {
  events: TaskEvent[];
  onApprove: () => void;
  onDeny: () => void;
}

export function ConversationStream({ events, onApprove, onDeny }: Props) {
  return (
    <ol className="space-y-3">
      {events.map((e) => (
        <li key={e.id}>
          <EventRow event={e} onApprove={onApprove} onDeny={onDeny} />
        </li>
      ))}
    </ol>
  );
}

function EventGutter({ icon: Icon, label, time, color = "text-muted-foreground" }: { icon: any; label: string; time: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 pb-1.5">
      <Icon className={cn("h-3.5 w-3.5", color)} />
      <span className={cn("font-mono text-[10px] uppercase tracking-wider", color)}>{label}</span>
      <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">{time}</span>
    </div>
  );
}

function EventRow({ event, onApprove, onDeny }: { event: TaskEvent; onApprove: () => void; onDeny: () => void }) {
  switch (event.type) {
    case "user_prompt":
      return (
        <div className="rounded-md border border-border bg-surface-elevated px-3 py-2">
          <EventGutter icon={User} label="you" time={event.timestamp} color="text-foreground" />
          <p className="text-sm text-foreground">{event.content}</p>
        </div>
      );
    case "assistant_message":
      return (
        <div className="rounded-md border border-border/70 bg-surface px-3 py-2">
          <EventGutter icon={Sparkles} label="assistant" time={event.timestamp} color="text-status-running" />
          <p className="text-sm leading-relaxed text-foreground">{event.content}</p>
        </div>
      );
    case "command_started":
      return (
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center gap-2 border-b border-border bg-surface-elevated px-3 py-1.5">
            <TerminalIcon className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">command · started</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">{event.timestamp}</span>
          </div>
          <pre className="scrollbar-thin overflow-x-auto px-3 py-2 font-mono text-[13px] text-foreground">
            <span className="text-muted-foreground">$</span> {event.command}
          </pre>
        </div>
      );
    case "command_output":
      return (
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center gap-2 border-b border-border bg-surface-elevated px-3 py-1.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">stdout</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">{event.timestamp}</span>
          </div>
          <pre className="scrollbar-thin overflow-x-auto px-3 py-2 font-mono text-[12px] text-muted-foreground">
            {event.output?.join("\n")}
          </pre>
        </div>
      );
    case "file_changed":
      return (
        <div className="rounded-md border border-border bg-surface px-3 py-2">
          <EventGutter icon={FileDiff} label="files changed" time={event.timestamp} />
          <ul className="space-y-1">
            {event.files?.map((f) => {
              const Icon = f.change === "added" ? FilePlus2 : f.change === "deleted" ? FileX2 : FileDiff;
              const color =
                f.change === "added" ? "text-status-completed" : f.change === "deleted" ? "text-status-failed" : "text-status-running";
              return (
                <li key={f.path} className="flex items-center gap-2 font-mono text-[12px]">
                  <Icon className={cn("h-3 w-3", color)} />
                  <span className="truncate text-foreground">{f.path}</span>
                  <span className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                    {f.additions != null && <span className="text-status-completed">+{f.additions}</span>}
                    {f.deletions != null && <span className="text-status-failed">-{f.deletions}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    case "approval_requested":
      if (!event.approval) return null;
      return <ApprovalCard {...event.approval} onApprove={onApprove} onDeny={onDeny} />;
    case "approval_granted":
      return (
        <div className="rounded-md border border-status-completed/40 bg-status-completed-bg/30 px-3 py-2 text-sm text-status-completed">
          ✓ {event.content}
        </div>
      );
    case "approval_denied":
      return (
        <div className="rounded-md border border-status-failed/40 bg-status-failed-bg/30 px-3 py-2 text-sm text-status-failed">
          ✕ {event.content}
        </div>
      );
    case "task_summary":
      return (
        <div className="rounded-md border border-status-completed/40 bg-status-completed-bg/20 px-3 py-2">
          <EventGutter icon={Sparkles} label="task summary" time={event.timestamp} color="text-status-completed" />
          <p className="text-sm text-foreground">{event.content}</p>
        </div>
      );
    case "system":
    default:
      return (
        <div className="rounded-md border border-border/60 bg-transparent px-3 py-1.5 text-xs text-muted-foreground">
          <span className="font-mono">[system · {event.timestamp}]</span> {event.content}
        </div>
      );
  }
}