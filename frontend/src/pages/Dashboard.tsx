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
  avatar_url?: string;
}

export default function Dashboard() {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/login");
      return;
    }
    if (status === "authenticated" && user) {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/user/profile/${user.username}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("algobattle_token")}`,
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
             setUserData({
                id: data.data.id,
                username: data.data.name,
                rating: data.data.elo_rating ?? 1200,
                wins: data.data.match_won ?? 0,
                losses: (data.data.battle_played ?? 0) - (data.data.match_won ?? 0),
                draws: 0,
                avatar_url: data.data.avatar_url
             });
          }
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
            draws: 0
          });
          setLoading(false);
        });
    }
  }, [status, user, navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/user/updateAvatar`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("algobattle_token")}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserData((prev) => prev ? { ...prev, avatar_url: data.data.avatar_url } : null);
      } else {
        alert(data.message || "Failed to update avatar");
      }
    } catch (err) {
      alert("An error occurred while uploading the avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

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
        <div className="mb-10 relative flex items-center gap-6">
          <div className="relative group rounded-full overflow-hidden w-24 h-24 shrink-0" style={{ border: "2px solid rgba(0,229,255,0.3)", background: "rgba(0,229,255,0.05)" }}>
             {userData.avatar_url ? (
               <img src={userData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-accent-cyan">
                 {userData.username.charAt(0).toUpperCase()}
               </div>
             )}
             <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
               {uploadingAvatar ? (
                 <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <>
                   <svg className="w-6 h-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                 </>
               )}
               <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
             </label>
          </div>
          <div>
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
      </div>
    </div>
  );
}
