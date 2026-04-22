import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import type { QuickNote, Task } from "../../shared/types";
import type { Repositories } from "../db/repositories";
import { nowIso } from "../db/client";

export class NoteService {
  constructor(private readonly repos: Repositories) {}

  list(projectId?: string) {
    return this.repos.notes.list(projectId);
  }

  create(input: { projectId: string; taskId?: string; content: string }) {
    const project = this.repos.projects.get(input.projectId);
    if (!project) throw Object.assign(new Error("Project not found"), { statusCode: 404, code: "project_not_found" });
    if (!project.trusted) throw Object.assign(new Error("Project must be trusted before notes can be written"), { statusCode: 403, code: "trust_required" });
    const task = input.taskId ? this.repos.tasks.get(input.taskId) : null;
    const filePath = this.writeMarkdown(project.rootPath, input.content, task ?? undefined);
    const now = nowIso();
    const note: QuickNote = {
      id: nanoid(),
      projectId: project.id,
      taskId: input.taskId,
      content: input.content,
      filePath,
      createdAt: now,
      updatedAt: now,
    };
    const saved = this.repos.notes.create(note);
    if (task) {
      this.repos.tasks.update(task.id, { note: input.content, updatedAt: now });
    }
    return saved;
  }

  update(id: string, content: string) {
    const existing = this.repos.notes.get(id);
    if (!existing) throw Object.assign(new Error("Note not found"), { statusCode: 404, code: "note_not_found" });
    return this.repos.notes.update(id, content, nowIso());
  }

  delete(id: string) {
    this.repos.notes.delete(id);
  }

  private writeMarkdown(projectRoot: string, content: string, task?: Task) {
    const today = new Date().toISOString().slice(0, 10);
    const notesDir = path.join(projectRoot, ".agentdock", "notes");
    fs.mkdirSync(notesDir, { recursive: true });
    const filePath = path.join(notesDir, `${today}.md`);
    const title = task?.title ?? "Quick Note";
    const block = [`## ${title}`, "", `Task: ${task?.title ?? "inbox"}`, `Time: ${new Date().toISOString()}`, "", content.trim(), "", ""].join("\n");
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `# ${today}\n\n${block}`, "utf8");
    } else {
      fs.appendFileSync(filePath, block, "utf8");
    }
    this.ensureGitignore(projectRoot);
    return filePath;
  }

  private ensureGitignore(projectRoot: string) {
    const gitignore = path.join(projectRoot, ".gitignore");
    const entry = ".agentdock/";
    const existing = fs.existsSync(gitignore) ? fs.readFileSync(gitignore, "utf8") : "";
    if (!existing.split(/\r?\n/).includes(entry)) {
      fs.appendFileSync(gitignore, `${existing.endsWith("\n") || existing.length === 0 ? "" : "\n"}${entry}\n`, "utf8");
    }
  }
}
