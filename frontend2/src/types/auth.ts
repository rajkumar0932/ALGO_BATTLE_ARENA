export interface AuthUser {
  id: string;
  username: string;
  email: string;
  rating: number;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextType {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}
