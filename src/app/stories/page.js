"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BookOpenText, CheckCircle2, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [genre, setGenre] = useState("");

  const levels = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6"];
  const genres = [
    "Horror",
    "Romance",
    "School",
    "Business",
    "Daily Life",
    "Mystery",
    "Fantasy",
  ];

  const fetchStories = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (level) query.append("level", level);
      if (genre) query.append("genre", genre);

      const res = await fetch(`/api/stories?${query.toString()}`);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [level, genre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStories();
  };

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-28 md:py-12 flex-1 flex flex-col">
        {/* Page Header */}
        <div className="mb-10">
          <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-1">Eksplorasi Perpustakaan</span>
          <h1 className="font-display text-3xl font-black text-slate-800 tracking-tight">
            English Story Catalog
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Browse stories tailored to your level. Start reading, watching, and testing your English!
          </p>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between rounded-2xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari cerita..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-white/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold transition"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          </form>

          <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
            {/* Level Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide hidden sm:inline">Level:</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white/40 focus:outline-none text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="">Semua Level</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide hidden sm:inline">Genre:</span>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white/40 focus:outline-none text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="">Semua Genre</option>
                {genres.map((gen) => (
                  <option key={gen} value={gen}>{gen}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Catalog List */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-2xl flex-1 flex flex-col justify-center items-center">
            <BookOpenText className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada cerita ditemukan</h3>
            <p className="text-slate-500 text-xs mt-2 max-w-md font-semibold leading-relaxed">
              Kami tidak dapat menemukan cerita yang cocok dengan filter pencarian Anda. Coba reset filter.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => {
              let completedSteps = 0;
              if (story.progress?.isPdfRead) completedSteps++;
              if (story.progress?.isVideoWatched) completedSteps++;
              if (story.progress?.isQuizCompleted) completedSteps++;
              const progressPercentage = Math.round((completedSteps / 3) * 100);

              return (
                <div
                  key={story.id}
                  className="glass-card rounded-[24px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/20" />
                    {story.thumbnailUrl && story.thumbnailUrl !== "/uploads/thumbnails/golden-key.png" ? (
                      <img
                        src={story.thumbnailUrl}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        {story.slug === "the-golden-key" ? (
                          <img
                            src="/uploads/thumbnails/golden-key.png"
                            alt="The Golden Key"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <BookOpen className="w-12 h-12 text-slate-400" />
                        )}
                      </>
                    )}

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[9px] font-bold text-primary shadow-sm uppercase tracking-wider">
                        {story.level}
                      </span>
                    </div>

                    {story.progress?.progressStatus === "COMPLETED" && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-slate-800 text-base mb-2 group-hover:text-primary transition leading-snug">
                        {story.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed font-semibold">
                        {story.description}
                      </p>
                    </div>

                    <div className="mt-8">
                      {story.progress && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 mb-1">
                            <span>PROGRES BELAJAR</span>
                            <span className="text-primary">{progressPercentage}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                        <span className="text-[10px] text-slate-400 font-bold">
                          Durasi: {Math.round(story.duration / 60)} menit
                        </span>

                        <Link
                          href={`/stories/${story.slug}`}
                          className="flex items-center gap-1 text-[11px] font-bold text-white bg-primary hover:brightness-110 px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                        >
                          {story.progress?.progressStatus === "COMPLETED"
                            ? "Review"
                            : story.progress?.progressStatus === "IN_PROGRESS"
                            ? "Lanjutkan"
                            : "Mulai Membaca"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
