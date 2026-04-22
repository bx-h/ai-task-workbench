import { EventEmitter } from "node:events";
import type { TaskEvent, WebSocketEnvelope } from "../../shared/events";
import type { Repositories } from "../db/repositories";

interface ClientSocket {
  readyState: number;
  send: (data: string) => void;
}

const socketOpen = 1;

export class EventBus {
  private readonly emitter = new EventEmitter();
  private readonly clients = new Set<ClientSocket>();

  constructor(private readonly repos: Repositories) {}

  registerClient(socket: ClientSocket) {
    this.clients.add(socket);
    socket.send(JSON.stringify({ type: "hello", payload: { ok: true } } satisfies WebSocketEnvelope));
    return () => this.clients.delete(socket);
  }

  onTaskEvent(listener: (event: TaskEvent) => void) {
    this.emitter.on("task_event", listener);
    return () => this.emitter.off("task_event", listener);
  }

  append(event: Omit<TaskEvent, "seq"> & { taskId: string; projectId: string; createdAt: string }): TaskEvent {
    const saved = this.repos.events.append(event);
    this.emit({ type: "task_event", taskId: saved.taskId, projectId: saved.projectId, event: saved });
    this.emitter.emit("task_event", saved);
    return saved;
  }

  emit(envelope: WebSocketEnvelope) {
    const data = JSON.stringify(envelope);
    for (const client of this.clients) {
      if (client.readyState === socketOpen) {
        client.send(data);
      }
    }
  }
}
