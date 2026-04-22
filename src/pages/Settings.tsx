import { AppShell } from "@/components/agentdock/AppShell";

const SECTIONS = [
  {
    label: "Agents",
    rows: [
      { k: "default_agent", v: "claude" },
      { k: "claude.model", v: "claude-sonnet-4" },
      { k: "codex.model", v: "gpt-5-codex" },
    ],
  },
  {
    label: "Approval",
    rows: [
      { k: "approval_mode", v: "normal" },
      { k: "auto_approve_safe", v: "false" },
      { k: "deny_destructive", v: "true" },
    ],
  },
  {
    label: "Workspace",
    rows: [
      { k: "worktree_root", v: "~/.ai-tasker/worktrees" },
      { k: "isolate_by_default", v: "true" },
      { k: "shell", v: "/bin/zsh" },
    ],
  },
  {
    label: "Notifications",
    rows: [
      { k: "notify.waiting_approval", v: "true" },
      { k: "notify.task_complete", v: "true" },
      { k: "notify.task_failed", v: "true" },
    ],
  },
];

export default function Settings() {
  return (
    <AppShell showActivity={false}>
      <div className="mx-auto max-w-3xl px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center gap-2 pb-4 font-mono text-[12px] text-muted-foreground">
          <span className="ansi-prompt">❯</span>
          <span className="text-foreground">agentdock</span>
          <span>config</span>
          <span className="text-muted-foreground/60">--show</span>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((s) => (
            <section key={s.label}>
              <div className="mb-1.5 flex items-center gap-2">
                <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</h2>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="overflow-hidden rounded-md border border-border bg-surface">
                <ul className="divide-y divide-border">
                  {s.rows.map((r) => (
                    <li key={r.k} className="grid grid-cols-2 items-center gap-2 px-3 py-2 font-mono text-[12px]">
                      <span className="text-muted-foreground">{r.k}</span>
                      <span className="truncate text-right text-foreground">{r.v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}

          <p className="pt-2 font-mono text-[10px] text-muted-foreground">
            # config persisted to ~/.agentdock/config.toml
          </p>
        </div>
      </div>
    </AppShell>
  );
}