import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiFetch("/user/forgetPassword", {
        method: "POST",
        body: JSON.stringify({ email, newPassword }),
      });
      setSuccess("Password reset successfully. You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#66fcf1] mb-2">AlgoBattle</h1>
          <p className="text-[#c5c6c7]">Reset your password</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary w-full mt-4"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-[#66fcf1] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
