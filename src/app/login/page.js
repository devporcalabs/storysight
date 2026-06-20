"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogIn, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.refresh();
      
      // Redirect based on role
      if (data.user.role === "SUPERADMIN" || data.user.role === "TEACHER") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        <div className="w-full max-w-md glass-card p-8 md:p-10 relative z-10 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-tr from-primary to-primary-container text-white p-3.5 rounded-2xl shadow-lg mb-4">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-slate-800 tracking-tight text-center">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 mt-2 text-center font-medium">
              Log in to continue your English learning adventure.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200/50 text-rose-600 text-xs font-semibold px-4 py-3.5 rounded-xl mb-6 flex items-start gap-2 animate-shake">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm glass-input transition font-semibold"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm glass-input transition font-semibold"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 primary-gradient text-white rounded-xl font-display text-sm font-bold shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/40 text-center">
            <span className="text-xs text-slate-500 font-semibold">
              New to StorySight?{" "}
            </span>
            <Link
              href="/register"
              className="text-xs font-bold text-primary hover:text-primary-container inline-flex items-center gap-0.5 group transition"
            >
              Create an account
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
