import { ShieldAlert, Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description: string;
  command: string;
  cwd: string;
  reason: string;
  risk: "low" | "medium" | "high" | "unknown";
  affects?: string[];
  onApprove: () => void;
  onDeny: () => void;
  onApproveSimilar?: () => void;
  compact?: boolean;
}

const RISK = {
  low: { text: "low", color: "text-status-completed", bg: "bg-status-completed-bg" },
  medium: { text: "medium", color: "text-status-input", bg: "bg-status-input-bg" },
  high: { text: "high", color: "text-status-failed", bg: "bg-status-failed-bg" },
  unknown: { text: "unknown", color: "text-muted-foreground", bg: "bg-muted" },
} as const;

export function ApprovalCard({
  title,
  description,
  command,
  cwd,
  reason,
  risk,
  affects,
  onApprove,
  onDeny,
  onApproveSimilar,
  compact,
}: Props) {
  const r = RISK[risk];
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-status-approval/40 bg-background",
        "shadow-[inset_3px_0_0_hsl(var(--status-approval))]",
      )}
    >
      {/* header */}
      <div className="flex items-center gap-2 border-b border-status-approval/25 bg-status-approval-bg/40 px-3 py-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-status-approval" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-status-approval">
          approval required
        </span>
        <span className={cn("ml-auto rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", r.bg, r.color)}>
          risk · {r.text}
        </span>
      </div>

      <div className={cn("space-y-2.5", compact ? "p-2.5" : "p-3")}>
        <p className="text-[13px] text-foreground">
          <span className="text-muted-foreground">{title} —</span> {description}
        </p>

        {/* command preview — terminal style */}
        <div className="overflow-hidden rounded border border-border bg-terminal">
          <div className="flex items-center gap-2 border-b border-border/70 px-2.5 py-1">
            <TerminalIcon className="h-3 w-3 text-terminal-muted" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-terminal-muted">command</span>
            <span className="ml-auto truncate font-mono text-[10px] text-terminal-muted">{cwd}</span>
          </div>
          <pre className="scrollbar-thin overflow-x-auto px-2.5 py-1.5 font-mono text-[13px] text-terminal-fg">
            <span className="ansi-prompt">❯</span> {command}
          </pre>
        </div>

        {/* impact strip */}
        <dl className="grid gap-x-4 gap-y-1 font-mono text-[11px] sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-muted-foreground">reason</dt>
            <dd className="text-foreground">{reason}</dd>
          </div>
          {affects && affects.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted-foreground">impact</dt>
              <dd className="flex flex-wrap gap-x-2 gap-y-0.5 text-foreground">
                {affects.map((a) => {
                  const safe = /none|read-only/i.test(a);
                  return (
                    <span key={a} className={cn("inline-flex items-center gap-1", safe ? "text-status-completed" : "text-status-input")}>
                      <span className={cn("h-1 w-1 rounded-full", safe ? "bg-status-completed" : "bg-status-input")} />
                      {a}
                    </span>
                  );
                })}
              </dd>
            </div>
          )}
        </dl>

        {/* actions: keyboard-driven layout */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <div className="hidden font-mono text-[10px] text-muted-foreground sm:block">
            <kbd className="rounded border border-border bg-surface-elevated px-1">A</kbd> approve ·{" "}
            <kbd className="rounded border border-border bg-surface-elevated px-1">D</kbd> deny ·{" "}
            <kbd className="rounded border border-border bg-surface-elevated px-1">⇧A</kbd> similar
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" className="h-9 text-xs" onClick={onApproveSimilar}>
              Approve similar
            </Button>
            <Button variant="outline" className="h-9 border-status-failed/40 text-status-failed hover:bg-status-failed-bg/40 hover:text-status-failed text-xs" onClick={onDeny}>
              Deny
            </Button>
            <Button
              className="h-9 bg-status-approval text-status-approval-bg hover:bg-status-approval/90 text-xs font-semibold"
              onClick={onApprove}
            >
              Approve once
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
