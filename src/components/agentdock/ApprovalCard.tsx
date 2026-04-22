import { ShieldAlert, Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  description: string;
  command: string;
  cwd: string;
  reason: string;
  risk: "low" | "medium" | "high";
  onApprove: () => void;
  onDeny: () => void;
  onApproveSimilar?: () => void;
}

const RISK_LABEL = {
  low: { text: "Low", color: "text-status-completed", bg: "bg-status-completed-bg" },
  medium: { text: "Medium", color: "text-status-input", bg: "bg-status-input-bg" },
  high: { text: "High", color: "text-status-failed", bg: "bg-status-failed-bg" },
} as const;

export function ApprovalCard({ title, description, command, cwd, reason, risk, onApprove, onDeny, onApproveSimilar }: Props) {
  const r = RISK_LABEL[risk];
  return (
    <div className="overflow-hidden rounded-lg border border-status-approval/40 bg-status-approval-bg/30 shadow-[0_0_0_1px_hsl(var(--status-approval)/0.15)]">
      <div className="flex items-center gap-2 border-b border-status-approval/30 bg-status-approval-bg/60 px-4 py-2">
        <ShieldAlert className="h-4 w-4 text-status-approval" />
        <span className="text-sm font-semibold text-status-approval">{title}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${r.bg} ${r.color}`}>
          Risk · {r.text}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-foreground">{description}</p>

        <div className="overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center gap-2 border-b border-border bg-surface-elevated px-3 py-1.5">
            <TerminalIcon className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">command</span>
          </div>
          <pre className="scrollbar-thin overflow-x-auto px-3 py-2 font-mono text-[13px] text-foreground">
            <span className="text-muted-foreground">$</span> {command}
          </pre>
        </div>

        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Working directory</dt>
            <dd className="mt-0.5 truncate font-mono text-foreground">{cwd}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Reason</dt>
            <dd className="mt-0.5 text-foreground">{reason}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="h-9 text-sm sm:order-1" onClick={onApproveSimilar}>
            Approve similar for this task
          </Button>
          <Button variant="outline" className="h-9 text-sm sm:order-2" onClick={onDeny}>
            Deny
          </Button>
          <Button
            className="h-9 bg-status-approval text-status-approval-bg hover:bg-status-approval/90 sm:order-3"
            onClick={onApprove}
          >
            Approve once
          </Button>
        </div>
      </div>
    </div>
  );
}