import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { useAuth } from "@/lib/auth";

interface LeaderboardUser {
  id: string;
  username: string;
  userrating: number;
  winrate: string | number;
  record: string;
}

const MOCK_USERS: LeaderboardUser[] = [
  { id: "1", username: "CodeWarrior", userrating: 2100, winrate: 78.9, record: "45-12" },
  { id: "2", username: "AlgoMaster", userrating: 1950, winrate: 71.7, record: "38-15" },
  { id: "3", username: "ByteSlayer", userrating: 1820, winrate: 62.5, record: "30-18" },
  { id: "4", username: "NullPointer", userrating: 1700, winrate: 55.5, record: "25-20" },
  { id: "5", username: "RecursionKing", userrating: 1650, winrate: 50.0, record: "22-22" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all-time' | 'this-week' | 'today'>('all-time');

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/leaderboard?filter=${filter}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setUsers(data.data);
        } else {
          setUsers(MOCK_USERS);
        }
        setLoading(false);
      })
      .catch(() => {
        setUsers(MOCK_USERS);
        setLoading(false);
      });
  }, [filter]);

  return (
    <div
      className="relative overflow-hidden min-h-[calc(100vh-64px)] bg-[#0a0f1e]"
      style={{ backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 70%)" }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20">
        <div className="text-center mb-12">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
            style={{
              background: "linear-gradient(135deg, #f97316, #f59e0b)",
              boxShadow: "0 0 40px rgba(251,191,36,0.4), 0 0 80px rgba(251,191,36,0.15)",
              animation: "float 4s ease-in-out infinite",
            }}
          >
            <Trophy className="w-8 h-8 text-white relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 flex justify-center gap-3">
            <span style={{ color: "white", fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}>Global</span>
            <span
              style={{
                background: "linear-gradient(to right, #f97316, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 15px rgba(251,191,36,0.5))",
                fontFamily: "'Chakra Petch', sans-serif",
                fontWeight: 700,
              }}
            >
              Leaderboard
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm mb-8" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            The most elite competitive coders on the platform, ranked by their true ELO rating.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            {(['all-time', 'this-week', 'today'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 capitalize ${
                  filter === f
                    ? "bg-accent-amber/10 border border-accent-amber/50 text-accent-amber shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    : "bg-transparent border border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                }`}
                style={{ fontFamily: "'Chakra Petch', sans-serif" }}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : (
          <LeaderboardClient users={users} currentUserId={user?.id} />
        )}
      </div>
    </div>
  );
}
