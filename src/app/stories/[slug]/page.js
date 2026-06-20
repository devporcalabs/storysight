"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Award, CheckCircle2, BookOpen, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function StoryDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/stories/${slug}`);
        if (!res.ok) {
          router.push("/stories");
          return;
        }
        const data = await res.json();
        setStory(data);
      } catch (e) {
        console.error(e);
        router.push("/stories");
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!story) return null;

  // Progress Calculations
  const pdfRead = story.progress?.isPdfRead || false;
  const videoWatched = story.progress?.isVideoWatched || false;
  const quizCompleted = story.progress?.isQuizCompleted || false;

  let steps = 0;
  if (pdfRead) steps++;
  if (videoWatched) steps++;
  if (quizCompleted) steps++;
  const progressPercent = Math.round((steps / 3) * 100);

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 pt-8 pb-20 w-full flex-1">
        
        {/* Back Link */}
        <div className="w-full mb-6">
          <Link
            href="/stories"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Katalog
          </Link>
        </div>

        {/* Story Details Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Featured Image & Synopsis */}
          <div className="md:col-span-5 space-y-6">
            {/* Featured Image Card */}
            <div className="relative rounded-3xl overflow-hidden glass-card shadow-xl aspect-[4/3] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/20" />
              {story.thumbnailUrl ? (
                <img
                  src={story.thumbnailUrl}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-slate-300" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[9px] font-mono font-bold text-primary shadow-sm uppercase tracking-wider">
                  {story.level}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-primary/90 backdrop-blur-md text-[9px] font-mono font-bold text-white shadow-sm uppercase tracking-wider">
                  {story.genre}
                </span>
              </div>
            </div>

            {/* Synopsis Card */}
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Sinopsis Cerita</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold font-sans">{story.description}</p>
            </div>
          </div>

          {/* Right Column: Title, Progress, and Options */}
          <div className="md:col-span-7 space-y-8">
            {/* Title & Metadata */}
            <div>
              <span className="text-[10px] font-black text-primary tracking-widest uppercase font-mono">English Learning Story</span>
              <h1 className="font-display text-3xl md:text-4xl font-black text-slate-800 mt-2 leading-tight">{story.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-slate-400 text-xs font-semibold font-sans">
                <span>Durasi: {Math.round(story.duration / 60)} menit</span>
                <span>&bull;</span>
                <span>Format: Video & PDF</span>
              </div>
            </div>

            {/* Overall Progress Gauge */}
            <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
              <div className="flex justify-between items-end text-xs font-bold text-slate-500 mb-2">
                <span className="font-display">Total Progress Belajar</span>
                <span className="text-primary font-black text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/40 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-3 font-sans leading-relaxed">
                {progressPercent === 100
                  ? "Luar biasa! Kamu telah menyelesaikan semua tahap belajar untuk cerita ini."
                  : "Selesaikan membaca teks, menonton video, dan kuis pemahaman untuk menyelesaikan cerita."}
              </p>
            </div>

            {/* Options Selection Bento Grid */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-slate-800 text-sm">Pilih Aktivitas Belajar</h3>
              
              <div className="grid grid-cols-1 gap-4">
                
                {/* 1. Read By Me */}
                <div
                  onClick={() => router.push(`/stories/${story.slug}/read`)}
                  className="glass-card p-5 rounded-3xl flex items-center justify-between hover:scale-[1.01] hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20 hover:border-primary/20 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm">Read By Me</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-0.5 leading-relaxed font-sans">
                        Membaca teks cerita mandiri layaknya komik bergambar.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pdfRead ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-sans">
                        Belum dibaca
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* 2. Read For Me */}
                <div
                  onClick={() => router.push(`/stories/${story.slug}/watch`)}
                  className="glass-card p-5 rounded-3xl flex items-center justify-between hover:scale-[1.01] hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20 hover:border-primary/20 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm">Read For Me</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-0.5 leading-relaxed font-sans">
                        Tonton video storytelling dengan visual menarik dan narasi audio.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {videoWatched ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-sans">
                        Belum ditonton
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* 3. Interactive Quiz */}
                <div
                  onClick={() => router.push(`/stories/${story.slug}/quiz`)}
                  className="glass-card p-5 rounded-3xl flex items-center justify-between hover:scale-[1.01] hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20 hover:border-primary/20 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm">Interactive Quiz</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-0.5 leading-relaxed font-sans">
                        Evaluasi pemahaman kosakata dan ejaan cerita.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {quizCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-sans">
                        Belum dikerjakan
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
