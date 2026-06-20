"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Shield, LayoutDashboard, Compass } from "lucide-react";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated) {
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch (e) {
      setSession(null);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="glass-navbar sticky top-0 z-50 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="font-display font-black text-2xl tracking-tight text-primary">
            StorySight
          </div>
        </Link>

        {/* Links section */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/stories"
            className={`font-display text-sm font-semibold tracking-wide transition-colors ${
              pathname === "/stories"
                ? "text-primary active-dot relative"
                : "text-slate-500 hover:text-primary"
            }`}
          >
            Explore
          </Link>
          
          {session && (
            <Link
              href={(session.role === "SUPERADMIN" || session.role === "TEACHER") ? "/admin/dashboard" : "/dashboard"}
              className={`font-display text-sm font-semibold tracking-wide transition-colors ${
                pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
                  ? "text-primary active-dot relative"
                  : "text-slate-500 hover:text-primary"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              {(session.role === "SUPERADMIN" || session.role === "TEACHER") && (
                <Link
                  href="/admin/dashboard"
                  className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 transition hover:bg-primary/20"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}

              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 border border-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-black text-xs">
                  {session.name[0].toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline-block max-w-[120px] truncate">
                  {session.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-full text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-slate-500 hover:text-primary px-3 py-2 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="primary-gradient text-white px-6 py-2.5 rounded-full font-display text-xs font-bold hover:shadow-lg transition cursor-pointer"
              >
                Mulai Belajar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
