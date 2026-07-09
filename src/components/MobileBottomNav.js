"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Compass, CheckCircle2, Settings, LogOut, LogIn, UserPlus, Mic } from "lucide-react";

export default function MobileBottomNav() {
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
            setSession(null);
          }
        } else {
          setSession(null);
        }
      } catch (e) {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  };

  // Do not render bottom nav while loading
  if (loading) return null;

  // Do not render bottom nav on specific focus/distraction-free pages
  const hideOnPaths = [
    "/login",
    "/register",
  ];
  
  if (
    hideOnPaths.includes(pathname) ||
    pathname.endsWith("/read") ||
    pathname.endsWith("/watch") ||
    pathname.endsWith("/quiz") ||
    pathname.endsWith("/result")
  ) {
    return null;
  }

  // Authenticated state navigation
  if (session) {
    const isAdmin = session.role === "SUPERADMIN" || session.role === "TEACHER";
    const dashboardUrl = isAdmin ? "/admin/dashboard" : "/dashboard";
    const settingsUrl = isAdmin ? "/admin/settings" : "/dashboard/settings";

    const isExploreActive = pathname === "/" || pathname.startsWith("/stories/");
    const isDashboardActive = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
    const isSettingsActive = pathname === "/dashboard/settings" || pathname === "/admin/settings";

    return (
      <nav className="md:hidden fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-4 right-4 h-[72px] bg-white/80 backdrop-blur-xl border border-slate-200/40 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-around px-2 z-50">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center gap-1 w-14 h-12 transition-all duration-200 active:scale-90 ${isExploreActive ? "text-primary font-bold" : "text-[#64748B]"}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px]">Explore</span>
        </Link>
        
        <Link 
          href="/practice" 
          className={`flex flex-col items-center justify-center gap-1 w-14 h-12 transition-all duration-200 active:scale-90 ${pathname === "/practice" ? "text-primary font-bold" : "text-[#64748B]"}`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[9px]">Speech</span>
        </Link>

        <Link 
          href={dashboardUrl} 
          className={`flex flex-col items-center justify-center gap-1 w-14 h-12 transition-all duration-200 active:scale-90 ${isDashboardActive && !isSettingsActive ? "text-primary font-bold" : "text-[#64748B]"}`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[9px]">Dashboard</span>
        </Link>
        
        <Link 
          href={settingsUrl} 
          className={`flex flex-col items-center justify-center gap-1 w-14 h-12 transition-all duration-200 active:scale-90 ${isSettingsActive ? "text-primary font-bold" : "text-[#64748B]"}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px]">Settings</span>
        </Link>
        
        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-rose-500 font-semibold cursor-pointer active:scale-90 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px]">Keluar</span>
        </button>
      </nav>
    );
  }

  // Guest (Not authenticated) state navigation
  return (
    <nav className="md:hidden fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-4 right-4 h-[72px] bg-white/80 backdrop-blur-xl border border-slate-200/40 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-around px-4 z-50">
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all duration-200 active:scale-90 ${pathname === "/" ? "text-primary font-bold" : "text-[#64748B]"}`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[9px]">Jelajah</span>
      </Link>

      <Link 
        href="/practice" 
        className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all duration-200 active:scale-90 ${pathname === "/practice" ? "text-primary font-bold" : "text-[#64748B]"}`}
      >
        <Mic className="w-5 h-5" />
        <span className="text-[9px]">Speech</span>
      </Link>
      
      <Link 
        href="/login" 
        className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all duration-200 active:scale-90 ${pathname === "/login" ? "text-primary font-bold" : "text-[#64748B]"}`}
      >
        <LogIn className="w-5 h-5" />
        <span className="text-[9px]">Masuk</span>
      </Link>

      <Link 
        href="/register" 
        className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all duration-200 active:scale-90 ${pathname === "/register" ? "text-primary font-bold" : "text-[#64748B]"}`}
      >
        <UserPlus className="w-5 h-5" />
        <span className="text-[9px]">Daftar</span>
      </Link>
    </nav>
  );
}
