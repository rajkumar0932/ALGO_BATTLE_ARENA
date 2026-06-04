"use client";

import { CheckCircle2, XCircle, AlertTriangle, AlertCircle, Clock, Zap } from "lucide-react";
import type { BattleVerdict } from "@algobattle/types";

interface VerdictPanelProps {
  verdict: BattleVerdict;
  passedCases: number;
  totalCases: number;
  executionTimeMs?: number;
  error?: string;
}

export function VerdictPanel({ verdict, passedCases, totalCases, executionTimeMs, error }: VerdictPanelProps) {
  if (verdict === "PENDING") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border rounded-lg animate-pulse text-gray-400">
        <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
        <span className="font-medium">Judging submission...</span>
      </div>
    );
  }

  let icon, colorClass, bgClass, title;

  switch (verdict) {
    case "ACCEPTED":
      icon = <CheckCircle2 className="w-6 h-6" />;
      colorClass = "text-accent-emerald";
      bgClass = "bg-accent-emerald/10 border-accent-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
      title = "Accepted!";
      break;
    case "WRONG_ANSWER":
      icon = <XCircle className="w-6 h-6" />;
      colorClass = "text-accent-rose";
      bgClass = "bg-accent-rose/10 border-accent-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]";
      title = "Wrong Answer";
      break;
    case "TIME_LIMIT_EXCEEDED":
      icon = <AlertTriangle className="w-6 h-6" />;
      colorClass = "text-accent-amber";
      bgClass = "bg-accent-amber/10 border-accent-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
      title = "Time Limit Exceeded";
      break;
    case "COMPILE_ERROR":
      icon = <AlertTriangle className="w-6 h-6" />;
      colorClass = "text-accent-amber";
      bgClass = "bg-accent-amber/10 border-accent-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
      title = "Compilation Error";
      break;
    default:
      icon = <AlertCircle className="w-6 h-6" />;
      colorClass = "text-accent-rose";
      bgClass = "bg-accent-rose/10 border-accent-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]";
      title = "Runtime Error";
      break;
  }

  const isAccepted = verdict === "ACCEPTED";
  
  return (
    <div className={`p-4 rounded-xl border flex flex-col transition-all duration-500 animate-slide-up ${bgClass}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-bg-primary/50 ${colorClass}`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${colorClass}`}>{title}</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {passedCases} / {totalCases} Test Cases Passed
            </p>
          </div>
        </div>
        
        {/* Progress Bar & Stats */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <div className="w-full h-2 bg-bg-primary/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                isAccepted ? "bg-accent-emerald" : "bg-accent-rose"
              }`}
              style={{ width: `${totalCases === 0 ? 0 : (passedCases / totalCases) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-accent-amber" />
              <span>{totalCases === 0 ? 0 : Math.round((passedCases / totalCases) * 100)}%</span>
            </div>
            {executionTimeMs !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{executionTimeMs}ms</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Text Rendering */}
      {error && (
        <div className="mt-4 p-3 bg-bg-primary rounded-lg border border-border">
          <p className="text-xs font-semibold text-gray-500 mb-1">ERROR DETAILS</p>
          <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap break-all overflow-x-auto">
            {error.replace("COMPILE_ERROR:", "")}
          </pre>
        </div>
      )}
    </div>
  );
}
