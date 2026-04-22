import { useState } from "react";
import { StickyNote } from "lucide-react";
import { AppShell } from "@/components/agentdock/AppShell";
import { useAgentDock } from "@/store/useAgentDock";

export default function Notes() {
  const { tasks, projects } = useAgentDock();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  const taskNotes = tasks.filter((t) => t.note && t.note.trim().length > 0);

  function save() {
    if (!draft.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
    setDraft("");
  }

  return (
    <AppShell showActivity={false}>
      <div className="mx-auto max-w-3xl px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center gap-2 pb-4 font-mono text-[12px] text-muted-foreground">
          <span className="ansi-prompt">❯</span>
          <span className="text-foreground">agentdock</span>
          <span>notes</span>
        </div>

        <div className="rounded-md border border-border bg-surface-elevated p-2">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">scratchpad.md</span>
            {saved && <span className="font-mono text-[10px] text-status-completed">saved</span>}
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            rows={5}
            placeholder="Capture a thought…"
            className="scrollbar-thin w-full resize-none rounded bg-transparent font-mono text-xs placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Task Notes</h2>
            <span className="font-mono text-[11px] text-muted-foreground">[{taskNotes.length}]</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          {taskNotes.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              No task notes yet. Open a task and use Quick Notes.
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-surface">
              {taskNotes.map((t) => {
                const p = projects.find((pp) => pp.id === t.projectId);
                return (
                  <li key={t.id} className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-foreground">{t.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">· {p?.name}</span>
                    </div>
                    <pre className="mt-1.5 whitespace-pre-wrap pl-5 font-mono text-[11px] text-muted-foreground">
                      {t.note}
                    </pre>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}