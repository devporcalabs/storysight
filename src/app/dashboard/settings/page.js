"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Shield, User, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UserSettingsPage() {
  const router = useRouter();
  
  // User Session
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  
  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "password"

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
            setName(data.user.name || "");
            setSchool(data.user.school || "");
          } else {
            router.push("/login");
          }
        }
      } catch (e) {
        console.error(e);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [router]);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          school,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui profil.");
      } else {
        setSuccess("Profil Anda berhasil diperbarui!");
        // Update local session info
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungkan ke server.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengganti password.");
      } else {
        setSuccess("Password Anda berhasil diperbarui!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungkan ke server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const backUrl = (user?.role === "SUPERADMIN" || user?.role === "TEACHER") ? "/admin/dashboard" : "/dashboard";

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Back link */}
        <Link
          href={backUrl}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">Pengaturan Akun</h1>
          <p className="text-slate-500 font-sans font-semibold text-xs mt-1">
            Ubah nama profil, asal sekolah, atau ganti sandi keamanan Anda.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b border-slate-200/50 pb-px font-display">
          <button
            onClick={() => { setActiveTab("profile"); setError(""); setSuccess(""); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <User className="w-4 h-4" /> Edit Profil
          </button>
          <button
            onClick={() => { setActiveTab("password"); setError(""); setSuccess(""); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "password"
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Lock className="w-4 h-4" /> Ganti Password
          </button>
        </div>

        {/* Form Content */}
        <div className="glass-card p-6 md:p-8 rounded-[24px] border-white/20">
          {activeTab === "profile" ? (
            <form onSubmit={handleSubmitProfile} className="space-y-6">
              <div className="space-y-4">
                {/* Email (Readonly) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    Alamat Email (Tidak dapat diubah)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100 border border-slate-200 text-slate-400 font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
                  />
                </div>

                {/* School (Conditional for students and teachers) */}
                {user?.role !== "SUPERADMIN" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                      Asal Sekolah / Instansi
                    </label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="e.g. SMA Negeri 1 Jakarta"
                      className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
                    />
                  </div>
                )}

                {/* Role (Readonly badge) */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    Peran Pengguna
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" /> {user?.role}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 primary-gradient text-white rounded-xl text-xs font-display font-bold hover:shadow-lg active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Profil
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitPassword} className="space-y-6">
              <div className="space-y-4">
                {/* Old Password */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="•••••••• (Min. 6 karakter)"
                    className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 primary-gradient text-white rounded-xl text-xs font-display font-bold hover:shadow-lg active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Perbarui Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>
    </div>
  );
}
