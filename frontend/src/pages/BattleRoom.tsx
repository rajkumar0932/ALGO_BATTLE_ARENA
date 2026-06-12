import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { BattleRoom } from "@/components/battle/BattleRoom";

export default function BattleRoomPage() {
  const { battleId } = useParams<{ battleId: string }>();
  const { user, status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/login");
    }
  }, [status, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c18]">
        <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !battleId) return null;

  return (
    <BattleRoom
      battleId={battleId}
      currentUser={{ id: user.id, username: user.username }}
    />
  );
}
