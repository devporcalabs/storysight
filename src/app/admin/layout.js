"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, BookOpen, BarChart3, PlusCircle, LogOut, Users, Image, Settings, Compass } from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
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
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 md:sticky md:top-0 md:h-screen bg-white/40 backdrop-blur-xl border-r border-slate-200/40 flex flex-col shrink-0 justify-between z-40">
        <div className="flex-1 flex flex-col">
          {/* Brand */}
          <div className="p-6 border-b border-slate-200/40 flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="StorySight Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <span className="font-display font-extrabold text-slate-800 tracking-tight text-base">Admin Panel</span>
              <span className="block text-[9px] text-slate-400 font-extrabold uppercase font-mono">StorySight V1 CMS</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                pathname === "/admin/dashboard"
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                  : "text-slate-500 hover:bg-white/40 hover:text-primary"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              href="/stories"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                pathname === "/stories"
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                  : "text-slate-500 hover:bg-white/40 hover:text-primary"
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            
            {session?.role === "SUPERADMIN" && (
              <>
                <Link
                  href="/admin/stories"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                    pathname === "/admin/stories"
                      ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                      : "text-slate-500 hover:bg-white/40 hover:text-primary"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Manage Stories
                </Link>
                <Link
                  href="/admin/carousel"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                    pathname === "/admin/carousel"
                      ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                      : "text-slate-500 hover:bg-white/40 hover:text-primary"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Manage Carousel
                </Link>
                <Link
                  href="/admin/stories/new"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                    pathname === "/admin/stories/new"
                      ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                      : "text-slate-500 hover:bg-white/40 hover:text-primary"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New Story
                </Link>
              </>
            )}

            {session && (
              <>
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                    pathname === "/admin/users"
                      ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                      : "text-slate-500 hover:bg-white/40 hover:text-primary"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {session.role === "SUPERADMIN" ? "Manage Users" : "My Students"}
                </Link>
                <Link
                  href="/admin/settings"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                    pathname === "/admin/settings"
                      ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                      : "text-slate-500 hover:bg-white/40 hover:text-primary"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Bottom bar logout */}
        <div className="p-4 border-t border-slate-200/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Contents */}
      <main className="flex-1 bg-transparent p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
