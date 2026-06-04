import { prisma } from "@algobattle/db";
import { Trophy } from "lucide-react";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { auth } from "@/lib/auth";

export default async function LeaderboardPage() {
  const session = await auth();
  
  const topUsers = await prisma.user.findMany({
    orderBy: { rating: "desc" },
    take: 50,
    select: {
      id: true,
      username: true,
      rating: true,
      wins: true,
      losses: true,
      draws: true,
    }
  });

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-64px)] bg-[#0a0f1e]" style={{
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 70%)'
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes floatOffset {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative" style={{
            background: 'linear-gradient(135deg, #f97316, #f59e0b)',
            boxShadow: '0 0 40px rgba(251,191,36,0.4), 0 0 80px rgba(251,191,36,0.15)',
            animation: 'float 4s ease-in-out infinite'
          }}>
            <Trophy className="w-8 h-8 text-white relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 flex justify-center gap-3">
            <span style={{ color: 'white', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}>Global</span>
            <span style={{
              background: 'linear-gradient(to right, #f97316, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 15px rgba(251,191,36,0.5))',
              fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700
            }}>Leaderboard</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            The most elite competitive coders on the platform, ranked by their true ELO rating.
          </p>
        </div>

        <LeaderboardClient 
          users={topUsers} 
          currentUserId={session?.user?.id}
        />
      </div>
    </div>
  );
}
