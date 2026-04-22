import { useState } from "react";
import { CheckCircle2, FileText, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentDock } from "@/store/useAgentDock";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  completed: { Icon: CheckCircle2, color: "text-status-completed" },
  approval: { Icon: ShieldAlert, color: "text-status-approval" },
  note: { Icon: FileText, color: "text-muted-foreground" },
  running: { Icon: Loader2, color: "text-status-running" },
  failed: { Icon: XCircle, color: "text-status-failed" },
} as const;

export function ActivityPanel() {
  const { activity, addQuickNote } = useAgentDock();
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!note.trim()) return;
    addQuickNote("inbox", note.trim());
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <aside className="hidden h-[calc(100vh-3.5rem)] w-80 shrink-0 flex-col border-l border-border bg-sidebar xl:flex">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Activity</span>
        <span className="font-mono text-[10px] text-muted-foreground">live</span>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-3">
        <ol className="space-y-0.5">
          {activity.map((a) => {
            const meta = KIND_ICON[a.kind];
            return (
              <li key={a.id} className="rounded-md px-2.5 py-2 hover:bg-sidebar-accent/60">
                <div className="flex items-start gap-2.5">
                  <meta.Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", meta.color, a.kind === "running" && "animate-spin")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">{a.text}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {a.projectName} · {a.timestamp}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-md border border-border bg-surface-elevated p-2">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Quick Note</span>
            {saved && <span className="font-mono text-[10px] text-status-completed">saved</span>}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Capture a thought…"
            rows={3}
            className="w-full resize-none rounded bg-transparent text-xs placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <div className="flex justify-end pt-1">
            <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" onClick={handleSave}>
              Save note
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}