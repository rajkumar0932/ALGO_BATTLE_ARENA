
import { Clock } from "lucide-react";

interface BattleTimerProps {
  remainingSec: number | null;
}

export function BattleTimer({ remainingSec }: BattleTimerProps) {
  if (remainingSec === null) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-lg border border-border text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="font-mono font-medium">--:--</span>
      </div>
    );
  }

  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isLow = remainingSec <= 60;
  
  return (
    <div 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono font-bold transition-colors duration-300 ${
        isLow 
          ? "bg-accent-rose/10 text-accent-rose" 
          : "bg-bg-secondary border-border text-gray-200"
      }`}
      style={{
        animation: isLow ? 'heartbeatGlow 2s infinite' : 'none',
        fontFamily: "'Chakra Petch', sans-serif"
      }}
    >
      <Clock className={`w-4 h-4 ${isLow ? "text-accent-rose" : "text-accent-cyan"}`} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{timeStr}</span>
    </div>
  );
}
