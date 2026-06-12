import { Link } from "react-router-dom";
import { Swords } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#0a0f1e]">
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
        >
          <Swords className="w-10 h-10 text-accent-cyan" />
        </div>
        <h1
          className="text-6xl font-black text-white mb-4"
          style={{ fontFamily: "'Chakra Petch', sans-serif" }}
        >
          404
        </h1>
        <p className="text-gray-400 mb-8 font-mono">[ PAGE NOT FOUND IN TARGET ZONE ]</p>
        <Link to="/" className="btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
