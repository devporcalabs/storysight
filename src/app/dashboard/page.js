"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Award, CheckCircle2, Play, BookOpenText, ArrowRight, Star, LogOut, Compass, Shield, Settings } from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, meRes, storiesRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/auth/me"),
          fetch("/api/stories")
        ]);
        const statsData = await statsRes.json();
        const meData = await meRes.json();
        const storiesData = await storiesRes.json();

        setStats(statsData);
        if (meData.authenticated) {
          setSession(meData.user);
        }

        // Recommendations: stories that are published but not completed by this user
        if (Array.isArray(storiesData)) {
          const completedIds = statsData.completedStories?.map(s => s.id) || [];
          const activeIds = statsData.inProgressStories?.map(s => s.id) || [];
          const recs = storiesData.filter(s => !completedIds.includes(s.id) && !activeIds.includes(s.id));
          setRecommendations(recs.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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

  // Count levels for statistics
  const level12Count = stats?.completedStories?.filter(s => s.level === "Level 1" || s.level === "Level 2" || s.level === "Beginner").length || 0;
  const level34Count = stats?.completedStories?.filter(s => s.level === "Level 3" || s.level === "Level 4" || s.level === "Intermediate").length || 0;
  const level56Count = stats?.completedStories?.filter(s => s.level === "Level 5" || s.level === "Level 6" || s.level === "Advanced").length || 0;

  // Compute Greeting based on local time
  const hour = new Date().getHours();
  let greeting = "Selamat Pagi";
  if (hour >= 12 && hour < 15) greeting = "Selamat Siang";
  if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
  if (hour >= 18) greeting = "Selamat Malam";

  return (
    <div className="space-y-10">
      {/* Dashboard Header */}
      <header>
        <p className="font-display text-xs font-bold text-primary/80 tracking-widest uppercase mb-1">{greeting}</p>
        <h2 className="font-display text-3xl font-black text-slate-800">Selamat Datang Kembali, {session?.name}</h2>
        <p className="text-sm font-semibold text-slate-500 mt-2">Mari kita lanjutkan petualangan bahasamu hari ini.</p>
      </header>

      {/* Row 1: 3 Columns of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Weekly Goals */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display text-base font-bold text-slate-800">Weekly Goals</h3>
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end text-xs font-bold text-slate-500 mb-1">
              <span>{stats?.totalCompleted || 0} Cerita Selesai</span>
              <span className="text-primary font-black">
                {stats?.totalCompleted > 5 ? 100 : Math.round(((stats?.totalCompleted || 0) / 5) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary relative"
                style={{ width: `${stats?.totalCompleted > 5 ? 100 : ((stats?.totalCompleted || 0) / 5) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              {stats?.totalCompleted >= 5 
                ? "Target tercapai! Kamu telah menyelesaikan target mingguan. Luar biasa!"
                : `${5 - (stats?.totalCompleted || 0)} cerita lagi untuk mencapai target mingguanmu! Semangat!`
              }
            </p>
          </div>
        </div>

        {/* Column 2: Total Completed Stories */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
              <BookOpenText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-slate-800">{stats?.totalCompleted || 0}</h3>
              <p className="text-xs font-bold text-slate-500">Total Cerita Selesai</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200/40 flex justify-between text-center font-sans font-semibold">
            <div>
              <p className="font-extrabold text-sm text-slate-800">{level12Count}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Level 1 - 2</p>
            </div>
            <div className="h-6 w-[1px] bg-slate-100" />
            <div>
              <p className="font-extrabold text-sm text-slate-800">{level34Count}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Level 3 - 4</p>
            </div>
            <div className="h-6 w-[1px] bg-slate-100" />
            <div>
              <p className="font-extrabold text-sm text-slate-800">{level56Count}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Level 5 - 6</p>
            </div>
          </div>
        </div>

        {/* Column 3: Average Quiz Score */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
              <Award className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-slate-800">{stats?.averageScore || 0}%</h3>
              <p className="text-xs font-bold text-slate-500">Rata-rata Nilai Quiz</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200/40 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
              <span>RATA-RATA SKOR</span>
              <span className="text-emerald-600 font-mono">{stats?.averageScore || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats?.averageScore || 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              {stats?.averageScore >= 80 
                ? "Sangat Bagus! Pertahankan pemahaman membacamu." 
                : stats?.averageScore >= 60 
                ? "Cukup Baik. Coba baca lebih teliti untuk skor sempurna." 
                : "Terus Berlatih! Kerjakan kuis untuk meningkatkan skor."}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Lanjutkan Membaca */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-lg font-bold text-slate-800">Lanjutkan Membaca</h3>
          <Link href="/stories" className="text-primary font-display text-xs font-bold hover:underline">
            Lihat Semua Cerita
          </Link>
        </div>

        {stats?.inProgressStories.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl flex flex-col items-center justify-center h-48">
            <p className="text-slate-400 text-xs font-semibold">Tidak ada cerita aktif saat ini.</p>
            <Link
              href="/stories"
              className="mt-4 px-5 py-2.5 bg-primary text-white rounded-full font-display text-xs font-bold hover:shadow-md transition"
            >
              Mulai Membaca Cerita
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats?.inProgressStories.map((story) => (
              <div
                key={story.id}
                className="glass-panel group rounded-3xl overflow-hidden hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                  {story.slug === "the-golden-key" ? (
                    <img
                      src="/uploads/thumbnails/golden-key.png"
                      alt="Legenda Penjaga Rimba"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[9px] font-bold text-white uppercase tracking-wider">
                      {story.level}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{story.title}</h4>
                    <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed mb-4">{story.description}</p>
                  </div>
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 font-mono">
                      <span>Progress Belajar</span>
                      <span className="text-primary">{story.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${story.progressPercentage}%` }}></div>
                    </div>
                    <Link
                      href={`/stories/${story.slug}`}
                      className="w-full text-center py-2 border border-primary/20 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all block mt-4 cursor-pointer"
                    >
                      Lanjutkan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: Bottom Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-primary fill-current" />
          <h3 className="font-display text-lg font-bold text-slate-800">Rekomendasi Baru Untukmu</h3>
        </div>

        {recommendations.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-xs font-semibold rounded-3xl">
            Semua cerita telah kamu mulai. Silakan selesaikan progres belajarmu!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((story) => (
              <div key={story.id} className="glass-panel p-4 rounded-3xl hover:glow-edge transition-all duration-300 flex flex-col justify-between">
                <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 relative group bg-slate-100 flex items-center justify-center">
                  {story.slug === "the-golden-key" ? (
                    <img
                      src="/uploads/thumbnails/golden-key.png"
                      alt="The Golden Key"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute top-2 right-2 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-bold text-primary shadow-sm">BARU</div>
                </div>
                
                <div>
                  <h5 className="font-bold text-slate-800 text-sm mb-1">{story.title}</h5>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] text-slate-400 font-semibold">{story.genre}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] font-bold text-primary">{story.level}</span>
                  </div>
                </div>

                <Link
                  href={`/stories/${story.slug}`}
                  className="w-full py-2 bg-primary/10 rounded-xl text-primary text-center font-display text-xs font-bold hover:bg-primary hover:text-white transition-colors block cursor-pointer"
                >
                  Baca Sekarang
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
