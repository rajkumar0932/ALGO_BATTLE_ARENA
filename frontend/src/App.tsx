import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Problems from "@/pages/Problems";
import ProblemDetail from "@/pages/ProblemDetail";
import Battle from "@/pages/Battle";
import BattleRoomPage from "@/pages/BattleRoom";
import Leaderboard from "@/pages/Leaderboard";
import Play from "@/pages/Play";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";

import PlayBot from "@/pages/PlayBot";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:slug" element={<ProblemDetail />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/battle/:battleId" element={<BattleRoomPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/play" element={<Play />} />
            <Route path="/play/bot" element={<PlayBot />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
