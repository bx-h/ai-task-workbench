import type { AgentAdapter, AgentRunContext, FollowUpInput, StartTaskInput } from "./AgentAdapter";

export class MockAgentAdapter implements AgentAdapter {
  provider = "mock" as const;
  supportsResume = true;
  private readonly cancelled = new Set<string>();

  constructor(private readonly delayMs = 1000) {}

  async startTask(input: StartTaskInput, context: AgentRunContext) {
    this.cancelled.delete(input.taskId);
    context.updateStatus("running", "Inspecting project context...");
    context.appendEvent({ type: "task_started", content: `Mock agent started in ${input.cwd}.` });
    await this.delay();
    if (context.isCancelled()) return;
    context.appendEvent({ type: "assistant_message", content: `I will work on: ${input.prompt}` });
    await this.delay();
    context.appendEvent({ type: "command_started", command: "npm test -- --runInBand", content: "Running focused validation command." });
    await this.delay();
    context.appendEvent({ type: "command_output", output: ["mock: collecting tests", "mock: waiting for approval before execution"], exitCode: 0 });
    context.updateStatus("waiting_approval", "Waiting for approval to run npm test");
    const decision = await context.requestApproval({
      toolName: "shell",
      command: "npm test",
      description: "Mock agent wants to run the project test suite.",
      reason: "Validate the task before marking it complete.",
      riskLevel: "low",
    });
    if (decision.status === "denied") {
      context.updateStatus("blocked", decision.message ?? "Blocked: approval denied");
      context.appendEvent({ type: "task_failed", content: decision.message ?? "Task blocked because approval was denied." });
      return;
    }
    context.updateStatus("running", "Applying mock changes...");
    await this.delay();
    context.appendEvent({
      type: "file_changed",
      content: "Updated implementation and tests.",
      files: [{ path: "src/example.ts", change: "modified", additions: 12, deletions: 3 }],
    });
    await this.delay();
    context.appendEvent({ type: "summary_updated", content: "Mock task completed after approval and validation." });
    context.updateStatus("completed", "Completed");
    context.appendEvent({ type: "task_completed", content: "Task completed successfully." });
  }

  async followUp(input: FollowUpInput, context: AgentRunContext) {
    context.updateStatus("running", "Processing follow-up...");
    context.appendEvent({ type: "user_message", content: input.message });
    await this.delay();
    context.appendEvent({ type: "assistant_message", content: "Mock follow-up processed." });
    context.updateStatus("completed", "Follow-up completed");
  }

  async cancel(taskId: string) {
    this.cancelled.add(taskId);
  }

  private delay() {
    return new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}
