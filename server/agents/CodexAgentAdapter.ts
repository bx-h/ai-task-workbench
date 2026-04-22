import type { AgentAdapter, AgentRunContext, FollowUpInput, StartTaskInput } from "./AgentAdapter";
import { CodexAppServerClient } from "./codex/CodexAppServerClient";

export class CodexAgentAdapter implements AgentAdapter {
  provider = "codex" as const;
  supportsResume = true;

  constructor(private readonly client = new CodexAppServerClient()) {}

  async startTask(input: StartTaskInput, context: AgentRunContext) {
    const version = await this.client.checkVersion();
    if (!version.ok) {
      context.updateStatus("failed", "Codex CLI is not installed or not available on PATH.");
      context.appendEvent({ type: "task_failed", content: "Install and authenticate the Codex CLI before running Codex tasks." });
      return;
    }
    context.updateStatus("failed", "Codex app-server adapter is scaffolded; protocol execution is not enabled in this build.");
    context.appendEvent({
      type: "system",
      content: `Detected ${version.version}. Codex app-server protocol handling is isolated in the adapter and ready for mocked tests/manual enablement.`,
    });
    context.appendEvent({
      type: "task_failed",
      content: `Codex execution for "${input.prompt}" is intentionally stopped until app-server compatibility is confirmed.`,
    });
  }

  async followUp(input: FollowUpInput, context: AgentRunContext) {
    context.appendEvent({ type: "user_message", content: input.message });
    context.updateStatus("failed", "Codex follow-up requires app-server execution to be enabled.");
  }

  async cancel() {
    await this.client.stop();
  }
}
