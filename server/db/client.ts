import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import type { AgentDockConfig } from "../config";

export interface DatabaseHandle {
  db: Database.Database;
  dataDir: string;
  dbPath: string;
  close: () => void;
}

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function createDatabase(config: Pick<AgentDockConfig, "dataDir">): DatabaseHandle {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const dbPath = path.join(config.dataDir, "state.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return {
    db,
    dataDir: config.dataDir,
    dbPath,
    close: () => db.close(),
  };
}

export function migrate(db: Database.Database) {
  const schemaPath = path.join(dirname, "schema.sql");
  db.exec(fs.readFileSync(schemaPath, "utf8"));
}

export function nowIso() {
  return new Date().toISOString();
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
