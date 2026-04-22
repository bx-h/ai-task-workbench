import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAgentDock } from "@/store/useAgentDock";
import type { AgentType, ApprovalMode, WorkspaceMode } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

const SKILLS = ["None", "Code Review", "Test Writer", "Refactor Planner", "Debugger"];

export function NewTaskDialog({ open, onOpenChange, defaultProjectId }: Props) {
  const { projects, addTask } = useAgentDock();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? projects[0]?.id ?? "");
  const [agent, setAgent] = useState<AgentType>("mock");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("auto");
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("normal");
  const [skill, setSkill] = useState("None");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !prompt.trim() || !projectId) return;
    setSubmitting(true);
    try {
      const task = await addTask({
        projectId,
        title: title.trim(),
        agent,
        prompt: prompt.trim(),
        workspaceMode,
        approvalMode,
        skill: skill === "None" ? undefined : skill,
      });
      onOpenChange(false);
      setTitle("");
      setPrompt("");
      setSkill("None");
      navigate(`/tasks/${task.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border bg-surface p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="text-base">New task</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Spawn an agent in a project. Defaults match the project's settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project">
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-9 bg-surface-elevated"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Agent">
              <Select value={agent} onValueChange={(v) => setAgent(v as AgentType)}>
                <SelectTrigger className="h-9 bg-surface-elevated"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mock">Mock</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="codex">Codex</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Fix JWT refresh token bug"
              className="h-9 w-full rounded-md border border-border bg-surface-elevated px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </Field>

          <Field label="Prompt">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe what the agent should do…"
              className="scrollbar-thin w-full resize-none rounded-md border border-border bg-surface-elevated px-3 py-2 font-mono text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Workspace mode">
              <Select value={workspaceMode} onValueChange={(v) => setWorkspaceMode(v as WorkspaceMode)}>
                <SelectTrigger className="h-9 bg-surface-elevated"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="project_root">Use project root</SelectItem>
                  <SelectItem value="isolated_worktree">Create isolated worktree</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Approval mode">
              <Select value={approvalMode} onValueChange={(v) => setApprovalMode(v as ApprovalMode)}>
                <SelectTrigger className="h-9 bg-surface-elevated"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="read_only">Read-only</SelectItem>
                  <SelectItem value="auto_safe">Auto approve safe commands</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Skill">
            <Select value={skill} onValueChange={setSkill}>
              <SelectTrigger className="h-9 bg-surface-elevated"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SKILLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter className="border-t border-border bg-background/40 px-5 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !prompt.trim() || submitting}>
            {submitting ? "Creating..." : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
