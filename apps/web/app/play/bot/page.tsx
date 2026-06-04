"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BOT_TIERS } from "@algobattle/types";
import type { BotTier } from "@algobattle/types";
import { Bot, Swords, Loader2, ArrowRight, Shield, Zap, Crown } from "lucide-react";
import { BotBattleRoom } from "@/components/battle/BotBattleRoom";

export default function BotPlayPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedTier, setSelectedTier] = useState<BotTier | null>(null);
  const [loading, setLoading] = useState(false);
  const [battleData, setBattleData] = useState<any>(null);

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const handleChallenge = async (tier: BotTier) => {
    setSelectedTier(tier);
    setLoading(true);

    try {
      // Pick a random problem slug that the bot can solve
      const tierConfig = BOT_TIERS.find((t) => t.tier === tier)!;
      // First get available problems
      const probRes = await fetch("/api/problems");
      let problemSlug = "two-sum"; // fallback
      
      if (probRes.ok) {
        const problems = await probRes.json();
        const solvable = problems.filter((p: any) =>
          tierConfig.canSolveDifficulties.includes(p.difficulty)
        );
        if (solvable.length > 0) {
          problemSlug = solvable[Math.floor(Math.random() * solvable.length)].slug;
        }
      }

      const res = await fetch("/api/bot/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug, tier }),
      });

      if (res.ok) {
        const data = await res.json();
        setBattleData(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // If battle is active, show battle room
  if (battleData) {
    return <BotBattleRoom battleData={battleData} />;
  }

  const tierIcons: Record<string, React.ReactNode> = {
    beginner: <Shield className="w-8 h-8" />,
    rookie: <Swords className="w-8 h-8" />,
    intermediate: <Zap className="w-8 h-8" />,
    advanced: <Bot className="w-8 h-8" />,
    expert: <Swords className="w-8 h-8" />,
    grandmaster: <Crown className="w-8 h-8" />,
  };

  const tierColors: Record<string, string> = {
    beginner: '#4ade80',
    rookie: '#60a5fa',
    intermediate: '#f97316',
    advanced: '#a78bfa',
    expert: '#facc15',
    grandmaster: '#f43f5e',
  };

  return (
    <div className="min-h-screen relative bg-[#0a0f1e] overflow-hidden">
      {/* SVG Hex Pattern Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
              <path d="M25 0L50 14.4V43.3L25 57.7L0 43.3V14.4L25 0Z" fill="none" stroke="#ffffff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-rose rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            <span className="text-white">Choose Your</span> <span className="text-accent-cyan" style={{ textShadow: '0 0 20px rgba(0, 229, 255, 0.3)' }}>Opponent</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-lg">
            Practice against AI opponents of any skill level. The bot generates real solutions and simulates human-like solve times.
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent-cyan mx-auto mb-4" />
            <p className="text-gray-400 animate-pulse text-lg" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
              Initializing {selectedTier} protocols...
            </p>
          </div>
        )}

        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BOT_TIERS.map((tier) => {
              const color = tierColors[tier.tier] || tier.color;
              return (
                <button
                  key={tier.tier}
                  onClick={() => handleChallenge(tier.tier)}
                  className="group relative overflow-hidden rounded-xl text-left transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: `3px solid ${color}`,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}40`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          backgroundColor: `${color}10`, 
                          borderColor: `${color}30`, 
                          borderWidth: 1,
                          boxShadow: `0 0 15px ${color}20` 
                        }}
                      >
                        <span className="text-3xl drop-shadow-md">{tier.icon}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
                        style={{ 
                          backgroundColor: `${color}15`, 
                          color: color, 
                          border: `1px solid ${color}40`,
                          textShadow: `0 0 8px ${color}80` 
                        }}
                      >
                        {tier.elo} ELO
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-200 mb-2 transition-colors" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                      {tier.label}
                    </h3>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed min-h-[40px]">
                      {tier.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest" style={{ color: color }}>
                      <span className="opacity-70">Solves:</span> 
                      <span className="opacity-100">{tier.canSolveDifficulties.join(", ")}</span>
                    </div>

                    <div 
                      className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0"
                      style={{ color: color }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Subtle Background Glow */}
                  <div 
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none transition-opacity group-hover:opacity-30"
                    style={{ backgroundColor: color }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
