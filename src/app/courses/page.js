"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 w-full flex-1">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
            StorySight E-Course
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            Tingkatkan Kemampuan Bahasa Inggris Bersama Mentor Ahli
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Belajar interaktif berbasis grup WhatsApp dengan bimbingan personal, naskah cerita eksklusif, kuis harian, dan e-certificate resmi.
          </p>
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl p-6 border border-slate-100 space-y-4 h-96">
                <div className="aspect-video bg-slate-200 rounded-2xl w-full" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="space-y-2 pt-4">
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-3xl flex flex-col items-center justify-center max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="font-display text-lg font-bold text-slate-700">Belum Ada Kelas</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Saat ini belum ada kelas e-course yang dibuka untuk pendaftaran. Silakan kembali lagi nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => {
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

              return (
                <div 
                  key={course.id}
                  className="glass-panel group rounded-3xl overflow-hidden hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between border border-slate-200/40 shadow-sm bg-white/60 backdrop-blur-md"
                >
                  {/* Top content */}
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/20 z-10" />
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {course.isFeatured && (
                        <span className="absolute top-4 left-4 z-20 px-3 py-1 text-[10px] font-black tracking-wide text-white primary-gradient rounded-full shadow-md">
                          Terpopuler
                        </span>
                      )}
                    </div>

                    {/* Metadata & Description */}
                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <span className="px-2.5 py-1 bg-primary/10 rounded-lg">Course</span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">{course.duration}</span>
                      </div>
                      
                      <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {course.shortDescription}
                      </p>

                      {/* Info list */}
                      <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Mulai: {new Date(course.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Mentor: {course.mentorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom pricing & Action */}
                  <div className="p-6 pt-0">
                    <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                      <div>
                        {hasPromo ? (
                          <>
                            <span className="block text-[11px] text-slate-400 line-through font-semibold">{formatPrice(normalPrice)}</span>
                            <span className="block text-lg font-black text-[#e11d48]">{formatPrice(promoPrice)}</span>
                          </>
                        ) : (
                          <span className="block text-lg font-black text-slate-800">{formatPrice(normalPrice)}</span>
                        )}
                      </div>

                      <Link 
                        href={`/courses/${course.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full primary-gradient text-white hover:shadow-lg text-xs font-bold shadow-md transition cursor-pointer"
                      >
                        Lihat Kelas <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} StorySight. All rights reserved.
      </footer>
    </div>
  );
}
