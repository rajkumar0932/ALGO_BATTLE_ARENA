
import { Brain, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, XCircle } from "lucide-react";
import type { BattleVerdict } from "@algobattle/types";

interface OpponentStatusProps {
  username: string;
  hasSubmitted: boolean;
  verdict: BattleVerdict | null;
  battleEnded: boolean;
}

export function OpponentStatus({ username, hasSubmitted, verdict, battleEnded }: OpponentStatusProps) {
  
  const renderStatus = () => {
    // 1. Thinking / Coding
    if (!hasSubmitted) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-hover border border-border text-xs font-medium text-gray-400">
          <Brain className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
          Thinking...
        </div>
      );
    }
    
    // 2. Submitted but battle still going (hide verdict)
    if (hasSubmitted && !battleEnded) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-amber/10 border border-accent-amber/30 text-xs font-medium text-accent-amber shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Submitted!
        </div>
      );
    }
    
    // 3. Battle ended, show verdict
    if (battleEnded && verdict) {
      switch (verdict) {
        case "ACCEPTED":
          return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 text-xs font-semibold text-accent-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accepted
            </div>
          );
        case "WRONG_ANSWER":
          return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-rose/10 border border-accent-rose/30 text-xs font-semibold text-accent-rose">
              <XCircle className="w-3.5 h-3.5" />
              Wrong Answer
            </div>
          );
        case "TIME_LIMIT_EXCEEDED":
          return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-amber/10 border border-accent-amber/30 text-xs font-semibold text-accent-amber">
              <AlertTriangle className="w-3.5 h-3.5" />
              Time Limit
            </div>
          );
        default:
          return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-rose/10 border border-accent-rose/30 text-xs font-semibold text-accent-rose">
              <AlertCircle className="w-3.5 h-3.5" />
              Error
            </div>
          );
      }
    }

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-hover border border-border text-xs font-medium text-gray-500">
        <HelpCircle className="w-3.5 h-3.5" />
        Unknown
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-300 max-w-[120px] truncate" title={username}>
        {username}
      </span>
      {renderStatus()}
    </div>
  );
}
