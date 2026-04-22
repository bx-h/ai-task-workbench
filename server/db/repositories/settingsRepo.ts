import type Database from "better-sqlite3";
import type { AppSetting } from "../../../shared/types";
import { parseJson } from "../client";

interface SettingRow {
  key: string;
  value_json: string;
  updated_at: string;
}

function toSetting(row: SettingRow): AppSetting {
  return {
    key: row.key,
    value: parseJson<unknown>(row.value_json, null),
    updatedAt: row.updated_at,
  };
}

export class SettingsRepo {
  constructor(private readonly db: Database.Database) {}

  get(key: string): AppSetting | null {
    const row = this.db.prepare("SELECT * FROM settings WHERE key = ?").get(key) as SettingRow | undefined;
    return row ? toSetting(row) : null;
  }

  set(setting: AppSetting): AppSetting {
    this.db
      .prepare(
        `INSERT INTO settings (key, value_json, updated_at) VALUES (@key, @valueJson, @updatedAt)
         ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`,
      )
      .run({ key: setting.key, valueJson: JSON.stringify(setting.value), updatedAt: setting.updatedAt });
    return this.get(setting.key) ?? setting;
  }
}
