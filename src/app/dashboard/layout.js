"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Compass, CheckCircle2, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setSession(data.user);
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-white/40 backdrop-blur-xl border-r border-slate-200/40 h-screen sticky top-0 z-40 justify-between">
          <div className="flex-1 flex flex-col">
            <div className="px-8 py-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <img 
                  src="/logo.png" 
                  alt="StorySight Logo" 
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                />
              </Link>
            </div>
            
            <nav className="px-6 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all text-slate-500 hover:bg-white/40 hover:text-primary font-display text-sm font-semibold"
              >
                <Compass className="w-5 h-5" />
                Explore
              </Link>
              <Link
                href="/dashboard"
                className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all font-display text-sm ${
                  pathname === "/dashboard"
                    ? "text-primary bg-primary/10 border-r-4 border-primary font-bold"
                    : "text-slate-500 hover:bg-white/40 hover:text-primary font-semibold"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all font-display text-sm ${
                  pathname === "/dashboard/settings"
                    ? "text-primary bg-primary/10 border-r-4 border-primary font-bold"
                    : "text-slate-500 hover:bg-white/40 hover:text-primary font-semibold"
                }`}
              >
                <Settings className="w-5 h-5" />
                Pengaturan
              </Link>
            </nav>
          </div>

          {/* Sidebar Footer - Profile & Logout */}
          <div className="p-6 border-t border-slate-200/40 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white font-bold shrink-0">
                {session?.name?.[0]?.toUpperCase()}
              </div>
              <div className="truncate max-w-[150px]">
                <p className="font-display text-sm font-bold text-slate-800 leading-tight">{session?.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold truncate">{session?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sesi
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 px-3 sm:px-6 md:px-12 pt-6 pb-24 md:py-10 max-w-[1400px] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
