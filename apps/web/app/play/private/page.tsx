"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Users, Plus, LogIn, Copy, Check, ArrowRight, Settings2,
  Clock, Trophy, Swords, Loader2, X, Sparkles
} from "lucide-react";

export default function PrivateRoomPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");

  // Create room state
  const [problemSelection, setProblemSelection] = useState<"random" | "by-difficulty">("random");
  const [problemDifficulty, setProblemDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [timeLimit, setTimeLimit] = useState(1800);
  const [scoringMode, setScoringMode] = useState("standard");
  const [isRanked, setIsRanked] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Join room state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [roomInfo, setRoomInfo] = useState<any>(null);

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSelection,
          problemDifficulty: problemSelection === "by-difficulty" ? problemDifficulty : undefined,
          timeLimit,
          scoringMode,
          isRanked,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedCode(data.code);
      }
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCodeInput = async (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 6);
    setJoinCode(cleaned);
    setJoinError("");
    setRoomInfo(null);

    // Auto-validate when 6 chars entered
    if (cleaned.length === 6) {
      try {
        const res = await fetch(`/api/rooms/${cleaned}`);
        if (res.ok) {
          const info = await res.json();
          setRoomInfo(info);
        } else {
          const err = await res.json();
          setJoinError(err.error || "Room not found");
        }
      } catch {
        setJoinError("Connection error");
      }
    }
  };

  const handleJoin = async () => {
    if (joinCode.length !== 6) return;
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/rooms/${joinCode}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push(`/battle/${data.battleId}`);
      } else {
        setJoinError(data.error || "Failed to join");
      }
    } catch {
      setJoinError("Connection error");
    } finally {
      setJoining(false);
    }
  };

  // ─── Choose Mode ─────────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-purple/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4">Private Room</h1>
          <p className="text-gray-400">Challenge a friend with a room code</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <button
            onClick={() => setMode("create")}
            className="glass-card p-8 neon-border text-left group hover:border-accent-cyan/50 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center mb-4 group-hover:bg-accent-cyan/20 transition-colors">
              <Plus className="w-6 h-6 text-accent-cyan" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create Room</h2>
            <p className="text-sm text-gray-400">Set up a room and share the code with your friend</p>
          </button>

          <button
            onClick={() => setMode("join")}
            className="glass-card p-8 neon-border text-left group hover:border-accent-purple/50 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-4 group-hover:bg-accent-purple/20 transition-colors">
              <LogIn className="w-6 h-6 text-accent-purple" />
            </div>
            <h2 className="text-xl font-bold mb-2">Join Room</h2>
            <p className="text-sm text-gray-400">Enter a 6-character code to join your friend&apos;s room</p>
          </button>
        </div>
      </div>
    );
  }

  // ─── Create Room ─────────────────────────────────────
  if (mode === "create") {
    if (createdCode) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="glass-card p-10 neon-border relative overflow-hidden">
            <div className="absolute inset-0 bg-accent-cyan/5 pointer-events-none" />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-accent-cyan mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Room Created!</h2>
              <p className="text-gray-400 mb-8">Share this code with your friend</p>

              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex gap-2">
                  {createdCode.split("").map((char, i) => (
                    <div
                      key={i}
                      className="w-14 h-16 bg-bg-secondary border-2 border-accent-cyan/30 rounded-xl flex items-center justify-center text-2xl font-black text-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <button onClick={handleCopy} className="p-3 rounded-lg bg-bg-secondary border border-border hover:border-accent-cyan/30 transition-colors">
                  {copied ? <Check className="w-5 h-5 text-accent-emerald" /> : <Copy className="w-5 h-5 text-gray-400" />}
                </button>
              </div>

              <p className="text-sm text-gray-500 animate-pulse">
                <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                Waiting for opponent to join...
              </p>
            </div>
          </div>
          <button onClick={() => { setMode("choose"); setCreatedCode(null); }} className="mt-6 text-sm text-gray-500 hover:text-gray-300">
            Cancel Room
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => setMode("choose")} className="text-sm text-gray-400 hover:text-gray-200 mb-6 flex items-center gap-1">
          <X className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Settings2 className="w-7 h-7 text-accent-cyan" /> Room Settings
        </h1>
        <p className="text-gray-400 mb-8">Configure your battle room</p>

        <div className="glass-card neon-border p-8 space-y-6">
          {/* Problem Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Problem</label>
            <div className="grid grid-cols-2 gap-3">
              {(["random", "by-difficulty"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setProblemSelection(opt)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    problemSelection === opt
                      ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"
                      : "bg-bg-secondary border-border text-gray-400 hover:border-border-hover"
                  }`}
                >
                  {opt === "random" ? "Random" : "By Difficulty"}
                </button>
              ))}
            </div>
            {problemSelection === "by-difficulty" && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setProblemDifficulty(d)}
                    className={`p-2 rounded-lg border text-sm font-semibold transition-all ${
                      problemDifficulty === d
                        ? d === "EASY" ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald" :
                          d === "MEDIUM" ? "bg-accent-amber/10 border-accent-amber/30 text-accent-amber" :
                          "bg-accent-rose/10 border-accent-rose/30 text-accent-rose"
                        : "bg-bg-secondary border-border text-gray-500"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Time Limit
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[{ label: "15 min", val: 900 }, { label: "30 min", val: 1800 }, { label: "45 min", val: 2700 }, { label: "60 min", val: 3600 }].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setTimeLimit(t.val)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    timeLimit === t.val
                      ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"
                      : "bg-bg-secondary border-border text-gray-400 hover:border-border-hover"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ranked toggle */}
          <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border">
            <div>
              <p className="font-medium text-gray-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent-amber" /> Ranked Match
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Affects your ELO rating</p>
            </div>
            <button
              onClick={() => setIsRanked(!isRanked)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isRanked ? "bg-accent-cyan" : "bg-gray-700"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isRanked ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <button onClick={handleCreate} disabled={creating} className="btn-primary w-full flex items-center justify-center gap-2">
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Room
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Join Room ───────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <button onClick={() => setMode("choose")} className="text-sm text-gray-400 hover:text-gray-200 mb-6 flex items-center gap-1">
        <X className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Join Room</h1>
        <p className="text-gray-400">Enter the 6-character code from your friend</p>
      </div>

      <div className="glass-card neon-border p-8">
        {/* Code Input — individual character boxes */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                joinCode[i]
                  ? "bg-bg-secondary border-accent-cyan/40 text-accent-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]"
                  : "bg-bg-secondary border-border text-gray-700"
              }`}
            >
              {joinCode[i] || "·"}
            </div>
          ))}
        </div>

        <input
          type="text"
          value={joinCode}
          onChange={(e) => handleCodeInput(e.target.value)}
          className="input-field text-center text-lg font-mono tracking-[0.5em] uppercase mb-4"
          placeholder="XXXXXX"
          maxLength={6}
          autoFocus
        />

        {joinError && (
          <p className="text-accent-rose text-sm text-center mb-4">{joinError}</p>
        )}

        {/* Room info preview */}
        {roomInfo && (
          <div className="p-4 bg-bg-secondary rounded-xl border border-accent-cyan/20 mb-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Room hosted by</p>
                <p className="font-bold text-gray-200">{roomInfo.hostUsername}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Rating</p>
                <p className="font-bold text-accent-amber">{roomInfo.hostRating}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-bg-hover text-gray-400 border border-border">
                <Clock className="w-3 h-3 inline mr-1" />{roomInfo.timeLimit / 60} min
              </span>
              {roomInfo.isRanked && (
                <span className="px-2 py-1 rounded-full bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                  <Trophy className="w-3 h-3 inline mr-1" />Ranked
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joinCode.length !== 6 || joining || !roomInfo}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {joining ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Swords className="w-4 h-4" /> Join Battle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
