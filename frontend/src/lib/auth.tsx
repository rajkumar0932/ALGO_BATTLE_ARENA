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
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // send/receive cookies
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return { error: data.message || "Invalid credentials" };
      }

      // Save token from data.data.accessToken
      const token = data.data?.accessToken;
      if (token) {
        localStorage.setItem("algobattle_token", token);
      }

      // Fetch user info using the cookie set by login
      const userRes = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/user/displayUser`,
        {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const userData = await userRes.json();
      const u = userData.data;

      const loggedInUser: AuthUser = {
        id: u?.id || "",
        email: u?.email || email,
        username: u?.name || u?.username || "",
        rating: u?.rating || 0,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
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
