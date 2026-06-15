import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem("algobattle_token");
    socket = io(API_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: {
        token: token,
      },
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
