import type Database from "better-sqlite3";
import { ApprovalsRepo } from "./approvalsRepo";
import { EventsRepo } from "./eventsRepo";
import { NotesRepo } from "./notesRepo";
import { ProjectsRepo } from "./projectsRepo";
import { SettingsRepo } from "./settingsRepo";
import { TasksRepo } from "./tasksRepo";

export interface Repositories {
  projects: ProjectsRepo;
  tasks: TasksRepo;
  events: EventsRepo;
  approvals: ApprovalsRepo;
  notes: NotesRepo;
  settings: SettingsRepo;
}

export function createRepositories(db: Database.Database): Repositories {
  return {
    projects: new ProjectsRepo(db),
    tasks: new TasksRepo(db),
    events: new EventsRepo(db),
    approvals: new ApprovalsRepo(db),
    notes: new NotesRepo(db),
    settings: new SettingsRepo(db),
  };
}
