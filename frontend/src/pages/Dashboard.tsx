import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Trophy, Swords, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { StatCounter } from "@/components/dashboard/StatCounter";

interface UserData {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  submissions: Array<{
    id: string;
    verdict: string;
    passedCases: number;
    totalCases: number;
    submittedAt: string;
    battle: {
      problem: { title: string; slug: string; difficulty: string };
      player1: { username: string };
      player2?: { username: string };
    };
  }>;
}

export default function Dashboard() {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/login");
      return;
    }
    if (status === "authenticated" && user) {
      // Fetch user data from your API
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/users/${user.id}/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("algobattle_token")}`,
        },
      })
        .then((r) => r.json())
        .then((data) => {
          setUserData(data);
          setLoading(false);
        })
        .catch(() => {
          // Use stub data if API not available
          setUserData({
            id: user.id,
            username: user.username,
            rating: user.rating ?? 1200,
            wins: 0,
            losses: 0,
            draws: 0,
            submissions: [],
          });
          setLoading(false);
        });
    }
  }, [status, user, navigate]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  const totalGames = userData.wins + userData.losses + userData.draws;
  const winRate = totalGames > 0 ? ((userData.wins / totalGames) * 100).toFixed(1) : "0.0";

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#0a0f1e]">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(0,229,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 relative">
          <h1
            className="text-3xl font-bold mb-2 text-white flex items-center gap-2"
            style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 400 }}
          >
            Welcome back,{" "}
            <span style={{ color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.5)", fontWeight: 700 }}>
              {userData.username}
            </span>
          </h1>
          <p className="text-gray-400 font-mono text-sm">Here's your battle performance overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "ELO Rating", value: userData.rating, color: "#f97316", icon: Trophy, isFloat: false },
            { label: "Wins", value: userData.wins, color: "#4ade80", icon: TrendingUp, isFloat: false },
            { label: "Losses", value: userData.losses, color: "#f43f5e", icon: TrendingDown, isFloat: false },
            { label: "Win Rate", value: parseFloat(winRate), color: "#a855f7", icon: Swords, isFloat: true },
          ].map(({ label, value, color, icon: Icon, isFloat }) => (
            <div
              key={label}
              className="relative flex flex-col rounded-b-lg overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none" }}
            >
              <div className="h-[3px] w-full" style={{ background: color }} />
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  <Icon className="w-4 h-4" style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
                  {label}
                </div>
                <p className="text-4xl text-white flex items-baseline" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                  <StatCounter value={value} isFloat={isFloat} />
                  {isFloat && <span className="text-xl ml-1 text-gray-400">%</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/battle"
            className="group flex items-center gap-4 p-6 rounded-lg transition-all duration-200 hover:-translate-y-[2px]"
            style={{ border: "1px solid rgba(0,229,255,0.25)", borderLeft: "3px solid #00e5ff", background: "rgba(255,255,255,0.015)" }}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <Swords className="w-6 h-6 text-[#00e5ff] group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 uppercase tracking-wide" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Find a Battle</h3>
              <p className="text-sm text-gray-400">Get matched and compete</p>
            </div>
          </Link>
          <Link
            to="/problems"
            className="group flex items-center gap-4 p-6 rounded-lg transition-all duration-200 hover:-translate-y-[2px]"
            style={{ border: "1px solid rgba(168,85,247,0.25)", borderLeft: "3px solid #a855f7", background: "rgba(255,255,255,0.015)" }}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#a855f7] group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 uppercase tracking-wide" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Practice Problems</h3>
              <p className="text-sm text-gray-400">Sharpen your skills</p>
            </div>
          </Link>
        </div>

        {/* Recent Battles */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
          <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-wide text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
              <Clock className="w-5 h-5" style={{ color: "#00e5ff" }} />
              Recent Battles
            </h2>
          </div>

          {userData.submissions.length === 0 ? (
            <div className="m-6 text-center flex flex-col items-center justify-center" style={{ border: "1px dashed rgba(0,229,255,0.1)", borderRadius: "8px", padding: "48px", background: "rgba(0,229,255,0.01)" }}>
              <Swords className="w-12 h-12 text-[#00e5ff] mx-auto mb-4" style={{ filter: "drop-shadow(0 0 10px rgba(0,229,255,0.2))" }} />
              <p className="mb-2 uppercase tracking-widest text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Chakra Petch', sans-serif" }}>No battles yet</p>
              <p className="text-xs text-gray-500 font-mono">[ AWAITING DATA FROM TARGET ZONE ]</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {userData.submissions.map((submission) => {
                const opponent =
                  submission.battle.player1.username === userData.username
                    ? submission.battle.player2?.username
                    : submission.battle.player1.username;
                const difficultyClass =
                  submission.battle.problem.difficulty === "EASY" ? "badge-easy" :
                  submission.battle.problem.difficulty === "MEDIUM" ? "badge-medium" : "badge-hard";
                const verdictColor =
                  submission.verdict === "ACCEPTED" ? "text-[#4ade80]" :
                  submission.verdict === "PENDING" ? "text-gray-400" : "text-[#f43f5e]";

                return (
                  <div key={submission.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-200">{submission.battle.problem.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={difficultyClass}>{submission.battle.problem.difficulty}</span>
                          {opponent && <span className="text-xs text-gray-500">vs {opponent}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className={`text-sm font-medium ${verdictColor}`}>{submission.verdict.replace(/_/g, " ")}</span>
                      <span className="text-xs text-gray-500 font-mono">{submission.passedCases}/{submission.totalCases} cases</span>
                      <span className="text-xs text-gray-500 font-mono">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
