"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, UserPlus, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [school, setSchool] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, school }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register. Please check details.");
        setLoading(false);
        return;
      }

      // Log in automatically
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        router.refresh();
        if (loginData.user.role === "TEACHER" || loginData.user.role === "SUPERADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
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
              Create an Account
            </h1>
            <p className="text-sm text-slate-500 mt-2 text-center font-medium">
              Start learning English today with engaging narratives.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200/50 text-rose-600 text-xs font-semibold px-4 py-3.5 rounded-xl mb-6 flex items-start gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm glass-input transition font-semibold"
                placeholder="John Doe"
              />
            </div>

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
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm glass-input transition font-semibold"
                placeholder="•••••••• (Min 6 chars)"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Register As (Daftar Sebagai)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm glass-input transition font-semibold bg-white/40 backdrop-blur-md border border-slate-200/40 text-slate-700 outline-none"
              >
                <option value="STUDENT" className="bg-white text-slate-800">Student (Siswa)</option>
                <option value="TEACHER" className="bg-white text-slate-800">Teacher (Guru)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                School Origin (Asal Sekolah)
              </label>
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm glass-input transition font-semibold"
                placeholder="e.g. SMA Negeri 1 Jakarta"
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
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/40 text-center">
            <span className="text-xs text-slate-500 font-semibold">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="text-xs font-bold text-primary hover:text-primary-container inline-flex items-center gap-0.5 group transition"
            >
              Sign In
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
