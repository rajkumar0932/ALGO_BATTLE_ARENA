import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@algobattle/types";

export function useSocket() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    if (!s.connected) {
      s.connect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    setIsConnected(s.connected);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      // We don't disconnect the socket here to allow it to persist across page navigations
    };
  }, []);

  return { socket, isConnected, disconnectSocket };
}
