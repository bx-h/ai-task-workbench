import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAgentDock } from "@/store/useAgentDock";

export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { openProject, createProject } = useAgentDock();
  const [path, setPath] = useState("");
  const [name, setName] = useState("");
  const [trust, setTrust] = useState(true);
  const [mode, setMode] = useState<"open" | "create">("open");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!path.trim()) return;
    setSubmitting(true);
    try {
      if (mode === "open") {
        await openProject({ path: path.trim(), trust });
      } else {
        await createProject({ path: path.trim(), name: name.trim() || undefined, trust });
      }
      setPath("");
      setName("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-surface">
        <DialogHeader>
          <DialogTitle className="text-base">New project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button size="sm" variant={mode === "open" ? "default" : "outline"} onClick={() => setMode("open")}>Open</Button>
            <Button size="sm" variant={mode === "create" ? "default" : "outline"} onClick={() => setMode("create")}>Create</Button>
          </div>
          <Field label="Path">
            <input
              value={path}
              onChange={(event) => setPath(event.target.value)}
              placeholder="/home/me/code/my-api"
              className="h-9 w-full rounded-md border border-border bg-surface-elevated px-3 text-sm focus:border-ring focus:outline-none"
            />
          </Field>
          {mode === "create" && (
            <Field label="Name">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="my-api"
                className="h-9 w-full rounded-md border border-border bg-surface-elevated px-3 text-sm focus:border-ring focus:outline-none"
              />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={trust} onChange={(event) => setTrust(event.target.checked)} />
            Trust this project for local agent tasks and note writes
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!path.trim() || submitting} onClick={submit}>{submitting ? "Saving..." : "Save project"}</Button>
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
