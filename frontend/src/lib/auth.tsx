import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AuthUser, AuthContextType, AuthStatus } from "@/types/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "unauthenticated",
  signIn: async () => ({}),
  signOut: () => {},
  updateUser: () => {},
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
      console.log("Attempting sign in with:", email);
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
      console.log("Raw response from backend:", data);

      if (!res.ok) {
        return { error: data.message || "Invalid credentials" };
      }

      // The backend uses ApiResponse which wraps data inside `data` property.
      // E.g., data: { statusCode: 200, data: { user: {...}, accessToken: "..." }, message: "..." }
      const responseData = data.data;
      if (!responseData) {
        console.error("Backend did not return a 'data' object inside the response!");
        return { error: "Invalid response from server" };
      }

      // Save token
      const token = responseData.accessToken;
      if (token) {
        localStorage.setItem("algobattle_token", token);
      } else {
        console.warn("No accessToken found in the response data");
      }

      // Read user object
      const u = responseData.user;
      console.log("Extracted user object:", u);

      const loggedInUser: AuthUser = {
        id: u?.id || "",
        email: u?.email || email,
        username: u?.name || u?.username || "Unknown Player",
        rating: u?.rating || 1200,
      };

      console.log("Saving AuthUser to state:", loggedInUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setStatus("authenticated");
      
      return {};
    } catch (err) {
      console.error("Fetch exception during login:", err);
      return { error: "Something went wrong. Please try again." };
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("algobattle_token");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
