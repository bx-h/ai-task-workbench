import type { AgentAdapter, AgentRunContext, FollowUpInput, StartTaskInput } from "./AgentAdapter";

export class ClaudeAgentAdapter implements AgentAdapter {
  provider = "claude" as const;
  supportsResume = true;

  async startTask(input: StartTaskInput, context: AgentRunContext) {
    const available = await this.checkAvailability();
    if (!available.ok) {
      context.updateStatus("failed", available.message);
      context.appendEvent({ type: "task_failed", content: available.message });
      return;
    }
    context.updateStatus("failed", "Claude adapter is scaffolded; SDK execution is not enabled in this build.");
    context.appendEvent({
      type: "task_failed",
      content:
        "Claude provider availability was detected, but this MVP build keeps real SDK execution behind the adapter boundary until credentials and SDK mode are confirmed.",
    });
  }

  async followUp(input: FollowUpInput, context: AgentRunContext) {
    context.appendEvent({ type: "user_message", content: input.message });
    context.updateStatus("failed", "Claude follow-up requires SDK execution to be enabled.");
  }

  async cancel() {
    return;
  }

  async checkAvailability(): Promise<{ ok: boolean; message: string }> {
    try {
      const optionalImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<unknown>;
      await optionalImport("@anthropic-ai/claude-agent-sdk");
      return { ok: true, message: "Claude Agent SDK available" };
    } catch {
      return {
        ok: false,
        message: "Claude Agent SDK is not installed. Install @anthropic-ai/claude-agent-sdk and configure Claude credentials to use this provider.",
      };
    }
  }
}
