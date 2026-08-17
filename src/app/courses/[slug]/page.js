"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users, Award, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        if (!res.ok) {
          router.push("/courses");
          return;
        }
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course detail:", err);
        router.push("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-surface mesh-gradient min-h-screen font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  if (!course) return null;

  const normalPrice = course.price;
  const promoPrice = course.discountPrice;
  const hasPromo = promoPrice !== null && promoPrice < normalPrice;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const isClosed = course.status === "CLOSED";
  const isFull = course.isFull;

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 w-full flex-1">
        {/* Back Link */}
        <div className="w-full mb-6">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Katalog
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image, Description, outcomes, mentor */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Header / Banner Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-sm bg-white/60 backdrop-blur-md space-y-6">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <span className="px-2.5 py-1 bg-primary/10 rounded-lg">Level: {course.level || "Semua"}</span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">{course.duration}</span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                  {course.title}
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Learning Outcomes Section */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-sm bg-white/60 backdrop-blur-md space-y-4">
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Apa yang Akan Dipelajari
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 text-xs sm:text-sm font-semibold">
                  {course.learningOutcomes.map((lo) => (
                    <div key={lo.id} className="flex items-start gap-2 bg-white/40 p-3 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{lo.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Section */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-sm bg-white/60 backdrop-blur-md space-y-4">
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Mentor Kelas
              </h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white/40 rounded-2xl border border-slate-100">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shadow shrink-0">
                  <img 
                    src={course.mentorPhotoUrl} 
                    alt={course.mentorName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left min-w-0">
                  <h4 className="text-slate-800 font-bold text-sm sm:text-base">{course.mentorName}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{course.mentorBio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Pricing and Registration Status */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-xl bg-white/80 backdrop-blur-md space-y-6">
              <div className="space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Investasi Belajar</span>
                {hasPromo ? (
                  <div className="space-y-1">
                    <span className="text-[#e11d48] text-2xl sm:text-3xl font-black">{formatPrice(promoPrice)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 line-through text-xs font-bold">{formatPrice(normalPrice)}</span>
                      <span className="px-2 py-0.5 bg-rose-100 text-[#e11d48] text-[10px] font-black rounded-lg">Hemat {Math.round(((normalPrice - promoPrice) / normalPrice) * 100)}%</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-800 text-2xl sm:text-3xl font-black block">{formatPrice(normalPrice)}</span>
                )}
              </div>

              {/* Course Info Cards */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <span className="text-slate-400 font-bold">Mulai Kelas</span>
                  <span className="text-slate-800 font-bold">{new Date(course.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <span className="text-slate-400 font-bold">Durasi Kelas</span>
                  <span className="text-slate-800 font-bold">{course.duration}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <span className="text-slate-400 font-bold">Sisa Kuota</span>
                  <span className="text-slate-800 font-bold">{course.quota - (course.paidParticipantsCount || 0)} dari {course.quota} Kursi</span>
                </div>
              </div>

              {/* Benefits list */}
              {course.benefits && course.benefits.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Fasilitas Kelas:</span>
                  <ul className="space-y-1.5 text-xs text-slate-600 font-semibold">
                    {course.benefits.map((b) => (
                      <li key={b.id} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{b.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-3 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50 text-[10px] text-emerald-700 font-bold">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Transaksi Aman & WhatsApp Konfirmasi Langsung</span>
              </div>

              {/* Action Buttons */}
              {isClosed ? (
                <button
                  disabled
                  className="w-full py-3.5 rounded-full bg-slate-200 text-slate-400 text-xs sm:text-sm font-bold border border-slate-300/40 cursor-not-allowed text-center"
                >
                  Pendaftaran Ditutup
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-3.5 rounded-full bg-slate-200 text-slate-400 text-xs sm:text-sm font-bold border border-slate-300/40 cursor-not-allowed text-center"
                >
                  Kuota Penuh
                </button>
              ) : (
                <Link
                  href={`/courses/${course.slug}/checkout`}
                  className="w-full py-3.5 rounded-full primary-gradient text-white hover:shadow-lg text-xs sm:text-sm font-black shadow-md transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Daftar Sekarang <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} StorySight. All rights reserved.
      </footer>
    </div>
  );
}
