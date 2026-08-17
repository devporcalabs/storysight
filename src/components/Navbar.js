"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="glass-navbar sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Section: Logo + Menus */}
          <div className="flex items-center gap-4 lg:gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img 
                src="/logo.png" 
                alt="StorySight Logo" 
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105 duration-300 drop-shadow-sm"
              />
            </Link>

            {/* Desktop Menus */}
            <nav className="hidden md:flex items-center gap-2 border-l border-slate-200/60 pl-6 lg:pl-10 h-8">
              <Link
                href="/"
                className={`text-sm font-bold tracking-wide transition-all px-4 py-2 rounded-full ${
                  pathname === "/"
                    ? "bg-primary/10 text-primary shadow-inner"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                Explore
              </Link>

              <Link
                href="/practice"
                className={`text-sm font-bold tracking-wide transition-all px-4 py-2 rounded-full ${
                  pathname === "/practice"
                    ? "bg-primary/10 text-primary shadow-inner"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                Speech
              </Link>
              
              <Link
                href="/courses"
                className={`text-sm font-bold tracking-wide transition-all px-4 py-2 rounded-full ${
                  pathname.startsWith("/courses")
                    ? "bg-primary/10 text-primary shadow-inner"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                E-Course
              </Link>
              
              {session && (
                <Link
                  href={(session.role === "SUPERADMIN" || session.role === "TEACHER") ? "/admin/dashboard" : "/dashboard"}
                  className={`text-sm font-bold tracking-wide transition-all px-4 py-2 rounded-full ${
                    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
                      ? "bg-primary/10 text-primary shadow-inner"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
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

                <Link 
                  href={(session.role === "SUPERADMIN" || session.role === "TEACHER") ? "/admin/dashboard" : "/dashboard"}
                  className="flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="bg-primary/10 border border-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                    {session.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline-block max-w-[100px] truncate">
                    {session.name}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1 text-xs font-bold px-2 sm:px-3.5 py-2 rounded-full text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </>
            ) : (
              <>
                {/* Desktop Login Button */}
                <Link
                  href="/login"
                  className="hidden md:inline-flex primary-gradient text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-bold hover:shadow-lg transition cursor-pointer whitespace-nowrap"
                >
                  Masuk
                </Link>
                
                {/* Mobile Login button */}
                <Link
                  href="/login"
                  className="inline-flex md:hidden text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full transition active:scale-[0.97]"
                >
                  Masuk
                </Link>
              </>
            )}

            {/* Mobile hamburger menu toggle hidden - navigation transitioned to bottom nav */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hidden items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200/60 flex flex-col gap-1.5 px-2 pb-2">
            <Link
              href="/"
              className={`text-sm font-bold tracking-wide transition-all px-4 py-2.5 rounded-xl ${
                pathname === "/"
                  ? "bg-primary/10 text-primary shadow-inner"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Explore
            </Link>
            
            <Link
              href="/courses"
              className={`text-sm font-bold tracking-wide transition-all px-4 py-2.5 rounded-xl ${
                pathname.startsWith("/courses")
                  ? "bg-primary/10 text-primary shadow-inner"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              E-Course
            </Link>
            
            {session ? (
              <>
                <Link
                  href={(session.role === "SUPERADMIN" || session.role === "TEACHER") ? "/admin/dashboard" : "/dashboard"}
                  className={`text-sm font-bold tracking-wide transition-all px-4 py-2.5 rounded-xl ${
                    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
                      ? "bg-primary/10 text-primary shadow-inner"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Dashboard
                </Link>

                {(session.role === "SUPERADMIN" || session.role === "TEACHER") && (
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-primary transition ${
                      pathname.startsWith("/admin")
                        ? "bg-primary/10 text-primary shadow-inner"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer mt-2 border-t border-slate-200/40 pt-3"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="primary-gradient text-white text-center text-sm font-bold px-4 py-2.5 rounded-xl hover:shadow-lg transition cursor-pointer mt-2"
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
