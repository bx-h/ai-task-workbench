import { execa } from "execa";

interface ManagedProcess {
  kill: (signal?: NodeJS.Signals) => void;
}

export class CodexAppServerClient {
  private process: ManagedProcess | null = null;

  async checkVersion() {
    try {
      const result = await execa("codex", ["--version"]);
      return { ok: true, version: result.stdout.trim() };
    } catch {
      return { ok: false, version: "" };
    }
  }

  async start() {
    this.process = execa("codex", ["app-server", "--listen", "stdio://"], { stdin: "pipe", stdout: "pipe", stderr: "pipe" }) as unknown as ManagedProcess;
    return this.process;
  }

  async stop() {
    this.process?.kill("SIGTERM");
    this.process = null;
  }
}
