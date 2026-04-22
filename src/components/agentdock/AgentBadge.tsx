import { cn } from "@/lib/utils";
import type { AgentType } from "@/types";

export function AgentBadge({ agent, className }: { agent: AgentType; className?: string }) {
  const tone = agent === "claude" ? "claude" : agent === "codex" ? "codex" : "mock";
  const label = agent === "claude" ? "Claude" : agent === "codex" ? "Codex" : "Mock";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        tone === "claude" ? "text-agent-claude" : tone === "codex" ? "text-agent-codex" : "text-muted-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-sm", tone === "claude" ? "bg-agent-claude" : tone === "codex" ? "bg-agent-codex" : "bg-muted-foreground")} />
      {label}
    </span>
  );
}
