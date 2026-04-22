import { cn } from "@/lib/utils";

interface Props {
  cwd?: string;
  user?: string;
  command?: string;
  output?: string[];
  exitCode?: number;
  durationMs?: number;
  status?: "running" | "done";
  timestamp?: string;
  className?: string;
}

/**
 * Tight, terminal-style block. Uses a left "TTY" rail, prompt line,
 * and exit-code chip — designed to read like a tmux pane, not a chat bubble.
 */
export function TerminalBlock({
  cwd = "~",
  user = "you",
  command,
  output,
  exitCode,
  durationMs,
  status = "done",
  timestamp,
  className,
}: Props) {
  const promptHost = cwd.replace(/^~\/code\//, "").replace(/^~\//, "");
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-terminal font-mono text-[12.5px] leading-[1.55] text-terminal-fg shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.02)]",
        className,
      )}
    >
      {/* tty header */}
      <div className="flex items-center gap-2 border-b border-border/70 bg-background/60 px-2.5 py-1">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-status-failed/70" />
          <span className="h-2 w-2 rounded-full bg-status-input/70" />
          <span className="h-2 w-2 rounded-full bg-status-completed/70" />
        </div>
        <span className="ml-1 truncate text-[10px] uppercase tracking-wider text-terminal-muted">
          tty · {promptHost || "shell"}
        </span>
        {status === "running" && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-status-running-bg px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-status-running">
            <span className="h-1 w-1 animate-pulse-dot rounded-full bg-status-running" />
            running
          </span>
        )}
        {exitCode != null && (
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-wider",
              exitCode === 0
                ? "bg-status-completed-bg text-status-completed"
                : "bg-status-failed-bg text-status-failed",
            )}
          >
            exit {exitCode}
          </span>
        )}
        {durationMs != null && (
          <span className="text-[10px] text-terminal-muted">{durationMs}ms</span>
        )}
        <span className="ml-auto text-[10px] text-terminal-muted">{timestamp}</span>
      </div>

      {/* body */}
      <div className="terminal-grid">
        {command && (
          <div className="flex items-baseline gap-2 px-3 py-1.5">
            <span className="select-none whitespace-nowrap">
              <span className="ansi-prompt">{user}</span>
              <span className="ansi-muted">@agentdock</span>
              <span className="text-terminal-muted">:</span>
              <span className="ansi-cyan">{cwd}</span>
              <span className="ansi-prompt"> ❯</span>
            </span>
            <span className="min-w-0 flex-1 break-all text-terminal-fg">{command}</span>
          </div>
        )}
        {output && output.length > 0 && (
          <pre className="scrollbar-thin overflow-x-auto whitespace-pre px-3 pb-2 pt-0.5 text-[12px] text-terminal-fg/85">
            {output.join("\n")}
            {status === "running" && <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-[2px] animate-pulse-dot bg-terminal-fg/70 align-middle" />}
          </pre>
        )}
      </div>
    </div>
  );
}