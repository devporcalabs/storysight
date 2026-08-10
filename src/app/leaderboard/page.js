"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, School } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 w-full flex-1">
        {/* Back Link */}
        <div className="w-full mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-[#2E2A5C] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl overflow-hidden relative mb-8">
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-[#6C5CC4]/20 rounded-full blur-2xl -z-10 -translate-y-1/2" />
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFE9A8] flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
              🏆
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-3xl font-black tracking-tight">Papan Peringkat Siswa</h1>
              <p className="text-[#C9C4E6] text-xs sm:text-sm mt-1">Daftar siswa terbaik yang aktif membaca dan menyelesaikan kuis.</p>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="w-16 h-8 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl flex flex-col items-center justify-center h-64">
            <Trophy className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-400 text-sm font-semibold">Belum ada data peringkat siswa saat ini.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-2 sm:p-4 space-y-3">
            {leaderboard.map((student, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={student.id} 
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all duration-200 hover:bg-slate-50 ${
                    rank === 1 ? 'bg-amber-50/40 border-amber-200/60' : 
                    rank === 2 ? 'bg-slate-50/60 border-slate-100' : 
                    rank === 3 ? 'bg-orange-50/30 border-orange-100/50' : 
                    'bg-white border-slate-100/70'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${
                    rank === 1 ? 'bg-gradient-to-br from-[#FFE9A8] to-[#FFB938] text-[#7A5200]' : 
                    rank === 2 ? 'bg-[#C0C0C0] text-slate-800' : 
                    rank === 3 ? 'bg-[#CD7F32] text-amber-950' : 
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </div>

                  {/* Student Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-800 font-bold text-sm sm:text-base truncate flex items-center gap-1.5">
                      {student.name}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-0.5 text-[11px] sm:text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1 truncate">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {student.school || "Umum"}
                      </span>
                      {student.class && (
                        <span className="hidden sm:inline text-slate-300">•</span>
                      )}
                      {student.class && (
                        <span>Kelas {student.class}</span>
                      )}
                    </div>
                  </div>

                  {/* Stats & Score */}
                  <div className="flex items-center gap-3 sm:gap-6 text-right shrink-0">
                    <div>
                      <span className="block text-slate-700 font-black text-xs sm:text-sm">{student.attemptsCount || 0}</span>
                      <span className="block text-slate-400 text-[10px] sm:text-[11px] font-semibold">kuis selesai</span>
                    </div>
                    <div className={`font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-inner min-w-[3.5rem] text-center ${
                      rank === 1 ? 'bg-[#4CB963]/15 text-[#2E7D32] border border-[#4CB963]/30' :
                      'bg-slate-100 text-slate-700 border border-slate-200/50'
                    }`}>
                      {Math.round(student.averageScore)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} StorySight. All rights reserved.
      </footer>
    </div>
  );
}
