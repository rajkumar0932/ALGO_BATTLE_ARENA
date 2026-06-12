import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AuthUser, AuthContextType, AuthStatus } from "@/types/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "unauthenticated",
  signIn: async () => ({}),
  signOut: () => {},
});

const STORAGE_KEY = "algobattle_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Invalid credentials" };
      }
      const loggedInUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        rating: data.user.rating,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      if (data.token) {
        localStorage.setItem("algobattle_token", data.token);
      }
      setUser(loggedInUser);
      setStatus("authenticated");
      return {};
    } catch {
      return { error: "Something went wrong. Please try again." };
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("algobattle_token");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
