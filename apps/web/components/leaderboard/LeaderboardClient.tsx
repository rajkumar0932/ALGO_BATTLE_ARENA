"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Medal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import confetti from "canvas-confetti";

type User = {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
};

export function LeaderboardClient({ 
  users, 
  currentUserId 
}: { 
  users: User[],
  currentUserId?: string 
}) {
  const [timeFilter, setTimeFilter] = useState<"ALL" | "WEEK" | "TODAY">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const currentUser = currentUserIndex !== -1 ? users[currentUserIndex] : null;
  const currentUserRank = currentUserIndex + 1;

  useEffect(() => {
    if (currentUserRank > 0 && currentUserRank <= 3) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00d4ff', '#8b5cf6', '#f97316']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00d4ff', '#8b5cf6', '#f97316']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [currentUserRank]);

  // Mocked ELO changes for demo
  const getMockEloChange = (rank: number) => {
    if (rank % 3 === 0) return { val: -8, color: "text-[#f43f5e]" };
    return { val: Math.floor(Math.random() * 20) + 1, color: "text-[#4ade80]" };
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Time Toggle */}
      <div className="flex justify-center mb-16 relative z-10">
        <div className="flex gap-2">
          {["All Time", "This Week", "Today"].map((t) => {
            const val = t === "All Time" ? "ALL" : t === "This Week" ? "WEEK" : "TODAY";
            const isActive = timeFilter === val;
            return (
              <button
                key={t}
                onClick={() => setTimeFilter(val as any)}
                className="px-6 py-2 rounded text-sm font-bold transition-all border"
                style={{
                  background: isActive ? 'rgba(251,191,36,0.1)' : 'transparent',
                  borderColor: isActive ? '#fbbf24' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16 px-4 pt-16 mt-8">
        {/* Rank 2 (Silver) */}
        {top3[1] && (
          <PodiumCard user={top3[1]} rank={2} color="rgba(148,163,184,0.1)" borderColor="rgba(148,163,184,0.35)" iconColor="text-[#94a3b8]" textBorderColor="#94a3b8" delay={0.2} />
        )}
        
        {/* Rank 1 (Gold) */}
        {top3[0] && (
          <PodiumCard user={top3[0]} rank={1} color="linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))" borderColor="rgba(251,191,36,0.4)" iconColor="text-[#fbbf24]" textBorderColor="#fbbf24" delay={0.1} isCenter />
        )}

        {/* Rank 3 (Bronze) */}
        {top3[2] && (
          <PodiumCard user={top3[2]} rank={3} color="rgba(180,83,9,0.1)" borderColor="rgba(180,83,9,0.35)" iconColor="text-[#b45309]" textBorderColor="#b45309" delay={0.3} />
        )}
      </div>

      {/* Current User Pinned Row (if logged in and not top 3) */}
      {currentUser && currentUserRank > 3 && (
        <div className="mb-8">
          <div className="text-xs font-bold text-[#00e5ff] uppercase tracking-wider mb-2 ml-4">Your Rank</div>
          <div className="rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,212,255,0.1)]" style={{ border: '2px solid rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.05)' }}>
            <LeaderboardRow 
              user={currentUser} 
              rank={currentUserRank} 
              isExpanded={expandedId === currentUser.id}
              onToggle={() => setExpandedId(expandedId === currentUser.id ? null : currentUser.id)}
              mockEloChange={getMockEloChange(currentUserRank)}
            />
          </div>
        </div>
      )}

      {/* Rest of Table */}
      <div className="rounded-xl overflow-hidden bg-transparent mt-4">
        {/* Rows */}
        <div className="flex flex-col">
          {rest.map((user, i) => {
            const rank = i + 4; // Since top 3 are in podium
            return (
              <LeaderboardRow 
                key={user.id} 
                user={user} 
                rank={rank} 
                isExpanded={expandedId === user.id}
                onToggle={() => setExpandedId(expandedId === user.id ? null : user.id)}
                mockEloChange={getMockEloChange(rank)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ user, rank, color, borderColor, iconColor, textBorderColor, delay, isCenter = false }: any) {
  const winRate = ((user.wins / (user.wins + user.losses + user.draws)) * 100).toFixed(1);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: isCenter ? -20 : 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`relative flex-1 w-full md:w-64 rounded-xl flex flex-col items-center p-6 ${isCenter ? '-mt-10' : ''}`}
      style={{ 
        zIndex: isCenter ? 10 : 1,
        background: color,
        border: `1px solid ${borderColor}`,
        boxShadow: isCenter ? '0 0 30px rgba(251,191,36,0.2), inset 0 1px 0 rgba(251,191,36,0.15)' : 'none'
      }}
    >
      <div style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '48px', color: textBorderColor, opacity: 0.08, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>
        #{rank}
      </div>

      <div className="absolute -top-8 w-16 h-16 rounded-full flex items-center justify-center bg-[#0a0f1e]" style={{ 
        border: `2px solid ${borderColor}`,
        boxShadow: isCenter ? '0 0 20px rgba(251,191,36,0.6)' : 'none',
        animation: 'floatOffset 4.5s ease-in-out infinite'
      }}>
        <Medal className={`w-8 h-8 ${iconColor}`} />
      </div>
      
      <div className="mt-8 text-center z-10 relative">
        <Link href={`/profile/${user.username}`} className="text-xl text-white hover:text-[#00e5ff] transition-colors" style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}>
          {user.username}
        </Link>
        <div className="font-mono text-2xl mt-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: textBorderColor }}>
          <CountUp end={user.rating} duration={2} />
        </div>
        <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Rating</div>
        
        <div className="mt-6 flex flex-col gap-2 w-full pt-4 border-t border-white/10">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Win Rate:</span>
            <span className="text-gray-200 font-bold">{winRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Record:</span>
            <span className="text-gray-200 font-bold">{user.wins}W - {user.losses}L</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardRow({ user, rank, isExpanded, onToggle, mockEloChange }: any) {
  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : "0.0";

  return (
    <div 
      className="flex flex-col transition-all duration-150 group/row relative cursor-pointer"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: '2px solid transparent', background: 'transparent' }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = 'rgba(251,191,36,0.03)';
        e.currentTarget.style.borderLeftColor = '#00e5ff';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderLeftColor = 'transparent';
      }}
      onClick={onToggle}
    >
      <div className="grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 items-center">
        
        {/* Rank */}
        <div className="w-12 flex justify-center font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>
          <CountUp end={rank} duration={1} />
        </div>
        
        {/* User */}
        <div className="flex items-center gap-3">
          <Link href={`/profile/${user.username}`} className="text-white group-hover/row:text-[#00e5ff] transition-colors" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 600 }}>
            {user.username}
          </Link>
        </div>

        {/* Rating */}
        <div className="w-32 flex items-center justify-center gap-2">
          <span className="text-white" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{user.rating}</span>
          <span className={`text-xs font-bold ${mockEloChange.color} font-mono ml-2`}>
            {mockEloChange.val > 0 ? '+' : ''}{mockEloChange.val}
          </span>
        </div>

        {/* Win Rate */}
        <div className="w-32 text-right">
          <div className="text-sm font-bold text-gray-300 font-mono">{winRate}%</div>
        </div>

        {/* Expand Action */}
        <div className="w-12 flex justify-end">
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Mini Stats */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
              <div>
                <span className="text-gray-500 block mb-1">Total Battles</span>
                <span className="font-bold text-gray-200 font-mono">{totalGames}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Record</span>
                <span className="font-bold text-[#4ade80] font-mono">{user.wins}W</span>
                <span className="text-gray-600 mx-1">-</span>
                <span className="font-bold text-[#f43f5e] font-mono">{user.losses}L</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Favorite Problem</span>
                <span className="font-bold text-[#a855f7]">Two Sum</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Avg Solve Time</span>
                <span className="font-bold text-[#f97316] font-mono">4m 12s</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
