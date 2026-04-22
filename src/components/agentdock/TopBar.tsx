import { Bell, Command, Search, Settings, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAgentDock } from "@/store/useAgentDock";

export function TopBar() {
  const { isOffline } = useAgentDock();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur md:px-4">
      <Link to="/" className="flex items-center gap-2 pl-1 pr-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-status-running-bg ring-1 ring-status-running/40">
          <Terminal className="h-3.5 w-3.5 text-status-running" />
        </div>
        <span className="font-mono text-sm font-semibold tracking-tight">AgentDock</span>
        <span className="hidden rounded border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          v0.4.2
        </span>
        {isOffline && (
          <span className="hidden rounded border border-status-failed/40 bg-status-failed-bg px-1.5 py-0.5 font-mono text-[10px] text-status-failed sm:inline-block">
            daemon offline
          </span>
        )}
      </Link>

      <div className="relative mx-auto hidden max-w-xl flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, tasks, notes…"
          className="h-9 w-full rounded-md border border-border bg-surface-elevated pl-9 pr-16 text-sm placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          <Command className="mr-0.5 inline h-2.5 w-2.5" />K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-status-approval" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-status-running/30 to-agent-codex/30 font-mono text-[11px] font-semibold text-foreground ring-1 ring-border">
          KW
        </div>
      </div>
    </header>
  );
}
