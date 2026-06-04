"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Loader2, ArrowRight, Bot, Shield, Zap, Crown, User, AlertTriangle, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BotTier } from "@algobattle/types";
import { SUPPORTED_LANGUAGES, getBoilerplate } from "@/lib/languages";

interface BotBattleData {
  botBattleId: string;
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  starterCode: string;
  botTier: BotTier;
  botElo: number;
}

export function BotBattleRoom({ battleData }: { battleData: BotBattleData }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(battleData.starterCode);
  const [remainingSec, setRemainingSec] = useState(600);
  
  // Game state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myVerdict, setMyVerdict] = useState<string | null>(null);
  const [botProgress, setBotProgress] = useState(0); // 0 to 100
  const [endScreen, setEndScreen] = useState<any>(null);
  
  // Fake bot typing progress
  useEffect(() => {
    if (myVerdict) return;
    
    let interval: NodeJS.Timeout;
    
    // Sigmoid-like progress (starts slow, bursts, slows down at end)
    const updateProgress = () => {
      setBotProgress(prev => {
        if (prev >= 95) return prev; // Wait at 95% until submit
        
        let increment = 1;
        if (prev < 20) increment = Math.random() * 2;
        else if (prev > 20 && prev < 80) increment = Math.random() * 5;
        else increment = Math.random() * 1;
        
        return Math.min(95, prev + increment);
      });
      
      const nextDelay = Math.random() * 2000 + 500;
      interval = setTimeout(updateProgress, nextDelay);
    };
    
    interval = setTimeout(updateProgress, 1000);
    return () => clearTimeout(interval);
  }, [myVerdict]);

  // Timer
  useEffect(() => {
    if (myVerdict || remainingSec <= 0) return;
    const interval = setInterval(() => {
      setRemainingSec((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [myVerdict, remainingSec]);

  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bot/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botBattleId: battleData.botBattleId, code, language }),
      });
      const result = await res.json();
      
      setMyVerdict(result.verdict);
      setBotProgress(100);
      
      // Delay showing end screen slightly for dramatic effect
      setTimeout(() => {
        setEndScreen(result);
      }, 1000);
      
    } catch (e) {
      console.error(e);
      alert("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-bg-primary text-gray-100">
      
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-border bg-bg-secondary flex items-center justify-between px-4 shrink-0 shadow-md z-10 relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/play/bot')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Surrender</span>
          </button>
          <div className="h-4 w-px bg-border"></div>
          <h2 className="font-bold text-gray-200 text-lg truncate max-w-[200px] sm:max-w-md">
            {battleData.problemTitle}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-primary border border-border shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className={`font-mono font-bold ${remainingSec < 60 ? "text-red-400" : "text-gray-200"}`}>
              {formatTime(remainingSec)}
            </span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !!myVerdict}
            className="btn-primary py-1.5 px-6 text-sm font-bold shadow-lg shadow-accent-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Judging
              </span>
            ) : myVerdict ? (
              "Finished"
            ) : (
              "Submit Solution"
            )}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left: Problem & Opponent status */}
        <div className="w-full md:w-[40%] xl:w-[35%] h-1/2 md:h-full flex flex-col border-r border-border bg-bg-secondary overflow-hidden shrink-0">
          
          {/* Bot Status Panel */}
          <div className="p-4 border-b border-border bg-bg-secondary shrink-0 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-200">AI {battleData.botTier}</h3>
                  <p className="text-xs text-gray-400">Elo: {battleData.botElo}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-accent-purple">{Math.floor(botProgress)}%</div>
                <div className="text-xs text-gray-500">Progress</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden relative z-10 border border-border">
              <div 
                className="h-full bg-gradient-to-r from-accent-purple to-accent-rose transition-all duration-1000 ease-out relative"
                style={{ width: `${botProgress}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            {/* Blurred fake code background for aesthetic */}
            <div className="absolute inset-0 opacity-10 pointer-events-none filter blur-sm">
              <pre className="text-[8px] leading-tight text-accent-purple p-2 select-none overflow-hidden">
                {`function solve(input) {\n  const map = new Map();\n  for(let i=0; i<input.length; i++) {\n    if(map.has(target - input[i]))\n      return [map.get(target-input[i]), i];\n    map.set(input[i], i);\n  }\n  return [];\n}`}
              </pre>
            </div>
          </div>
          
          {/* Problem Description */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-custom bg-bg-primary">
            <div className="prose prose-invert max-w-none prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {battleData.problemDescription}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="w-full md:w-[60%] xl:w-[65%] h-full flex flex-col bg-bg-primary">
          <div className="flex items-center justify-between p-2 px-4 border-b border-border bg-bg-secondary">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Language</span>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  setCode(newLang === "javascript" ? battleData.starterCode : getBoilerplate(newLang));
                }}
                disabled={!!myVerdict || isSubmitting}
                className="bg-bg-primary border border-border rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-accent-cyan"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 p-4 pb-0">
            <CodeEditor
              value={code}
              language={language}
              onChange={(val) => setCode(val || "")}
              readOnly={!!myVerdict || isSubmitting}
            />
          </div>
        </div>
        
      </div>

      {/* End Screen Overlay */}
      {endScreen && (
        <div className="absolute inset-0 z-50 bg-bg-primary/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-bg-secondary border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            
            {/* Background glow based on win/loss */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-3xl opacity-20 ${
              endScreen.winnerId === session?.user?.id ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-black mb-2">
                {endScreen.isDraw ? "It's a Draw!" : 
                 endScreen.winnerId === session?.user?.id ? "Victory!" : "Defeat!"}
              </h2>
              <p className="text-gray-400 mb-8">
                {endScreen.winnerId === session?.user?.id 
                  ? "You beat the AI!" 
                  : "The AI was faster this time."}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-bg-primary p-4 rounded-xl border border-border">
                  <div className="text-sm text-gray-500 mb-1">You</div>
                  <div className={`font-bold ${
                    endScreen.verdict === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {endScreen.verdict}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(Math.floor(endScreen.userTimeTakenMs / 1000))}
                  </div>
                </div>
                
                <div className="bg-bg-primary p-4 rounded-xl border border-border">
                  <div className="text-sm text-gray-500 mb-1">Bot</div>
                  <div className={`font-bold ${
                    endScreen.botVerdict === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {endScreen.botVerdict}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(Math.floor(endScreen.botTimeTakenMs / 1000))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Rating Change</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold">{endScreen.newRating}</span>
                    <span className={`text-sm font-bold ${
                      endScreen.eloDelta > 0 ? 'text-green-400' : 
                      endScreen.eloDelta < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {endScreen.eloDelta > 0 ? '+' : ''}{endScreen.eloDelta}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/play/bot')}
                  className="flex-1 btn-secondary py-3"
                >
                  Play Again
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="flex-1 btn-primary py-3"
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
