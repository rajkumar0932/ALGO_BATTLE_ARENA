import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import type { BattleState, BattleResult, BattleVerdict } from "@algobattle/types";
import type {
  BattleStartPayload,
  BattleTickPayload,
  BattleOpponentSubmittedPayload,
  BattleOpponentVerdictPayload,
  BattleEndPayload,
  SocketErrorPayload,
} from "@algobattle/types";

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

    socket.emit("battle:rejoin", { battleId });

    socket.on("battle:start", (payload: any) => {
      setBattleState({
        ...payload.battle,
        description: payload.description,
        starterCode: payload.starterCode
      });
      setRemainingSec(payload.battle.remainingSec);
    });

    socket.on("battle:tick", (payload: BattleTickPayload) => {
      if (payload.battleId === battleId) {
        setRemainingSec(payload.remainingSec);
      }
    });

    socket.on("battle:opponent_submitted", (payload: BattleOpponentSubmittedPayload) => {
      if (payload.battleId === battleId) {
        setOpponentSubmitted(true);
      }
    });

    socket.on("battle:opponent_verdict", (payload: BattleOpponentVerdictPayload) => {
      if (payload.battleId === battleId) {
        setOpponentVerdict(payload.verdict);
      }
    });

    socket.on("battle:end", (payload: BattleEndPayload) => {
      if (payload.result.battleId === battleId) {
        setBattleResult(payload.result);
      }
    });

    socket.on("battle:error", (payload: SocketErrorPayload) => {
      setError(payload.message);
    });

    socket.on("battle:submission_result", (payload: any) => {
      if (payload.battleId === battleId) {
        // We'll dispatch an event so the BattleRoom can catch it, or we could add a state
        const event = new CustomEvent('battle:my_verdict', { detail: payload });
        window.dispatchEvent(event);
      }
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

  const submitCode = useCallback(
    (code: string, language: string = "javascript") => {
      if (socket && isConnected) {
        socket.emit("battle:submit", { battleId, code, language });
      }
    },
    [socket, isConnected, battleId]
  );

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
