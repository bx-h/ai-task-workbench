import { loadConfig } from "../config";
import { createDatabase, nowIso } from "./client";
import { createRepositories } from "./repositories";

const config = loadConfig();
const database = createDatabase(config);
const repos = createRepositories(database.db);
const now = nowIso();

const project = repos.projects.upsert({
  id: "demo-project",
  name: "demo-project",
  rootPath: process.cwd(),
  displayPath: process.cwd(),
  path: process.cwd(),
  branch: "main",
  defaultAgent: "mock",
  trusted: true,
  isGitRepo: true,
  createdAt: now,
  updatedAt: now,
  lastOpenedAt: now,
});

repos.tasks.create({
  id: "demo-task",
  projectId: project.id,
  title: "Demo mock task",
  initialPrompt: "Demonstrate the AgentDock daemon event flow.",
  agent: "mock",
  status: "idle",
  currentActivity: "Seeded demo task",
  cwd: project.rootPath,
  workspace: "project root",
  workspaceMode: "project_root",
  worktree: "-",
  approvalMode: "normal",
  changedFilesCount: 0,
  changedFiles: [],
  unread: false,
  elapsedMinutes: 0,
  updatedLabel: "just now",
  events: [],
  createdAt: now,
  updatedAt: now,
});

database.close();
console.log(`Seeded demo data in ${config.dataDir}`);
