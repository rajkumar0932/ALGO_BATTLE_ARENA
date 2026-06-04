"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { Swords, X, Loader2 } from "lucide-react";

interface MatchmakingLobbyProps {
  user: {
    id: string;
    username: string;
    rating: number;
  };
}

export function MatchmakingLobby({ user }: MatchmakingLobbyProps) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [isSearching, setIsSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleSearching = (payload: { message: string }) => {
      setStatusMsg(payload.message);
    };

    const handleMatched = (payload: { battleId: string; opponent: any }) => {
      setMatchFound(true);
      setStatusMsg(`Match found against ${payload.opponent.username}!`);
      
      // Short delay for visual effect, then redirect to battle room
      setTimeout(() => {
        router.push(`/battle/${payload.battleId}`);
      }, 1500);
    };

    socket.on("lobby:searching", handleSearching);
    socket.on("lobby:matched", handleMatched);

    return () => {
      socket.off("lobby:searching", handleSearching);
      socket.off("lobby:matched", handleMatched);
    };
  }, [socket, isConnected, router]);

  const joinQueue = () => {
    if (!socket || !isConnected) return;
    setIsSearching(true);
    setStatusMsg("Connecting to matchmaking...");
    socket.emit("lobby:join", {
      userId: user.id,
      username: user.username,
      rating: user.rating,
    });
  };

  const leaveQueue = () => {
    if (!socket || !isConnected) return;
    socket.emit("lobby:leave");
    setIsSearching(false);
    setStatusMsg("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <div className="glass-card p-10 text-center relative overflow-hidden neon-border">
        {/* Background glow when searching */}
        {isSearching && !matchFound && (
          <div className="absolute inset-0 bg-accent-cyan/5 animate-pulse-slow pointer-events-none" />
        )}
        
        {matchFound && (
          <div className="absolute inset-0 bg-accent-emerald/10 pointer-events-none" />
        )}

        <div className="relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-accent-cyan/20">
            <Swords className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-gray-100">
            {matchFound ? "Match Found!" : "Battle Arena"}
          </h1>
          
          <p className="text-gray-400 mb-10 max-w-md mx-auto h-12">
            {statusMsg || "Ready to prove your skills? Join the matchmaking queue to find an opponent with a similar rating."}
          </p>

          <div className="flex justify-center h-16">
            {!isSearching ? (
              <button
                onClick={joinQueue}
                disabled={!isConnected}
                className="btn-primary text-lg px-8 h-full flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                {!isConnected ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5" />
                    Find Battle
                  </>
                )}
              </button>
            ) : matchFound ? (
              <div className="h-full flex items-center justify-center text-accent-emerald font-semibold text-lg animate-pulse">
                Entering Battle Room...
              </div>
            ) : (
              <button
                onClick={leaveQueue}
                className="btn-secondary h-full px-8 flex items-center gap-3 w-full sm:w-auto justify-center hover:border-accent-rose/50 hover:text-accent-rose group"
              >
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin group-hover:hidden" />
                <X className="w-5 h-5 hidden group-hover:block" />
                Cancel Search
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Current User Stats summary below */}
      <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
        <div>Playing as <span className="font-semibold text-gray-300">{user.username}</span></div>
        <div className="w-px h-5 bg-border" />
        <div>Rating <span className="font-semibold text-accent-cyan">{user.rating}</span></div>
      </div>
    </div>
  );
}
