import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  Swords,
  Lock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 6 characters", met: newPassword.length >= 6 },
    {
      label: "Passwords match",
      met: newPassword === confirmPassword && confirmPassword.length > 0,
    },
  ];

  const allChecksMet = passwordChecks.every((c) => c.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter your email address");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/user/forgetPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to change password");
        return;
      }
      setSuccess("Password changed successfully! Redirecting…");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-cyan/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-gray-400">
            Reset your password via email
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/25 text-accent-rose text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Validation Checks */}
            {newPassword.length > 0 && (
              <div className="space-y-1.5">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        check.met ? "text-accent-emerald" : "text-gray-600"
                      }`}
                    />
                    <span className={check.met ? "text-gray-300" : "text-gray-600"}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !allChecksMet}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-accent-cyan transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
