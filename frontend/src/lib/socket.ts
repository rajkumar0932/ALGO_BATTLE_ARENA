import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@algobattle/types";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  const token = localStorage.getItem("algobattle_token");
  
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: {
        token: token
      }
    });
  } else {
    // Dynamically update token in case the user just logged in
    (socket.auth as any).token = token;
  }
  
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
