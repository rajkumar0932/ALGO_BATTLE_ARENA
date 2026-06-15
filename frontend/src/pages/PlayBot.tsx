import { useEffect, useState } from "react";
import { Bot, Swords, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlayBot() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/battle/offline`, {
      credentials: "include"
    })
      .then(r => r.json())
      .then(data => {
        if (data.success || data.statusCode === 201) {
          setBots(data.data || []);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#0a0f1e] overflow-hidden">
      {/* Background scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(168, 85, 247, 0.012) 3px, rgba(168, 85, 247, 0.012) 4px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        {/* Header Section */}
        <div className="text-center mb-16 relative w-fit mx-auto px-8 py-4">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#a855f7]/80" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#a855f7]/80" />

          <h1 className="text-4xl md:text-5xl font-black mb-4 relative z-10" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Challenge <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#d946ef]" style={{ filter: "drop-shadow(0 0 15px rgba(168,85,247,0.4))" }}>AI Bots</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto relative z-10 opacity-[0.65]">
            Practice offline against simulated AI opponents. Select your difficulty and prepare for battle.
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse border border-white/10 shadow-lg"></div>
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center text-gray-500 py-12 border border-white/5 rounded-xl bg-white/5">
            No AI bots found in the database.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="group relative flex flex-col h-full bg-[#0a0f1e] overflow-hidden hover:-translate-y-1 transition-all duration-300"
                style={{
                  borderRadius: "12px",
                  border: "1px solid rgba(168,85,247,0.2)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)",
                }}
              >
                {/* Glow behind card */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                  background: "radial-gradient(circle at 50% 0%, rgba(168,85,247,0.15), transparent 70%)"
                }} />

                <div className="p-6 relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border border-[#a855f7]/30 bg-[#a855f7]/10">
                      {bot.avatar ? (
                        <img src={bot.avatar} alt={bot.pos} className="w-full h-full object-cover" />
                      ) : (
                        <Bot className="w-8 h-8 text-[#a855f7]" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="px-3 py-1 rounded bg-[#a855f7]/10 border border-[#a855f7]/30 text-xs font-bold text-[#a855f7] uppercase tracking-widest">
                        {bot.pos}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-mono text-gray-300 mt-1">
                        <Zap className="w-4 h-4 text-yellow-500" /> {bot.rating} ELO
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                    {bot.pos} AI
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-6">
                    {bot.about || bot.des || "A powerful AI opponent ready to test your algorithmic skills in a simulated environment."}
                  </p>

                  <Link
                    to={`/battle/bot/${bot.id}`}
                    className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-all group-hover:bg-[#a855f7] group-hover:text-white"
                    style={{
                      border: "1px solid rgba(168,85,247,0.5)",
                      color: "#a855f7"
                    }}
                  >
                    <Swords className="w-4 h-4" />
                    CHALLENGE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
