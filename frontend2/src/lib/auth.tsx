import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AuthUser, AuthContextType, AuthStatus } from "../types/auth";
import { apiFetch } from "./api";

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
      const response = await apiFetch("/user/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const responseData = response.data;
      if (!responseData) {
        return { error: "Invalid response format from server" };
      }

      const token = responseData.accessToken;
      if (token) {
        localStorage.setItem("algobattle_token", token);
      }

      const u = responseData.user;
      const loggedInUser: AuthUser = {
        id: u?.id || "",
        email: u?.email || email,
        username: u?.name || u?.username || "Unknown",
        rating: u?.rating || 1200,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setStatus("authenticated");

      return {};
    } catch (err: any) {
      return { error: err.message || "Something went wrong" };
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
