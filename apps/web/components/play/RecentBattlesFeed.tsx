"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Trophy, XCircle } from "lucide-react";

// 10 line timeAgo implementation
function timeAgo(date: number) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

export function RecentBattlesFeed() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const battles = useMemo(() => {
    const names = ["kumarraj0932", "AlgoKing", "ByteMaster", "CodeNinja", "SpeedTypist"];
    const problems = ["Two Sum", "Valid Parentheses", "Merge Intervals", "LRU Cache"];
    
    return Array.from({ length: 4 }).map((_, i) => {
      const isWin = Math.random() > 0.3;
      return {
        id: i,
        player1: names[Math.floor(Math.random() * names.length)],
        player2: "opponent",
        problem: problems[Math.floor(Math.random() * problems.length)],
        isWin,
        timestamp: Date.now() - Math.random() * 3600000 - (i * 600000), // Staggered over last hour
        duration: `${Math.floor(Math.random() * 10) + 1}m ${Math.floor(Math.random() * 60)}s`,
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  return (
    <div className="mt-20 relative">
      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.4); }
        }
      `}</style>
      <ScrollReveal yOffset={20}>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00e5ff', animation: 'pulseDot 2s infinite' }}></span>
          Live Battle Feed
        </h3>
        
        <div className="rounded-xl overflow-hidden" style={{
          borderLeft: '1px solid rgba(0,229,255,0.1)',
          background: 'rgba(255,255,255,0.015)'
        }}>
          <div className="divide-y divide-white/5">
            {battles.map((battle) => (
              <div 
                key={battle.id} 
                className="p-4 sm:px-6 flex items-center justify-between transition-colors group/row"
                style={{ borderLeft: '3px solid transparent' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderLeftColor = 'rgba(0,229,255,0.4)';
                  e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/40 border ${battle.isWin ? 'border-[#00e5ff]/30 text-[#00e5ff]' : 'border-accent-rose/30 text-accent-rose'}`} style={{
                    boxShadow: battle.isWin ? '0 0 10px rgba(0,229,255,0.2)' : 'none'
                  }}>
                    {battle.isWin ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="font-bold text-gray-200">{battle.player1}</span>
                      <span className="text-gray-500 mx-2">{battle.isWin ? 'beat' : 'lost to'}</span>
                      <span className="font-bold text-gray-200">{battle.player2}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      in <span className="font-mono" style={{ color: '#00e5ff', textShadow: '0 0 6px rgba(0,229,255,0.3)' }}>{battle.problem}</span> • {battle.duration}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {timeAgo(battle.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
