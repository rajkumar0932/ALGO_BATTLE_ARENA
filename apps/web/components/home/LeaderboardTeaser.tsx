"use client";

import React from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Trophy } from "lucide-react";

const LEADERS = [
  { rank: 1, name: "AlgoKing", elo: 2450, wr: "92%", record: "115W 10L", color: "text-yellow-400" },
  { rank: 2, name: "ByteMaster", elo: 2310, wr: "88%", record: "89W 12L", color: "text-gray-300" },
  { rank: 3, name: "CodeNinja", elo: 2180, wr: "81%", record: "65W 15L", color: "text-amber-600" },
  { rank: 4, name: "SpeedTypist", elo: 1950, wr: "75%", record: "45W 15L", color: "text-gray-400" },
  { rank: 5, name: "LogicPro", elo: 1890, wr: "68%", record: "34W 16L", color: "text-gray-400" },
];

export function LeaderboardTeaser() {
  return (
    <section className="py-24 relative bg-bg-primary overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">The Global Elite</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Top coders ranked by ELO rating — updated in real time
          </p>
        </ScrollReveal>

        <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-border text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex gap-16">
              <span>Rank</span>
              <span>Coder</span>
            </div>
            <div className="flex gap-16 text-right hidden sm:flex">
              <span>Record</span>
              <span>Rating</span>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {LEADERS.map((leader, i) => (
              <ScrollReveal key={leader.name} delay={i * 0.1} yOffset={20}>
                <div className="flex items-center justify-between px-6 py-4 hover:bg-bg-hover transition-colors group">
                  <div className="flex items-center gap-6 sm:gap-16 w-full sm:w-auto">
                    
                    {/* Rank */}
                    <div className="w-8 flex justify-center">
                      {leader.rank <= 3 ? (
                        <Trophy className={`w-6 h-6 ${leader.color}`} />
                      ) : (
                        <span className="text-lg font-bold text-gray-500">#{leader.rank}</span>
                      )}
                    </div>
                    
                    {/* User */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-bg-secondary border border-border group-hover:border-accent-cyan transition-colors`}>
                        {leader.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-200">{leader.name}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 sm:gap-16 text-right">
                    <div className="hidden sm:block">
                      <div className="text-sm font-semibold text-gray-300">{leader.wr} Win Rate</div>
                      <div className="text-xs text-gray-500">{leader.record}</div>
                    </div>
                    
                    <div className="font-mono text-lg font-black text-white w-16">
                      {leader.elo}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={0.6} className="text-center mt-10">
          <Link href="/leaderboard" className="btn-secondary inline-flex items-center gap-2">
            View Full Leaderboard →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
