"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, BookOpen, BarChart3, PlusCircle, LogOut, Users, Image, Settings, Compass, Menu, X, GraduationCap } from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile drawer on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const renderNavLinks = () => {
    return (
      <>
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
            pathname === "/admin/dashboard"
              ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
              : "text-slate-500 hover:bg-white/40 hover:text-primary"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </Link>

        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
            pathname === "/"
              ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
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
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
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
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
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
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
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
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
                  : "text-slate-500 hover:bg-white/40 hover:text-primary"
              }`}
            >
              <Users className="w-4 h-4" />
              {session.role === "SUPERADMIN" ? "Manage Users" : "My Students"}
            </Link>
            <Link
              href="/admin/ecourse"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                pathname.startsWith("/admin/ecourse")
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
                  : "text-slate-500 hover:bg-white/40 hover:text-primary"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              E-Course
            </Link>
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                pathname === "/admin/settings"
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-inner"
                  : "text-slate-500 hover:bg-white/40 hover:text-primary"
              }`}
            >
              <Settings className="w-4 h-4" />
              Pengaturan
            </Link>
          </>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* 1. Mobile Header Top Bar */}
      <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200/40 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo.png" 
            alt="StorySight Logo" 
            className="h-10 w-auto object-contain"
          />
          <div>
            <span className="font-display font-extrabold text-slate-800 tracking-tight text-sm">Admin Panel</span>
            <span className="block text-[8px] text-slate-400 font-extrabold uppercase font-mono leading-none">CMS</span>
          </div>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-200/50 bg-white/80 text-slate-600 active:scale-90 transition-all cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 2. Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop blur */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-over panel */}
          <div className="relative flex flex-col w-[280px] bg-white h-full shadow-2xl animate-fade-in-left">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/logo.png" 
                  alt="StorySight Logo" 
                  className="h-9 w-auto object-contain"
                />
                <span className="font-display font-extrabold text-slate-800 text-sm">Admin Panel</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
              {renderNavLinks()}
            </nav>
            
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Sidebar Navigation (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 md:sticky md:top-0 md:h-screen bg-white/40 backdrop-blur-xl border-r border-slate-200/40 shrink-0 justify-between z-40">
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
            {renderNavLinks()}
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

      {/* 4. Main Admin Contents */}
      <main className="flex-1 bg-transparent p-6 pb-32 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
