import type { Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, SocketData, LobbyJoinPayload } from "@algobattle/types";
import { addToQueue, removeFromQueue } from "../services/matchmaking";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export function registerLobbyHandlers(socket: TypedSocket) {
  socket.on("lobby:join", (payload: LobbyJoinPayload) => {
    console.log(`[Socket] ${socket.id} joined lobby as ${payload.username}`);
    // Attach user data to socket
    socket.data.userId = payload.userId;
    socket.data.username = payload.username;
    socket.data.rating = payload.rating;

    // Add to matchmaking queue
    addToQueue(socket.id, payload);
    
    // Notify client that they are searching
    socket.emit("lobby:searching", { message: "Looking for an opponent..." });
  });

  socket.on("lobby:leave", () => {
    console.log(`[Socket] ${socket.id} left lobby`);
    removeFromQueue(socket.id);
  });
}
