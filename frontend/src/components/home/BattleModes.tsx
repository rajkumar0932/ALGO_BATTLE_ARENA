
import React from "react";
import { Link } from "react-router-dom";
import { Swords, Bot, Users, Check } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function BattleModes() {
  return (
    <section className="py-24 relative bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Choose Your Arena</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Play exactly how you want. Train against bots, challenge friends, or climb the ranks.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1 - Ranked 1v1 */}
          <ScrollReveal delay={0.1} yOffset={30} className="h-full">
            <Link to="/battle" className="glass-card p-8 rounded-2xl neon-border hover:border-accent-cyan/40 transition-all duration-300 group relative overflow-hidden flex flex-col h-full bg-bg-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-cyan/15 transition-all"></div>
              
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center relative">
                  <Swords className="w-7 h-7 text-accent-cyan group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent-rose/10 text-accent-rose border border-accent-rose/20">
                  Competitive
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-accent-cyan transition-colors">Ranked 1v1</h3>
              
              <ul className="space-y-3 mb-8 flex-1">
                {["ELO rating on the line", "Skill-based matchmaking", "10 minute time limit", "Global leaderboard rankings"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="btn-primary w-full text-center py-2.5">
                Enter Queue →
              </div>
            </Link>
          </ScrollReveal>



          {/* Card 3 - Private Room */}
          <ScrollReveal delay={0.3} yOffset={30} className="h-full">
            <Link to="/play/private" className="glass-card p-8 rounded-2xl border border-border hover:border-accent-green/40 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300 group relative overflow-hidden flex flex-col h-full bg-bg-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-green/15 transition-all"></div>
              
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center relative">
                  <Users className="w-7 h-7 text-accent-green group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent-green/10 text-accent-green border border-accent-green/20">
                  Social
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-accent-green transition-colors">Private Room</h3>
              
              <ul className="space-y-3 mb-8 flex-1">
                {["6-character room codes", "Play against friends", "Custom game rules", "Spectator mode (Coming Soon)"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="btn-secondary w-full text-center py-2.5 group-hover:border-accent-green/50 group-hover:text-accent-green transition-colors">
                Create Room →
              </div>
            </Link>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
