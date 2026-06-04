import { prisma } from "@algobattle/db";
import { notFound } from "next/navigation";
import { Trophy, TrendingUp, TrendingDown, Swords, CalendarDays } from "lucide-react";
import Link from "next/link";

interface Props {
  params: { username: string };
}

export default async function ProfilePage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      submissions: {
        include: {
          battle: {
            include: {
              problem: { select: { title: true, difficulty: true } },
              player1: { select: { username: true } },
              player2: { select: { username: true } },
            }
          }
        },
        orderBy: { submittedAt: "desc" },
        take: 15
      }
    }
  });

  if (!user) notFound();

  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : "0.0";
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header */}
      <div className="glass-card neon-border p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar Placeholder */}
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-hover border border-border flex items-center justify-center text-4xl font-black text-gray-600 shadow-xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black mb-2">{user.username}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                Joined {joinedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Swords className="w-4 h-4" />
                {totalGames} Battles Fought
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="px-4 py-2 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-accent-amber" />
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rating</div>
                  <div className="text-xl font-bold text-accent-amber">{user.rating}</div>
                </div>
              </div>
              
              <div className="px-4 py-2 rounded-lg bg-bg-secondary border border-border flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-accent-emerald" />
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Win Rate</div>
                  <div className="text-xl font-bold text-gray-200">{winRate}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle History */}
      <h2 className="text-2xl font-bold mb-6">Recent Battles</h2>
      <div className="glass-card neon-border overflow-hidden">
        {user.submissions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No battles played yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {user.submissions.map((sub) => {
              const opponent = sub.battle.player1.username === user.username
                  ? sub.battle.player2?.username
                  : sub.battle.player1.username;
                  
              const isWin = sub.battle.winnerId === user.id;
              const isDraw = sub.battle.winnerId === null && sub.battle.status === "COMPLETED";
              const resultColor = isWin ? "text-accent-emerald" : isDraw ? "text-gray-400" : "text-accent-rose";
              const resultText = isWin ? "Victory" : isDraw ? "Draw" : "Defeat";

              return (
                <div key={sub.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg-hover/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{sub.battle.problem.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>vs {opponent || "Unknown"}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={`font-bold ${resultColor}`}>{resultText}</div>
                      <div className="text-xs text-gray-500">
                        {sub.passedCases}/{sub.totalCases} cases
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
