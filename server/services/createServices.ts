import type { AgentType } from "../../shared/types";
import type { AgentDockConfig } from "../config";
import type { DatabaseHandle } from "../db/client";
import { createRepositories } from "../db/repositories";
import { ClaudeAgentAdapter } from "../agents/ClaudeAgentAdapter";
import { CodexAgentAdapter } from "../agents/CodexAgentAdapter";
import { MockAgentAdapter } from "../agents/MockAgentAdapter";
import type { AgentAdapter } from "../agents/AgentAdapter";
import { WorkspaceService } from "../workspace/WorkspaceService";
import { ApprovalService } from "./ApprovalService";
import { EventBus } from "./EventBus";
import { NoteService } from "./NoteService";
import { ProjectService } from "./ProjectService";
import { TaskOrchestrator } from "./TaskOrchestrator";

export function createServices(config: AgentDockConfig, database: DatabaseHandle) {
  const repos = createRepositories(database.db);
  const events = new EventBus(repos);
  const projects = new ProjectService(repos);
  const workspace = new WorkspaceService(config);
  const approvals = new ApprovalService(repos, events);
  const adapters: Record<AgentType, AgentAdapter> = {
    mock: new MockAgentAdapter(config.mockDelayMs),
    claude: new ClaudeAgentAdapter(),
    codex: new CodexAgentAdapter(),
  };
  const tasks = new TaskOrchestrator(repos, projects, workspace, approvals, events, adapters);
  const notes = new NoteService(repos);
  return { repos, events, projects, workspace, approvals, adapters, tasks, notes };
}

export type Services = ReturnType<typeof createServices>;
