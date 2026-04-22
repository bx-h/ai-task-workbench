import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  FileDiff,
  FilePlus2,
  FileX2,
  Paperclip,
  PencilLine,
  Send,
  ShieldAlert,
  Sparkles,
  StopCircle,
  X,
} from "lucide-react";
import { AppShell } from "@/components/agentdock/AppShell";
import { ConversationStream } from "@/components/agentdock/ConversationStream";
import { StatusChip } from "@/components/agentdock/StatusChip";
import { AgentBadge } from "@/components/agentdock/AgentBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAgentDock } from "@/store/useAgentDock";
import { cn } from "@/lib/utils";

const SKILLS = ["Code Review", "Test Writer", "Refactor Plan", "Debugger"];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, projects, approveTask, denyTask, updateTaskNote } = useAgentDock();
  const task = tasks.find((t) => t.id === id);
  const project = projects.find((p) => p.id === task?.projectId);
  const siblings = useMemo(() => tasks.filter((t) => t.projectId === task?.projectId), [tasks, task?.projectId]);

  const [composer, setComposer] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [task?.events.length]);

  if (!task || !project) {
    return (
      <AppShell showActivity={false}>
        <div className="p-6 text-sm text-muted-foreground">Task not found.</div>
      </AppShell>
    );
  }

  function handleNoteChange(v: string) {
    if (!task) return;
    updateTaskNote(task.id, v);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 1400);
    }, 350);
  }

  return (
    <AppShell showActivity={false}>
      {/* Task header */}
      <div className="border-b border-border bg-surface/60">
        <div className="px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <span className="text-border">/</span>
            <Link to={`/projects/${project.id}`} className="font-mono hover:text-foreground">
              {project.name}
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight md:text-xl">{task.title}</h1>
                <StatusChip status={task.status} size="md" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">Agent <AgentBadge agent={task.agent} /></span>
                <span>Elapsed <span className="font-mono text-foreground">{task.elapsedMinutes}m</span></span>
                <span className="inline-flex items-center gap-1 truncate font-mono">
                  workspace · <span className="truncate text-foreground">{task.workspace}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8"><StopCircle className="mr-1.5 h-3.5 w-3.5" />Cancel</Button>
              <Button variant="ghost" size="sm" className="h-8"><Archive className="mr-1.5 h-3.5 w-3.5" />Archive</Button>
              <Button variant="ghost" size="sm" className="h-8"><ExternalLink className="mr-1.5 h-3.5 w-3.5" />Open in Editor</Button>
              <Button size="sm" className="h-8">Continue</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="flex min-h-0 flex-1 lg:h-[calc(100vh-3.5rem-7rem)]">
        {/* Sibling tasks */}
        <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar lg:block">
          <div className="px-3 py-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Tasks in {project.name}
            </div>
            <ul className="space-y-0.5">
              {siblings.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/tasks/${t.id}`}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-xs transition-colors",
                      t.id === task.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot status={t.status} />
                      <span className="truncate">{t.title}</span>
                    </div>
                    <div className="mt-0.5 truncate pl-3.5 font-mono text-[10px] text-muted-foreground">{t.updatedLabel}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Conversation stream */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div ref={streamRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-5 md:px-6">
            <ConversationStream
              events={task.events}
              cwd={`~/code/${project.name}`}
              onApprove={() => approveTask(task.id)}
              onDeny={() => denyTask(task.id)}
            />
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-surface/60 px-3 py-3 md:px-6">
            <div className="rounded-lg border border-border bg-surface-elevated">
              <textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Ask a follow-up…"
                rows={2}
                className="scrollbar-thin w-full resize-none rounded-t-lg bg-transparent px-3 py-2 font-mono text-[13px] placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Paperclip className="mr-1 h-3 w-3" /> Attach context
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Sparkles className="mr-1 h-3 w-3" /> Use skill <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {SKILLS.map((s) => (
                        <DropdownMenuItem key={s}>{s}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button size="sm" className="h-7 px-3 text-xs" disabled={!composer.trim()} onClick={() => setComposer("")}>
                  <Send className="mr-1 h-3 w-3" /> Send
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Right info panel */}
        <aside className="hidden w-80 shrink-0 border-l border-border bg-sidebar xl:block">
          <InfoPanel task={task} note={task.note ?? ""} onNoteChange={handleNoteChange} noteSaved={noteSaved} />
        </aside>
      </div>

      {/* Mobile sticky approval bar — large touch targets, only shown when waiting */}
      {task.status === "waiting_approval" && (
        <div className="fixed inset-x-0 bottom-14 z-40 border-t border-status-approval/40 bg-status-approval-bg/95 px-3 py-2 backdrop-blur xl:hidden">
          <div className="mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-status-approval" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-status-approval">
              approval required
            </span>
            <span className="ml-auto truncate font-mono text-[11px] text-foreground/80">
              {task.currentActivity}
            </span>
          </div>
          <div className="flex items-stretch gap-2">
            <button
              onClick={() => denyTask(task.id)}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-status-failed/40 bg-background text-sm font-medium text-status-failed active:scale-[0.98]"
            >
              <X className="h-4 w-4" /> Deny
            </button>
            <button
              onClick={() => approveTask(task.id)}
              className="flex h-11 flex-[2] items-center justify-center gap-1.5 rounded-md bg-status-approval text-sm font-semibold text-status-approval-bg active:scale-[0.98]"
            >
              <Check className="h-4 w-4" /> Approve once
            </button>
          </div>
        </div>
      )}

      {/* Mobile FAB for quick note */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className={cn(
              "fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-border xl:hidden",
              task.status === "waiting_approval" ? "bottom-44" : "bottom-20",
            )}
          >
            <PencilLine className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="border-border bg-surface">
          <InfoPanel task={task} note={task.note ?? ""} onNoteChange={handleNoteChange} noteSaved={noteSaved} mobile />
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function StatusDot({ status }: { status: import("@/types").TaskStatus }) {
  const map: Record<string, string> = {
    running: "bg-status-running animate-pulse-dot",
    waiting_approval: "bg-status-approval",
    waiting_input: "bg-status-input",
    completed: "bg-status-completed",
    failed: "bg-status-failed",
    blocked: "bg-status-failed",
    idle: "bg-status-idle",
    archived: "bg-status-idle",
  };
  return <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", map[status])} />;
}

function InfoPanel({
  task,
  note,
  onNoteChange,
  noteSaved,
  mobile,
}: {
  task: import("@/types").Task;
  note: string;
  onNoteChange: (v: string) => void;
  noteSaved: boolean;
  mobile?: boolean;
}) {
  return (
    <div className={cn("scrollbar-thin h-full overflow-y-auto px-4 py-4", mobile && "max-h-[80vh]")}>
      <Section label="Current status">
        <StatusChip status={task.status} size="md" />
        <p className="mt-2 text-xs text-muted-foreground">{task.currentActivity}</p>
      </Section>

      <Section label={`Changed files · ${task.changedFiles.length}`}>
        <ul className="divide-y divide-border rounded-md border border-border bg-surface-elevated">
          {task.changedFiles.length === 0 && (
            <li className="px-2.5 py-2 text-xs text-muted-foreground">No file changes yet.</li>
          )}
          {task.changedFiles.map((f) => {
            const Icon = f.change === "added" ? FilePlus2 : f.change === "deleted" ? FileX2 : FileDiff;
            const color =
              f.change === "added" ? "text-status-completed" : f.change === "deleted" ? "text-status-failed" : "text-status-running";
            return (
              <li key={f.path} className="flex items-center gap-2 px-2.5 py-1.5 font-mono text-[11px]">
                <Icon className={cn("h-3 w-3 shrink-0", color)} />
                <span className="truncate text-foreground">{f.path}</span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px]">
                  <span className="text-status-completed">+{f.additions}</span>
                  <span className="text-status-failed">-{f.deletions}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Meta label="Worktree" value={task.worktree} mono />
        <Meta label="Agent" value={task.agent === "claude" ? "Claude" : "Codex"} />
        <Meta label="Approval mode" value={task.approvalMode === "auto_safe" ? "Auto-safe" : task.approvalMode === "read_only" ? "Read-only" : "Normal"} />
        <Meta label="Elapsed" value={`${task.elapsedMinutes}m`} mono />
      </div>

      <Section label="Quick notes">
        <div className="rounded-md border border-border bg-surface-elevated p-2">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Markdown</span>
            {noteSaved && <span className="font-mono text-[10px] text-status-completed">saved</span>}
          </div>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={5}
            placeholder="Capture a thought about this task…"
            className="scrollbar-thin w-full resize-none rounded bg-transparent font-mono text-xs placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 py-3 first:pt-1 last:border-b-0">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 truncate text-xs text-foreground", mono && "font-mono")}>{value}</div>
    </div>
  );
}