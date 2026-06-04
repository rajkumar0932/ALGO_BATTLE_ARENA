import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import type { BattleState, BattleResult, BattleVerdict } from "@algobattle/types";

export function useBattle(battleId: string) {
  const { socket, isConnected } = useSocket();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [opponentVerdict, setOpponentVerdict] = useState<BattleVerdict | null>(null);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join battle room or rejoin if already started
    socket.emit("battle:rejoin", { battleId });

    socket.on("battle:start", (payload) => {
      setBattleState(payload.battle);
      setRemainingSec(payload.battle.remainingSec);
    });

    socket.on("battle:tick", (payload) => {
      if (payload.battleId === battleId) {
        setRemainingSec(payload.remainingSec);
      }
    });

    socket.on("battle:opponent_submitted", (payload) => {
      if (payload.battleId === battleId) {
        setOpponentSubmitted(true);
      }
    });

    socket.on("battle:opponent_verdict", (payload) => {
      if (payload.battleId === battleId) {
        setOpponentVerdict(payload.verdict);
      }
    });

    socket.on("battle:end", (payload) => {
      if (payload.result.battleId === battleId) {
        setBattleResult(payload.result);
      }
    });

    socket.on("battle:error", (payload) => {
      setError(payload.message);
    });

    return () => {
      socket.emit("battle:leave", { battleId });
      socket.off("battle:start");
      socket.off("battle:tick");
      socket.off("battle:opponent_submitted");
      socket.off("battle:opponent_verdict");
      socket.off("battle:end");
      socket.off("battle:error");
    };
  }, [socket, isConnected, battleId]);

  const submitCode = useCallback((code: string, language: string = "javascript") => {
    if (socket && isConnected) {
      socket.emit("battle:submit", { battleId, code, language });
    }
  }, [socket, isConnected, battleId]);

  return {
    battleState,
    battleResult,
    remainingSec,
    opponentVerdict,
    opponentSubmitted,
    error,
    submitCode,
    isConnected,
  };
}
