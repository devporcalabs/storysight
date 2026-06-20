"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Play, 
  Plus, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Tag, 
  Compass,
  ArrowRight,
  BookOpen,
  Award
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const [stories, setStories] = useState([]);
  const [carouselBanners, setCarouselBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  // Carousel States
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Category/Genre States
  const genres = ["Semua", "Fantasy", "Mystery", "Daily Life", "Horror", "Business", "Romance", "School"];
  const [selectedGenre, setSelectedGenre] = useState("Semua");
  
  // Favorites local state
  const [favorites, setFavorites] = useState([]);

  // Load Initial Data
  useEffect(() => {
    // Fetch initial stories, banners, and user session
    const loadData = async () => {
      try {
        const [storiesRes, sessionRes, carouselRes] = await Promise.all([
          fetch("/api/stories"),
          fetch("/api/auth/me"),
          fetch("/api/carousel")
        ]);
        const storiesData = await storiesRes.json();
        const sessionData = await sessionRes.json();
        const carouselData = await carouselRes.json();
        
        setStories(Array.isArray(storiesData) ? storiesData : []);
        setCarouselBanners(Array.isArray(carouselData) ? carouselData : []);
        
        if (sessionData.authenticated) {
          setSession(sessionData.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Load favorites from localstorage
    const savedFavs = localStorage.getItem("favorites");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Carousel Auto-advance
  useEffect(() => {
    const slideCount = carouselBanners.length > 0 ? carouselBanners.length : Math.min(stories.length, 5);
    if (slideCount <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [stories, carouselBanners]);

  // Toggle favorite locally
  const toggleFavorite = (storyId) => {
    let updated;
    if (favorites.includes(storyId)) {
      updated = favorites.filter(id => id !== storyId);
    } else {
      updated = [...favorites, storyId];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handlePrevSlide = () => {
    const slideCount = carouselBanners.length > 0 ? carouselBanners.length : Math.min(stories.length, 5);
    setActiveSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    const slideCount = carouselBanners.length > 0 ? carouselBanners.length : Math.min(stories.length, 5);
    setActiveSlide((prev) => (prev + 1) % slideCount);
  };

  // Compile carousel banners: use dynamic banners if uploaded, otherwise fallback to first 5 stories
  const featuredBanners = carouselBanners.length > 0
    ? carouselBanners
    : stories.slice(0, 5).map(s => ({ id: s.id, imageUrl: s.thumbnailUrl, story: s }));

  const trendingStories = stories.slice(0, 6);
  const filteredCategoryStories = selectedGenre === "Semua" 
    ? stories.slice(0, 6) // limit to 6 for a clean row
    : stories.filter(story => story.genre === selectedGenre);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-12">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="glass-card p-20 text-center rounded-[32px]">
            <p className="text-slate-500 font-bold text-lg">Belum ada cerita yang dipublikasikan.</p>
          </div>
        ) : (
          <>
            {/* 1. Hero Carousel Banner */}
            <section className="relative w-full h-[380px] md:h-[480px] rounded-[32px] overflow-hidden shadow-xl bg-slate-900 group">
              {/* Carousel Slides */}
              {featuredBanners.map((banner, index) => {
                const isActive = index === activeSlide;
                const { story } = banner;
                if (!story) return null; // safety check
                
                return (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    {/* Background cover image */}
                    <img
                      src={banner.imageUrl}
                      alt={story.title}
                      className="w-full h-full object-cover object-center"
                    />
                    
                    {/* Cinematic Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent z-10" />

                    {/* Content */}
                    <div className="absolute bottom-8 left-6 md:bottom-16 md:left-16 max-w-xl text-white z-20 space-y-4">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary/95 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {story.level}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {story.genre}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {Math.round(story.duration / 60)} Mins
                        </span>
                      </div>

                      {/* Title */}
                      <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-none drop-shadow-md">
                        {story.title}
                      </h1>

                      {/* Description */}
                      <p className="text-slate-300 text-xs md:text-sm font-semibold line-clamp-3 leading-relaxed drop-shadow">
                        {story.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Link
                          href={`/stories/${story.slug}`}
                          className="inline-flex items-center gap-2 bg-white text-slate-950 font-display text-xs md:text-sm font-black px-6 py-3 rounded-full hover:bg-slate-200 transition-all shadow-lg active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-current" /> Putar sekarang
                        </Link>
                        <button
                          onClick={() => toggleFavorite(story.id)}
                          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-display text-xs md:text-sm font-black px-6 py-3 rounded-full border border-white/25 hover:bg-white/30 transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                          {favorites.includes(story.id) ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" /> Tersimpan
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Favorit Saya
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slider Dots */}
              <div className="absolute bottom-6 right-6 md:right-16 flex gap-1.5 z-35">
                {featuredBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* 2. Sedang Tren (Trending) Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <h2 className="font-display text-lg font-black text-slate-800 tracking-tight">
                  Sedang Tren
                </h2>
              </div>

              {/* Story Slider Container */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                {trendingStories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.slug}`}
                    className="w-[140px] sm:w-[160px] md:w-[185px] flex-shrink-0 snap-start group block space-y-2.5"
                  >
                    {/* Poster Card */}
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden glass-card shadow-sm border-white/20 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-md group-hover:border-primary/20">
                      <img
                        src={story.thumbnailUrl}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Top Right Difficulty Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider">
                          {story.level}
                        </span>
                      </div>
                    </div>

                    {/* Title & Info outside */}
                    <div className="px-1 text-center sm:text-left">
                      <h4 className="font-display font-black text-slate-800 text-xs sm:text-sm line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                        {story.title}
                      </h4>
                      <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                        {story.genre} &bull; {Math.round(story.duration / 60)} Min
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 3. Kategori Cerita (Category) Section */}
            <section className="glass-card p-6 md:p-8 rounded-[32px] border-white/20 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h2 className="font-display text-lg font-black text-slate-800 tracking-tight">
                    Kategori Cerita
                  </h2>
                </div>

                {/* Genre Selector Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-display w-full lg:w-auto">
                  {genres.map((genre) => {
                    const isSelected = selectedGenre === genre;
                    return (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white scale-105 shadow-md shadow-primary/20"
                            : "bg-white/40 hover:bg-white/80 text-slate-500 hover:text-slate-800 border border-white/20"
                        }`}
                      >
                        {genre === "Semua" ? "Semua Kategori" : genre}
                      </button>
                    );
                  })}
                </div>

                <Link
                  href="/stories"
                  className="text-slate-400 hover:text-primary transition-colors text-xs font-bold font-display whitespace-nowrap"
                >
                  Lihat lebih banyak &gt;
                </Link>
              </div>

              {/* Categorized Content Grid */}
              {filteredCategoryStories.length === 0 ? (
                <div className="bg-slate-100/30 rounded-2xl p-8 text-center border border-dashed border-slate-200/50">
                  <p className="text-slate-400 text-xs font-semibold">
                    Tidak ada cerita dalam kategori ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredCategoryStories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.slug}`}
                      className="group block space-y-2"
                    >
                      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden glass-card shadow-sm border-white/20 transition-transform duration-300 group-hover:scale-[1.02]">
                        <img
                          src={story.thumbnailUrl}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-slate-900/80 backdrop-blur-md text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                            {story.level}
                          </span>
                        </div>
                      </div>
                      <div className="px-0.5">
                        <h4 className="font-display font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-primary transition-colors">
                          {story.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Rekomendasi (Recommendations) Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Compass className="w-4 h-4" />
                </div>
                <h2 className="font-display text-lg font-black text-slate-800 tracking-tight">
                  Rekomendasi Cerita
                </h2>
              </div>

              {/* Recommendation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {stories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.slug}`}
                    className="group block space-y-2.5"
                  >
                    {/* Poster Card */}
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden glass-card shadow-sm border-white/20 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-md group-hover:border-primary/20">
                      <img
                        src={story.thumbnailUrl}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Top Right Difficulty Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider">
                          {story.level}
                        </span>
                      </div>
                    </div>

                    {/* Title & Info outside */}
                    <div className="px-1">
                      <h4 className="font-display font-black text-slate-800 text-xs sm:text-sm line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                        {story.title}
                      </h4>
                      <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                        {story.genre} &bull; {Math.round(story.duration / 60)} Min
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="font-display font-black text-xl text-primary">StorySight</div>
            <p className="text-[10px] text-slate-400 font-semibold">© 2026 StorySight. Bridging education and imagination.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Help Center</Link>
            {session ? (
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            ) : (
              <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
