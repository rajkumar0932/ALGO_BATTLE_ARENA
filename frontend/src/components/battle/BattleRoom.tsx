
import { useState, useEffect } from "react";
import { useBattle } from "@/hooks/useBattle";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { BattleTimer } from "./BattleTimer";
import { OpponentStatus } from "./OpponentStatus";
import { VerdictPanel } from "./VerdictPanel";
import { Swords, Trophy, Loader2, ArrowRight, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SUPPORTED_LANGUAGES, getBoilerplate } from "@/lib/languages";

interface BattleRoomProps {
  battleId: string;
  currentUser: { id: string; username: string };
}

export function BattleRoom({ battleId, currentUser }: BattleRoomProps) {
  const {
    battleState,
    battleResult,
    remainingSec,
    opponentVerdict,
    opponentSubmitted,
    error,
    mySubmissionResult,
    submitCode
  } = useBattle(battleId);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [myVerdict, setMyVerdict] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize code with starter code when battle starts
    if (battleState && code === "") {
      const problemCode = (battleState as any).starterCode || "// Write your solution here";
      setCode(problemCode);
    }

    // Check if we already submitted (in case of page refresh/rejoin)
    const amIP1 = battleState?.player1.userId === currentUser.id;
    const me = amIP1 ? battleState?.player1 : battleState?.player2;

    if (me?.hasSubmitted && me.verdict) {
      setMyVerdict({
        verdict: me.verdict,
        passedCases: me.passedCases,
        totalCases: me.totalCases,
        executionTimeMs: me.executionTimeMs
      });
      setIsSubmitting(false);
    }
  }, [battleState, code, currentUser.id]);

  // Handle incoming submission result from the judge
  useEffect(() => {
    if (mySubmissionResult) {
      setMyVerdict({
        verdict: mySubmissionResult.verdict,
        passedCases: mySubmissionResult.passedCases,
        totalCases: mySubmissionResult.totalCases,
        executionTimeMs: mySubmissionResult.executionTimeMs
      });
      setIsSubmitting(false);
    }
  }, [mySubmissionResult]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-accent-rose mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Battle Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/battle" className="btn-primary inline-flex items-center gap-2">
            Return to Lobby
          </Link>
        </div>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-accent-cyan mb-4" />
        <p>Connecting to battle...</p>
      </div>
    );
  }

  const amIP1 = battleState.player1.userId === currentUser.id;
  const me = amIP1 ? battleState.player1 : battleState.player2;
  const opponent = amIP1 ? battleState.player2 : battleState.player1;
  const isCompleted = battleState.phase === "COMPLETED" || !!battleResult;

  const handleSubmit = () => {
    if (!code.trim() || isSubmitting || me.hasSubmitted) return;
    setIsSubmitting(true);
    submitCode(code, language);

    // Optimistic UI for pending
    setMyVerdict({ verdict: "PENDING", passedCases: 0, totalCases: 0 });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative bg-[#0a0f1e]">
      {/* Animated Background Pulse */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,212,255,0.05) 0%, transparent 60%)',
          animation: 'pulseRadial 6s ease-in-out infinite'
        }}
      />

      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5 flex-shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-accent-cyan" />
            <span className="font-bold hidden sm:inline" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>AlgoBattle</span>
          </div>
          <div className="w-px h-6 bg-border mx-2" />
          <h2 className="font-semibold text-gray-200 max-w-[200px] sm:max-w-md truncate" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            {battleState.problemTitle}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <OpponentStatus
            username={opponent.username}
            hasSubmitted={opponentSubmitted || opponent.hasSubmitted}
            verdict={opponentVerdict || opponent.verdict || null}
            battleEnded={isCompleted}
          />
          <BattleTimer remainingSec={remainingSec} />
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 p-4 gap-4">

        {/* Left: Problem Description & Verdicts */}
        <div 
          className="w-full md:w-[40%] xl:w-[35%] h-full flex flex-col bg-[#0a0f1e] overflow-y-auto rounded-xl"
          style={{
            borderLeft: '2px solid rgba(0, 212, 255, 0.3)',
            boxShadow: '-4px 0 15px rgba(0, 212, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
            borderRight: '1px solid rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
          }}
        >
          {/* My Verdict Panel (Shows at top if submitted) */}
          {myVerdict && (
            <div className="p-4 border-b border-border bg-bg-secondary/50">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                Your Result
              </h3>
              <VerdictPanel {...myVerdict} />
            </div>
          )}

          {/* Problem Content */}
          <div className="p-6 flex-1">
            <div className="prose prose-sm prose-invert max-w-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-code:text-accent-cyan
                            prose-headings:font-bold prose-headings:text-gray-200 prose-headings:border-b-2 prose-headings:border-accent-cyan/20 prose-headings:pb-1 prose-headings:inline-block">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {(battleState as any).description || "Loading description..."}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div 
          className="w-full md:w-[60%] xl:w-[65%] h-full flex flex-col overflow-hidden rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(0, 255, 200, 0.08)',
          }}
        >
          <div className="flex items-center justify-between p-2 px-4 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Language</span>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  setCode(newLang === "javascript" ? (battleState as any).starterCode : getBoilerplate(newLang));
                }}
                disabled={me.hasSubmitted || isSubmitting || isCompleted}
                className="bg-transparent border border-white/10 rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-accent-cyan"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 p-4 pb-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <CodeEditor
              value={code}
              language={language}
              onChange={(val) => setCode(val || "")}
              readOnly={me.hasSubmitted || isSubmitting || isCompleted}
            />
          </div>

          {/* Action Bar */}
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 bg-black/20 border-t border-white/5">
            <p className="text-sm text-gray-500">
              {isCompleted ? "Battle ended. No further submissions." : "Code automatically saves."}
            </p>
            <button
              onClick={handleSubmit}
              disabled={me.hasSubmitted || isSubmitting || isCompleted}
              className="group relative overflow-hidden flex items-center gap-2 py-2 px-8 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0099bb)',
                color: '#080c18',
                boxShadow: '0 0 20px rgba(0,212,255,0.2)',
              }}
            >
              {/* Shimmer overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmerSweep 1.5s infinite'
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Judging...
                  </>
                ) : me.hasSubmitted ? (
                  <>Submitted</>
                ) : (
                  <>
                    Submit Solution
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Battle End Overlay */}
      {battleResult && (
        <div className="fixed inset-0 z-50 bg-bg-primary/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 text-center neon-border relative overflow-hidden">
            {/* Background effect based on win/loss/draw */}
            <div className={`absolute inset-0 opacity-10 pointer-events-none ${battleResult.isDraw ? "bg-gray-500" :
                battleResult.winnerId === currentUser.id ? "bg-accent-emerald" : "bg-accent-rose"
              }`} />

            <div className="relative z-10">
              <Trophy className={`w-16 h-16 mx-auto mb-6 ${battleResult.isDraw ? "text-gray-400" :
                  battleResult.winnerId === currentUser.id ? "text-accent-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "text-gray-600"
                }`} />

              <h2 className="text-3xl font-black mb-2">
                {battleResult.isDraw ? "It's a Draw!" :
                  battleResult.winnerId === currentUser.id ? "Victory!" : "Defeat"}
              </h2>

              <p className="text-gray-400 mb-8">
                {battleResult.reason === "ACCEPTED" ? (
                  battleResult.winnerId === currentUser.id ? "You solved the problem first!" : `${battleResult.winnerUsername} solved the problem first.`
                ) : battleResult.reason === "BOTH_SUBMITTED" ? (
                  "Both players submitted without full correctness. Best score wins."
                ) : battleResult.reason === "TIME_UP" ? (
                  "Time ran out. Best current score wins."
                ) : "Opponent left the match."}
              </p>

              {/* ELO Changes */}
              <div className="flex justify-center gap-8 mb-10">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Your Rating</p>
                  <p className="text-2xl font-bold text-gray-100 flex items-center justify-center gap-2">
                    {amIP1 ? battleResult.player1NewRating : battleResult.player2NewRating}
                    <span className={`text-sm ${(amIP1 ? battleResult.player1EloChange : battleResult.player2EloChange) >= 0 ? "text-accent-emerald" : "text-accent-rose"
                      }`}>
                      {(amIP1 ? battleResult.player1EloChange : battleResult.player2EloChange) >= 0 ? "+" : ""}
                      {amIP1 ? battleResult.player1EloChange : battleResult.player2EloChange}
                    </span>
                  </p>
                </div>

                <div className="w-px bg-border" />

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Opponent</p>
                  <p className="text-2xl font-bold text-gray-100 flex items-center justify-center gap-2">
                    {amIP1 ? battleResult.player2NewRating : battleResult.player1NewRating}
                    <span className={`text-sm ${(amIP1 ? battleResult.player2EloChange : battleResult.player1EloChange) >= 0 ? "text-accent-emerald" : "text-accent-rose"
                      }`}>
                      {(amIP1 ? battleResult.player2EloChange : battleResult.player1EloChange) >= 0 ? "+" : ""}
                      {amIP1 ? battleResult.player2EloChange : battleResult.player1EloChange}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link to="/dashboard" className="btn-secondary px-8">
                  Dashboard
                </Link>
                <Link to="/battle" className="btn-primary px-8 flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  Play Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
