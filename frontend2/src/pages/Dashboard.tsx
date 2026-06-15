import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { getSocket, disconnectSocket } from "../lib/socket";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to backend socket:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from backend socket");
      setIsConnected(false);
    });

    socket.on("lobby:searching", (data) => {
      console.log("Searching:", data.message);
    });

    socket.on("lobby:matched", (data) => {
      console.log("Match found!", data);
      alert(`Match found against ${data.opponent.username}! Redirecting to battle...`);
      // Optional: navigate(`/battle/${data.battleId}`);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("lobby:searching");
      socket.off("lobby:matched");
      disconnectSocket();
    };
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    signOut();
    disconnectSocket();
    navigate("/login");
  };

  const handleFindMatch = () => {
    const socket = getSocket();
    if (socket.connected && user) {
      socket.emit("lobby:join", {
        userId: user.id,
        username: user.username,
        rating: user.rating,
      });
      console.log("Sent lobby:join event");
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#66fcf1]">Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? "Connected to Server" : "Disconnected"}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-primary bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50">
          Logout
        </button>
      </div>

      <div className="glass-card p-8 mb-8">
        <h2 className="text-2xl mb-4 font-semibold text-white">Welcome, {user.username}!</h2>
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="bg-[#0b0c10] p-4 rounded-lg border border-[#45a29e]/30">
            <p className="text-gray-400 text-sm">Rating</p>
            <p className="text-3xl font-bold text-[#66fcf1] mt-1">{user.rating}</p>
          </div>
          <div className="bg-[#0b0c10] p-4 rounded-lg border border-[#45a29e]/30">
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-lg font-medium text-white mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Ready to Battle?</h3>
        <button 
          onClick={handleFindMatch}
          disabled={!isConnected}
          className="btn-primary px-8 py-3 text-lg"
        >
          Find Match (1v1)
        </button>
      </div>
    </div>
  );
}
