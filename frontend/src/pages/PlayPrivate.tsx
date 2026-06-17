import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/lib/auth";
import { Users, Copy, Check, ArrowRight, X, Loader2 } from "lucide-react";

export default function PlayPrivate() {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { socket, isConnected } = useSocket();

  const [mode, setMode] = useState<"SELECT" | "HOSTING" | "JOINING">("SELECT");
  const [roomCode, setRoomCode] = useState<string>("");
  const [joinInput, setJoinInput] = useState<string>(searchParams.get("code") || "");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/login");
    }
  }, [status, navigate]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomCreated = (data: { code: string }) => {
      setRoomCode(data.code);
      setMode("HOSTING");
    };

    const handleRoomError = (data: { message: string }) => {
      setErrorMsg(data.message);
      setMode("SELECT");
    };

    const handleMatched = (payload: { battleId: string }) => {
      navigate(`/battle/${payload.battleId}`);
    };

    socket.on("room:created", handleRoomCreated);
    socket.on("room:error", handleRoomError);
    socket.on("lobby:matched", handleMatched);

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:error", handleRoomError);
      socket.off("lobby:matched", handleMatched);
    };
  }, [socket, isConnected, navigate]);

  const handleCreateRoom = () => {
    if (!socket || !user) return;
    setErrorMsg("");
    setMode("HOSTING");
    
    // Clear the action from the URL so it doesn't re-trigger if they reload
    if (searchParams.get("action") === "create") {
      searchParams.delete("action");
      navigate(`/play/private`, { replace: true });
    }

    socket.emit("room:create", {
      userId: user.id,
      username: user.username,
      rating: user.rating ?? 1200,
    });
  };

  // Auto-create room if action=create is in the URL
  useEffect(() => {
    if (socket && isConnected && user && searchParams.get("action") === "create" && mode === "SELECT") {
      handleCreateRoom();
    }
  }, [socket, isConnected, user, searchParams, mode]);

  const handleJoinRoom = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!socket || !user || !joinInput.trim()) return;
    setErrorMsg("");
    setMode("JOINING");
    socket.emit("room:join", {
      userId: user.id,
      username: user.username,
      rating: user.rating ?? 1200,
    }, joinInput.trim());
  };

  const cancelHosting = () => {
    if (socket && roomCode) {
      socket.emit("room:leave", roomCode);
    }
    setMode("SELECT");
    setRoomCode("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading" || !user || !socket || !isConnected) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#0a0f1e] gap-4">
        <div className="w-8 h-8 border-2 border-accent-emerald/30 border-t-accent-emerald rounded-full animate-spin" />
        <p className="text-accent-emerald font-mono animate-pulse">Connecting to server...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#0a0f1e] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-emerald/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl border border-accent-emerald/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-emerald/10 border border-accent-emerald/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent-emerald" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
              Private Room
            </h1>
            <p className="text-gray-400 text-sm">Challenge your friends to a 1v1 battle.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm text-center">
              {errorMsg}
            </div>
          )}

          {mode === "SELECT" && (
            <div className="space-y-6">
              <button
                onClick={handleCreateRoom}
                disabled={!isConnected}
                className="w-full py-4 bg-accent-emerald text-[#080c18] font-bold rounded-xl hover:bg-accent-emerald/90 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create New Room
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Or join existing</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value.toLowerCase())}
                    placeholder="ENTER ROOM UUID"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-center text-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/50 transition-all font-mono"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isConnected || joinInput.length < 10}
                  className="w-full py-4 border border-accent-emerald/50 text-accent-emerald font-bold rounded-xl hover:bg-accent-emerald/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Join Room
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {mode === "HOSTING" && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-gray-400 text-sm mb-4">Share this code with your opponent:</p>
              
              {!roomCode ? (
                 <div className="flex justify-center items-center h-24">
                   <Loader2 className="w-8 h-8 text-accent-emerald animate-spin" />
                 </div>
              ) : (
                <>
                  <div 
                    onClick={copyCode}
                    className="group relative cursor-pointer bg-black/40 border border-accent-emerald/30 rounded-xl py-6 px-4 mb-8 hover:bg-black/60 transition-colors"
                  >
                    <div className="text-xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] break-all" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {roomCode}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-accent-emerald text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                      {copied ? (
                        <><Check className="w-4 h-4" /> Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Click to copy</>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-12 h-12 relative mb-4">
                      <div className="absolute inset-0 border-t-2 border-accent-emerald rounded-full animate-spin"></div>
                      <div className="absolute inset-2 bg-accent-emerald/20 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-accent-emerald font-semibold animate-pulse">Waiting for opponent...</p>
                  </div>
                </>
              )}

              <button
                onClick={cancelHosting}
                className="w-full py-3 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel Room
              </button>
            </div>
          )}

          {mode === "JOINING" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin"></div>
                <Users className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-emerald" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Joining Room...</h3>
              <p className="text-gray-400 text-sm font-mono tracking-widest">{joinInput}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
