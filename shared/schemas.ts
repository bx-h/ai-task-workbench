import { z } from "zod";

export const agentTypeSchema = z.enum(["claude", "codex", "mock"]);
export const taskStatusSchema = z.enum([
  "draft",
  "queued",
  "running",
  "waiting_approval",
  "waiting_input",
  "blocked",
  "completed",
  "failed",
  "cancelled",
  "interrupted",
  "idle",
  "archived",
]);
export const approvalModeSchema = z.enum(["normal", "read_only", "auto_safe"]);
export const workspaceModeSchema = z.enum(["auto", "project_root", "isolated_worktree"]);

export const changedFileSchema = z.object({
  path: z.string().min(1),
  change: z.enum(["added", "modified", "deleted"]),
  additions: z.number().int().nonnegative().default(0),
  deletions: z.number().int().nonnegative().default(0),
});

export const openProjectSchema = z.object({
  path: z.string().min(1),
  trust: z.boolean().optional().default(false),
});

export const createProjectSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1).optional(),
  trust: z.boolean().optional().default(false),
  defaultAgent: agentTypeSchema.optional().default("mock"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  defaultAgent: agentTypeSchema.optional(),
  trusted: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  prompt: z.string().min(1),
  agent: agentTypeSchema.default("mock"),
  workspaceMode: workspaceModeSchema.default("auto"),
  approvalMode: approvalModeSchema.default("normal"),
  skill: z.string().optional(),
});

export const followUpSchema = z.object({
  message: z.string().min(1),
});

export const approvalDecisionSchema = z.object({
  scope: z.literal("once").optional().default("once"),
  message: z.string().optional(),
});

export const createNoteSchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  content: z.string().min(1),
});

export const updateNoteSchema = z.object({
  content: z.string(),
});
