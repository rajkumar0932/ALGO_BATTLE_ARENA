import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import {
  Swords,
  Trophy,
  BookOpen,
  LayoutDashboard,
  LogOut,
  LogIn,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";

export function Navbar() {
  const { user, status, signOut } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/problems", label: "Problems", icon: BookOpen },
    { href: "/play", label: "Play", icon: Swords },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  if (pathname.startsWith("/battle") || pathname === "/play/private") {
    return null;
  }

  return (
    <nav
      className={`sticky top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-primary/90 backdrop-blur-xl border-b border-border py-3"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-lg flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              Algo
              <span
                className="text-accent-cyan"
                style={{ textShadow: "0 0 12px rgba(0,229,255,0.5)" }}
              >
                Battle
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 group ${
                    isActive
                      ? "text-accent-cyan"
                      : "text-gray-400 hover:text-gray-100 hover:bg-bg-hover"
                  }`}
                  style={isActive ? { fontFamily: "'Chakra Petch', sans-serif" } : {}}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full"
                      style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions & Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/battle"
              className="group relative overflow-hidden hidden lg:flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg text-[#080c18] transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              style={{ background: "linear-gradient(135deg, #00e5ff, #0070f3)" }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "shimmerSweep 1.5s infinite",
                }}
              />
              <Search className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Find Battle</span>
            </Link>

            <div className="w-px h-6 bg-border mx-1" />

            {status === "loading" ? (
              <div className="w-24 h-9 skeleton rounded-lg" />
            ) : user ? (
              <>
                <button className="relative p-2 text-gray-400 hover:text-gray-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-accent-rose rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </button>

                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    pathname === "/dashboard"
                      ? "text-accent-purple bg-accent-purple/10 border border-accent-purple/20"
                      : "text-gray-400 hover:text-gray-100 hover:bg-bg-hover"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg text-gray-400 hover:text-accent-rose hover:bg-accent-rose/10 transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-secondary text-sm py-2">
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden z-50 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <Link
            to="/battle"
            className="btn-primary flex items-center justify-center gap-2 mb-8 py-3"
            onClick={() => setMobileOpen(false)}
          >
            <Search className="w-5 h-5" />
            Find Battle
          </Link>

          <div className="flex flex-col gap-2 flex-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                    isActive
                      ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                      : "text-gray-400 hover:text-gray-100 hover:bg-bg-hover"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border mt-auto">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                    pathname === "/dashboard"
                      ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20"
                      : "text-gray-400 hover:text-gray-100 hover:bg-bg-hover"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-accent-rose font-bold hover:bg-accent-rose/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-secondary w-full py-3 justify-center"
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-2 font-bold">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </nav>
  );
}
