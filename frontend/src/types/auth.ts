// ─── Auth Types ──────────────────────────────────────────────────────────────
// Shared types for the JWT-based auth context (replaces next-auth types)

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  rating?: number;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextType {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}
