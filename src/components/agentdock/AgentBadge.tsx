import { cn } from "@/lib/utils";
import type { AgentType } from "@/types";

export function AgentBadge({ agent, className }: { agent: AgentType; className?: string }) {
  const isClaude = agent === "claude";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        isClaude ? "text-agent-claude" : "text-agent-codex",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-sm", isClaude ? "bg-agent-claude" : "bg-agent-codex")} />
      {isClaude ? "Claude" : "Codex"}
    </span>
  );
}