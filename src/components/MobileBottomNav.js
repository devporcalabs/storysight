"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Compass, CheckCircle2, Settings, LogOut } from "lucide-react";

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

  // Do not render bottom nav if loading or not authenticated
  if (loading || !session) return null;

  // Do not render bottom nav on specific focus/distraction-free pages
  const hideOnPaths = [
    "/",
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

  // Determine URLs based on role
  const isAdmin = session.role === "SUPERADMIN" || session.role === "TEACHER";
  const dashboardUrl = isAdmin ? "/admin/dashboard" : "/dashboard";
  const settingsUrl = isAdmin ? "/admin/settings" : "/dashboard/settings";

  // Check active states
  const isExploreActive = pathname === "/stories" || pathname.startsWith("/stories/");
  const isDashboardActive = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isSettingsActive = pathname === "/dashboard/settings" || pathname === "/admin/settings";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel bg-white/90 backdrop-blur-2xl z-50 border-t border-slate-200/30 py-3.5 flex justify-around px-4 pb-safe shadow-lg">
      <Link 
        href="/stories" 
        className={`flex flex-col items-center gap-1 transition ${isExploreActive ? "text-primary font-bold" : "text-slate-400"}`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[9px]">Explore</span>
      </Link>
      
      <Link 
        href={dashboardUrl} 
        className={`flex flex-col items-center gap-1 transition ${isDashboardActive && !isSettingsActive ? "text-primary font-bold active-dot relative" : "text-slate-400"}`}
      >
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-[9px]">Dashboard</span>
      </Link>
      
      <Link 
        href={settingsUrl} 
        className={`flex flex-col items-center gap-1 transition ${isSettingsActive ? "text-primary font-bold active-dot relative" : "text-slate-400"}`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[9px]">Settings</span>
      </Link>
      
      <button 
        onClick={handleLogout} 
        className="flex flex-col items-center gap-1 text-rose-500 font-semibold cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[9px]">Keluar</span>
      </button>
    </nav>
  );
}
