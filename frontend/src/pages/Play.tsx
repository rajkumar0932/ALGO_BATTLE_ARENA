import { Link } from "react-router-dom";
import { Swords, Bot, Users } from "lucide-react";
import { MathSymbolsBg } from "@/components/ui/MathSymbolsBg";
import { RecentBattlesFeed } from "@/components/play/RecentBattlesFeed";

export default function Play() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#0a0f1e]">
      {/* Background scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0, 229, 255, 0.012) 3px, rgba(0, 229, 255, 0.012) 4px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-16 relative w-fit mx-auto px-8 py-4">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent-cyan/80" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent-cyan/80" />
          <h1
            className="text-4xl md:text-5xl font-black mb-4 relative z-10"
            style={{ fontFamily: "'Chakra Petch', sans-serif" }}
          >
            Choose Your{" "}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple"
              style={{ filter: "drop-shadow(0 0 15px rgba(0,229,255,0.4))" }}
            >
              Battle Mode
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto relative z-10 opacity-[0.65]">
            Whether you want to climb the ranks, practice against AI, or challenge a friend, there's a mode for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Ranked 1v1 */}
          <Link
            to="/battle"
            className="group flex flex-col h-full relative hover:-translate-y-[3px] transition-transform duration-200"
            style={{
              background: "rgba(255, 255, 255, 0.025)",
              borderRadius: "12px",
              borderTop: "2px solid #00e5ff",
              boxShadow: "0 -4px 20px rgba(0,229,255,0.15)",
            }}
          >
            <div className="p-8 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-[#00e5ff]/20 bg-[#00e5ff]/10">
                  <Swords className="w-8 h-8 text-[#00e5ff] group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-gray-300"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
                  </span>
                  12 in queue
                </div>
              </div>
              <h2
                className="text-2xl font-bold text-gray-100 mb-3 group-hover:text-[#00e5ff] transition-colors"
                style={{ fontFamily: "'Chakra Petch', sans-serif" }}
              >
                Ranked 1v1
              </h2>
              <p className="text-gray-400 leading-relaxed flex-1">
                Match with a random opponent at your skill level. Earn ELO and climb the global leaderboard.
              </p>
              <div
                className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-[#080c18] py-3 rounded-lg overflow-hidden relative group/btn"
                style={{ background: "linear-gradient(135deg, #00e5ff, #0284c7)" }}
              >
                <span className="relative z-10">Enter Queue</span>
                <span className="relative z-10 group-hover/btn:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* vs AI Bot */}
          <Link
            to="/play/bot"
            className="group flex flex-col h-full relative overflow-hidden hover:-translate-y-[3px] transition-all duration-200"
            style={{ background: "rgba(255, 255, 255, 0.025)", borderRadius: "12px", border: "1px solid transparent" }}
          >
            <div className="p-8 flex flex-col h-full relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-[#a855f7]/30 bg-[#a855f7]/10">
                  <Bot className="w-8 h-8 text-[#a855f7]" />
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: "rgba(168,85,247,0.15)", border: "1px solid #a855f7", color: "#a855f7" }}
                >
                  Most Popular
                </div>
              </div>
              <h2
                className="text-2xl font-bold text-gray-100 mb-3 group-hover:text-[#a855f7] transition-colors"
                style={{ fontFamily: "'Chakra Petch', sans-serif" }}
              >
                vs AI Bot
              </h2>
              <p className="text-gray-400 leading-relaxed flex-1">
                Practice offline against simulated AI opponents of any skill level, from Beginner to Grandmaster.
              </p>
              <div
                className="mt-6 flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-lg transition-colors group/btn hover:bg-[#a855f7]/15"
                style={{ border: "1px solid rgba(168,85,247,0.5)", color: "#a855f7" }}
              >
                Select Difficulty <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Private Room */}
          <div
            className="group flex flex-col h-full relative hover:-translate-y-[3px] transition-transform duration-200"
            style={{
              background: "rgba(255, 255, 255, 0.025)",
              borderRadius: "12px",
              borderRight: "2px solid #10b981",
              boxShadow: "4px 0 20px rgba(16,185,129,0.05)",
            }}
          >
            <div className="p-8 flex flex-col h-full z-10">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-[#10b981]/30 bg-[#10b981]/10 mb-6">
                <Users className="w-8 h-8 text-[#10b981]" />
              </div>
              <h2
                className="text-2xl font-bold text-gray-100 mb-3 group-hover:text-[#10b981] transition-colors"
                style={{ fontFamily: "'Chakra Petch', sans-serif" }}
              >
                Private Room
              </h2>
              <p className="text-gray-400 leading-relaxed flex-1 mb-6">
                Create a private room with a 6-character code and challenge a friend with custom rules.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/play/private"
                  className="flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-lg transition-all hover:bg-[#10b981]/15"
                  style={{ border: "1px solid rgba(16,185,129,0.4)", color: "#10b981" }}
                >
                  Create Room
                </Link>
                <div className="relative group/form mt-2">
                  <input
                    type="text"
                    placeholder="ENTER 6-CHAR CODE"
                    className="w-full bg-transparent border-b border-[#10b981]/30 px-4 py-3 text-sm text-center uppercase focus:outline-none focus:border-[#10b981] transition-colors text-white placeholder:text-gray-600"
                    style={{ letterSpacing: "0.3em", fontFamily: "'JetBrains Mono', monospace" }}
                    maxLength={6}
                  />
                  <div className="absolute inset-y-1 right-1 flex items-center justify-center opacity-0 group-hover/form:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button className="bg-[#10b981] text-[#080c18] font-bold text-xs px-3 py-1.5 rounded hover:bg-[#10b981]/90">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecentBattlesFeed />
      </div>
    </div>
  );
}
