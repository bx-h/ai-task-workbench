import os from "node:os";
import path from "node:path";

export interface AgentDockConfig {
  host: string;
  port: number;
  dataDir: string;
  logDir: string;
  worktreeRoot: string;
  staticDir: string;
  serveStatic: boolean;
  mockDelayMs: number;
}

function resolveHome(input: string) {
  if (input === "~") return os.homedir();
  if (input.startsWith("~/")) return path.join(os.homedir(), input.slice(2));
  return input;
}

export function loadConfig(overrides: Partial<AgentDockConfig> = {}): AgentDockConfig {
  const dataDir = path.resolve(resolveHome(process.env.AGENTDOCK_DATA_DIR ?? "~/.agentdock"));
  return {
    host: process.env.AGENTDOCK_HOST ?? "127.0.0.1",
    port: Number(process.env.AGENTDOCK_PORT ?? "3876"),
    dataDir,
    logDir: process.env.AGENTDOCK_LOG_DIR
      ? path.resolve(resolveHome(process.env.AGENTDOCK_LOG_DIR))
      : path.join(dataDir, "logs"),
    worktreeRoot: process.env.AGENTDOCK_WORKTREE_ROOT
      ? path.resolve(resolveHome(process.env.AGENTDOCK_WORKTREE_ROOT))
      : path.join(dataDir, "worktrees"),
    staticDir: process.env.AGENTDOCK_STATIC_DIR
      ? path.resolve(process.env.AGENTDOCK_STATIC_DIR)
      : path.resolve("dist"),
    serveStatic: process.env.AGENTDOCK_SERVE_STATIC === "1" || process.env.NODE_ENV === "production",
    mockDelayMs: Number(process.env.AGENTDOCK_MOCK_DELAY_MS ?? "1000"),
    ...overrides,
  };
}
