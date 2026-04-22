import type { WebSocketEnvelope } from "@/types";

export function connectAgentDockSocket({
  onMessage,
  onStatus,
}: {
  onMessage: (message: WebSocketEnvelope) => void;
  onStatus?: (connected: boolean) => void;
}) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}/api/ws`);

  socket.addEventListener("open", () => onStatus?.(true));
  socket.addEventListener("close", () => onStatus?.(false));
  socket.addEventListener("message", (event) => {
    try {
      onMessage(JSON.parse(event.data) as WebSocketEnvelope);
    } catch {
      // Ignore malformed daemon messages.
    }
  });

  return () => socket.close();
}
