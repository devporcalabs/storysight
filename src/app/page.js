"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Play, 
  Plus, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  Flame, 
  Tag, 
  Compass,
  ArrowRight,
  BookOpen,
  Award,
  Trophy,
  School,
  CheckCircle2,
  Search
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const [stories, setStories] = useState([]);
  const [carouselBanners, setCarouselBanners] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  // Carousel States
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Category/Genre States
  const genres = ["Semua", "Fantasy", "Mystery", "Daily Life", "Horror", "Business", "Romance", "School"];
  const [selectedGenre, setSelectedGenre] = useState("Semua");

  // Search & Level Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Semua");
  
  // Favorites local state
  const [favorites, setFavorites] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderMobileStoryCard = (story) => {
     let completedSteps = 0;
     if (story.progress?.isPdfRead) completedSteps++;
     if (story.progress?.isVideoWatched) completedSteps++;
     if (story.progress?.isQuizCompleted) completedSteps++;
     const progressPercentage = Math.round((completedSteps / 3) * 100);

     const rating = (4.5 + (story.title.length % 5) * 0.1).toFixed(1);
     const views = (12 + (story.description.length % 88)) * 10;

     return (
       <div
         key={story.id}
         className="w-full bg-white rounded-[18px] overflow-hidden border border-slate-100 mobile-card-shadow flex flex-col justify-between transition-all duration-300 tap-feedback active:scale-[0.97] animate-fade-in-up"
       >
         <Link href={`/stories/${story.slug}`} className="block relative aspect-video w-full overflow-hidden">
           <img
             src={story.thumbnailUrl}
             alt={story.title}
             loading="lazy"
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
           
           <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-primary px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm">
             {story.level}
           </div>

           <button
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               toggleFavorite(story.id);
             }}
             className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm text-slate-700 hover:text-primary active:scale-90 transition-all z-20 cursor-pointer"
             aria-label="Bookmark story"
           >
             <svg
               className={`w-4 h-4 ${favorites.includes(story.id) ? "fill-primary text-primary" : "text-slate-400"}`}
               xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2.5"
               strokeLinecap="round"
               strokeLinejoin="round"
             >
               <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
             </svg>
           </button>
         </Link>

         <div className="p-4 flex-1 flex flex-col justify-between">
           <div>
             <div className="flex items-center justify-between mb-2">
               <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                 {story.genre}
               </span>
               <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                 <span className="flex items-center gap-0.5 text-amber-500">★ {rating}</span>
                 <span>•</span>
                 <span>👁 {views} views</span>
               </div>
             </div>

             <Link href={`/stories/${story.slug}`}>
               <h3 className="font-semibold text-slate-800 text-[18px] leading-snug line-clamp-2 mb-1 hover:text-primary transition-colors">
                 {story.title}
               </h3>
             </Link>

             <p className="text-[#64748B] text-[14px] line-clamp-1 mb-3">
               {story.description}
             </p>
           </div>

           <div>
             {story.progress && story.progress.progressStatus !== "NOT_STARTED" && (
               <div className="mb-3">
                 <div className="flex justify-between items-center text-[9px] font-extrabold text-[#64748B] mb-1">
                   <span>PROGRES</span>
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

             <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
               <span className="text-[10px] text-[#64748B] font-bold uppercase">
                 ⏱ {Math.round(story.duration / 60)} Mins
               </span>
               <Link
                 href={`/stories/${story.slug}`}
                 className="text-[11px] font-extrabold text-primary flex items-center gap-0.5 uppercase hover:translate-x-0.5 transition-transform"
               >
                 {story.progress?.progressStatus === "COMPLETED"
                   ? "Review"
                   : story.progress?.progressStatus === "IN_PROGRESS"
                   ? "Lanjutkan"
                   : "Mulai"}
                 <ArrowRight className="w-3 h-3 ml-0.5" />
               </Link>
             </div>
           </div>
         </div>
       </div>
     );
  };

  // Load Initial Data
  useEffect(() => {
    // Fetch initial stories, banners, user session, and leaderboard
    const loadData = async () => {
      try {
        const [storiesRes, sessionRes, carouselRes, leaderboardRes] = await Promise.all([
          fetch("/api/stories"),
          fetch("/api/auth/me"),
          fetch("/api/carousel"),
          fetch("/api/leaderboard")
        ]);
        const storiesData = await storiesRes.json();
        const sessionData = await sessionRes.json();
        const carouselData = await carouselRes.json();
        const leaderboardData = await leaderboardRes.json();
        
        setStories(Array.isArray(storiesData) ? storiesData : []);
        setCarouselBanners(Array.isArray(carouselData) ? carouselData : []);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
        
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
  const filteredCategoryStories = stories.filter(story => {
    const matchesGenre = selectedGenre === "Semua" || story.genre === selectedGenre;
    const matchesLevel = selectedLevel === "Semua" || story.level === selectedLevel;
    const matchesSearch = searchQuery === "" || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesGenre && matchesLevel && matchesSearch;
  });

  const displayCategoryStories = (selectedGenre === "Semua" && selectedLevel === "Semua" && searchQuery === "")
    ? filteredCategoryStories.slice(0, 6)
    : filteredCategoryStories;

  return (
    <>
      <Navbar />
      
      {/* 1. Loading State */}
      {loading ? (
        <>
          {/* Desktop Loading */}
          <div className="hidden md:flex justify-center items-center py-40">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          
          {/* Mobile Loading Skeleton */}
          <div className="md:hidden space-y-6 px-5 py-6 bg-[#FAFAFA] min-h-screen">
            {/* Hero Skeleton */}
            <div className="w-full h-[200px] rounded-[20px] skeleton-loading" />
            
            {/* Category Chips Skeletons */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-20 h-9 rounded-full skeleton-loading shrink-0" />
              ))}
            </div>
            
            {/* Story Cards Skeletons */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="w-full bg-white rounded-[18px] p-4 border border-slate-100 space-y-3 mobile-card-shadow">
                  <div className="w-full aspect-video rounded-[14px] skeleton-loading" />
                  <div className="h-4 w-1/3 rounded-full skeleton-loading" />
                  <div className="h-5 w-3/4 rounded-full skeleton-loading" />
                  <div className="h-4 w-1/2 rounded-full skeleton-loading" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : stories.length === 0 ? (
        <div className="glass-card p-20 text-center rounded-[32px] m-4">
          <p className="text-slate-500 font-bold text-lg">Belum ada cerita yang dipublikasikan.</p>
        </div>
      ) : (
        <>
          {/* 2. Desktop Layout (hidden md:block) */}
          <div className="hidden md:block">
            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12 overflow-x-hidden">
              {/* 1. Hero Carousel Banner */}
              <section className="relative w-full h-[260px] xs:h-[320px] sm:h-[380px] md:h-[480px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl bg-slate-900 group">
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
                      <div className="absolute bottom-3 left-3 right-3 sm:bottom-8 sm:left-6 md:bottom-16 md:left-16 max-w-xl text-white z-20 space-y-1.5 sm:space-y-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/95 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {story.level}
                          </span>
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {story.genre}
                          </span>
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {Math.round(story.duration / 60)} Mins
                          </span>
                        </div>

                        {/* Title - ONLY this uses Fredoka */}
                        <h1 className="font-display text-lg xs:text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md line-clamp-2">
                          {story.title}
                        </h1>

                        {/* Description — hidden on very small screens */}
                        <p className="hidden xs:block text-slate-300 text-[10px] sm:text-xs md:text-sm font-semibold line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow">
                          {story.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          <Link
                            href={`/stories/${story.slug}`}
                            className="inline-flex items-center justify-center gap-1.5 bg-white text-slate-950 text-[10px] sm:text-xs font-bold px-3 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-slate-200 transition-all shadow-lg active:scale-95"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current" /> Putar sekarang
                          </Link>
                          <button
                            onClick={() => toggleFavorite(story.id)}
                            className="hidden xs:inline-flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-2 sm:px-6 sm:py-3 rounded-full border border-white/25 hover:bg-white/30 transition-all shadow-lg active:scale-95 cursor-pointer"
                          >
                            {favorites.includes(story.id) ? (
                              <>
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" /> Tersimpan
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Favorit Saya
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
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 backdrop-blur-md text-white items-center justify-center border border-white/10 hover:bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 backdrop-blur-md text-white items-center justify-center border border-white/10 hover:bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slider Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 md:right-16 flex gap-1.5 z-30">
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
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    Sedang Tren
                  </h2>
                </div>

                {/* Story Slider Container — full-bleed on mobile */}
                <div className="-mx-3 sm:mx-0 px-3 sm:px-0">
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                    {trendingStories.map((story) => {
                      let completedSteps = 0;
                      if (story.progress?.isPdfRead) completedSteps++;
                      if (story.progress?.isVideoWatched) completedSteps++;
                      if (story.progress?.isQuizCompleted) completedSteps++;
                      const progressPercentage = Math.round((completedSteps / 3) * 100);

                      return (
                        <Link
                          key={story.id}
                          href={`/stories/${story.slug}`}
                          className="w-[75vw] xs:w-[50vw] sm:w-[280px] flex-shrink-0 snap-start group block glass-card rounded-[20px] sm:rounded-[24px] p-3 border border-slate-200/60 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_32px_-8px_rgba(46,42,92,0.15)] hover:-translate-y-1.5 transition-all duration-300"
                        >
                          {/* Card Image */}
                          <div className="relative aspect-video w-full rounded-[14px] overflow-hidden mb-3">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/20" />
                            <img
                              src={story.thumbnailUrl}
                              alt={story.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="bg-white/95 backdrop-blur-md text-primary px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm">
                                {story.level}
                              </span>
                            </div>
                            {story.progress?.progressStatus === "COMPLETED" && (
                              <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          {/* Card Info */}
                          <div className="px-1 text-left flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider truncate">{story.genre}</span>
                                <span className="text-[9px] text-slate-300 shrink-0">&bull;</span>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">⏱ {Math.round(story.duration / 60)}m</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors leading-snug">
                                {story.title}
                              </h4>
                              <p className="text-slate-500 text-[10px] sm:text-xs mt-1 line-clamp-2 leading-relaxed font-semibold">
                                {story.description}
                              </p>
                            </div>

                            {/* Progress / Action */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 font-bold">
                                ⏱ {Math.round(story.duration / 60)} menit
                              </span>
                              <div className="text-[10px] font-bold text-white bg-primary px-3 py-1.5 rounded-lg shadow-sm">
                                {story.progress?.progressStatus === "COMPLETED"
                                  ? "Review"
                                  : story.progress?.progressStatus === "IN_PROGRESS"
                                  ? "Lanjutkan"
                                  : "Mulai"}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 3. Kategori Cerita (Category) Section */}
              <section className="glass-card p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[32px] border-white/20 space-y-4 sm:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800">
                      Kategori Cerita
                    </h2>
                  </div>

                  {/* Search & Level Filter Controls (Desktop) */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[400px]">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari judul cerita..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 active:scale-95"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition min-w-[130px]"
                    >
                      <option value="Semua">Semua Level</option>
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                      <option value="Level 4">Level 4</option>
                      <option value="Level 5">Level 5</option>
                      <option value="Level 6">Level 6</option>
                    </select>
                  </div>
                </div>

                {/* Genre Selector Pills - scrollable row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0">
                  {genres.map((genre) => {
                    const isSelected = selectedGenre === genre;
                    return (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                          isSelected
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-white/60 hover:bg-white/80 text-slate-500 hover:text-slate-800 border border-slate-200/60"
                        }`}
                      >
                        {genre === "Semua" ? "Semua" : genre}
                      </button>
                    );
                  })}
                </div>

                {/* Categorized Content Grid */}
                {filteredCategoryStories.length === 0 ? (
                  <div className="bg-slate-100/30 rounded-2xl p-8 text-center border border-dashed border-slate-200/50">
                    <p className="text-slate-400 text-xs font-semibold">
                      Tidak ada cerita yang cocok dengan kriteria pencarian Anda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                    {displayCategoryStories.map((story) => {
                      let completedSteps = 0;
                      if (story.progress?.isPdfRead) completedSteps++;
                      if (story.progress?.isVideoWatched) completedSteps++;
                      if (story.progress?.isQuizCompleted) completedSteps++;
                      const progressPercentage = Math.round((completedSteps / 3) * 100);

                      return (
                        <Link
                          key={story.id}
                          href={`/stories/${story.slug}`}
                          className="glass-card rounded-[20px] sm:rounded-[24px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/20" />
                            <img
                              src={story.thumbnailUrl}
                              alt={story.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[9px] font-bold text-primary shadow-sm uppercase tracking-wider">
                                {story.level}
                              </span>
                            </div>

                            {story.progress?.progressStatus === "COMPLETED" && (
                              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider truncate">{story.genre}</span>
                                <span className="text-[9px] text-slate-300 shrink-0">&bull;</span>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">⏱ {Math.round(story.duration / 60)}m</span>
                              </div>
                              <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base mb-1.5 sm:mb-2 group-hover:text-primary transition leading-snug line-clamp-1 sm:line-clamp-2">
                                {story.title}
                              </h3>
                              <p className="text-slate-500 text-[10px] sm:text-xs mt-1 sm:mt-2 line-clamp-2 leading-relaxed font-semibold">
                                {story.description}
                              </p>
                            </div>

                            <div className="mt-4 sm:mt-8">
                              {story.progress && story.progress.progressStatus !== "NOT_STARTED" && (
                                <div className="mb-3 sm:mb-4">
                                  <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 mb-1">
                                    <span>PROGRES</span>
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

                              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100/60">
                                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">
                                  {Math.round(story.duration / 60)} menit
                                </span>

                                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-white bg-primary hover:brightness-110 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md transition-all duration-200">
                                  {story.progress?.progressStatus === "COMPLETED"
                                    ? "Review"
                                    : story.progress?.progressStatus === "IN_PROGRESS"
                                    ? "Lanjutkan"
                                    : "Mulai"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 4. Rekomendasi (Recommendations) Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Rekomendasi Cerita
                  </h2>
                </div>

                {/* Recommendation Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {stories.map((story) => {
                    let completedSteps = 0;
                    if (story.progress?.isPdfRead) completedSteps++;
                    if (story.progress?.isVideoWatched) completedSteps++;
                    if (story.progress?.isQuizCompleted) completedSteps++;
                    const progressPercentage = Math.round((completedSteps / 3) * 100);

                    return (
                      <Link
                        key={story.id}
                        href={`/stories/${story.slug}`}
                        className="glass-card rounded-[20px] sm:rounded-[24px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/20" />
                          <img
                            src={story.thumbnailUrl}
                            alt={story.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[9px] font-bold text-primary shadow-sm uppercase tracking-wider">
                              {story.level}
                            </span>
                          </div>

                          {story.progress?.progressStatus === "COMPLETED" && (
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider truncate">{story.genre}</span>
                              <span className="text-[9px] text-slate-300 shrink-0">&bull;</span>
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">⏱ {Math.round(story.duration / 60)}m</span>
                            </div>
                            <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base mb-1.5 sm:mb-2 group-hover:text-primary transition leading-snug line-clamp-1 sm:line-clamp-2">
                              {story.title}
                            </h3>
                            <p className="text-slate-500 text-[10px] sm:text-xs mt-1 sm:mt-2 line-clamp-2 leading-relaxed font-semibold">
                              {story.description}
                            </p>
                          </div>

                          <div className="mt-4 sm:mt-8">
                            {story.progress && story.progress.progressStatus !== "NOT_STARTED" && (
                              <div className="mb-3 sm:mb-4">
                                <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 mb-1">
                                  <span>PROGRES</span>
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

                            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100/60">
                              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">
                                {Math.round(story.duration / 60)} menit
                              </span>

                              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-white bg-primary hover:brightness-110 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md transition-all duration-200">
                                {story.progress?.progressStatus === "COMPLETED"
                                  ? "Review"
                                  : story.progress?.progressStatus === "IN_PROGRESS"
                                  ? "Lanjutkan"
                                  : "Mulai"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* 5. Papan Peringkat (Leaderboard) Section */}
              <section id="leaderboard" className="bg-[#2E2A5C] rounded-[26px] p-4 sm:p-8 md:p-12 shadow-2xl overflow-hidden relative">
                {/* Background glow */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#6C5CC4]/20 rounded-full blur-3xl -z-10 -translate-y-1/2"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
                  {/* Left side: Intro */}
                  <div className="flex flex-col gap-3 sm:gap-5 z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFE9A8] flex items-center justify-center text-lg sm:text-xl shadow-inner">
                      🏆
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                      Papan Peringkat Siswa
                    </h2>
                    <p className="text-[#C9C4E6] text-xs sm:text-sm leading-relaxed max-w-sm">
                      Selesaikan kuis setelah membaca cerita untuk naik peringkat dan kumpulkan skor terbaikmu.
                    </p>
                    <Link href="/leaderboard" className="mt-1 sm:mt-2 w-fit inline-flex items-center justify-center px-5 py-3 sm:px-6 sm:py-3.5 rounded-full bg-[#FFE9A8] hover:bg-[#FFD66B] text-[#7A5200] font-extrabold text-xs sm:text-sm transition-all shadow-[0_8px_20px_-6px_rgba(255,231,163,0.3)] hover:-translate-y-0.5 active:scale-95">
                      Lihat semua peringkat
                    </Link>
                  </div>

                  {/* Right side: List */}
                  <div className="z-10 w-full min-w-0">
                    {leaderboard.length === 0 ? (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
                        <p className="text-[#C9C4E6] text-sm font-semibold">
                          Belum ada data peringkat siswa saat ini.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[480px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
                        {leaderboard.slice(0, 10).map((student, index) => {
                          const rank = index + 1;
                          const isFirst = rank === 1;
                          return (
                            <div key={student.id} className={`w-full min-w-0 flex items-center gap-2 sm:gap-4 p-3 sm:px-5 sm:py-4 rounded-2xl border transition-all duration-300 hover:bg-white/10 backdrop-blur-md ${isFirst ? 'bg-white/10 border-[#FFE9A8]/30 shadow-[0_4px_24px_-8px_rgba(46,42,92,0.5)]' : 'bg-white/5 border-white/10'}`}>
                              {/* Medal/Rank */}
                              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm shadow-inner ${
                                rank === 1 ? 'bg-gradient-to-br from-[#FFE9A8] to-[#FFB938] text-[#7A5200] shadow-[#FFD66B]/50' : 
                                rank === 2 ? 'bg-[#C0C0C0] text-slate-800' : 
                                rank === 3 ? 'bg-[#CD7F32] text-amber-950' : 
                                'bg-white/10 text-[#C9C4E6] border border-white/5'
                              }`}>
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                              </div>
                              
                              {/* Student Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold text-sm sm:text-base truncate">{student.name}</h4>
                                <p className="text-[#C9C4E6] text-[10px] sm:text-xs truncate">{student.school} {student.class ? `(${student.class})` : ""}</p>
                              </div>
                              
                              {/* Stats */}
                              <div className="flex items-center gap-4 text-right shrink-0">
                                <div className="hidden sm:block">
                                  <span className="block text-white font-black text-sm">{student.attemptsCount || 0}</span>
                                  <span className="block text-[#C9C4E6] text-[10px]">kuis selesai</span>
                                </div>
                                <div className="bg-[#4CB963]/20 border border-[#4CB963]/30 text-[#8FE6A1] font-black text-sm px-3.5 py-1.5 rounded-xl shadow-inner min-w-[3.5rem] text-center">
                                  {Math.round(student.averageScore)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </main>

            {/* Desktop Footer */}
            <footer className="bg-white border-t border-slate-200 mt-12 sm:mt-20 pt-10 sm:pt-16 pb-8 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-10 sm:mb-16">
                  
                  <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col items-start gap-4 sm:gap-5">
                    <Link href="/" className="flex items-center gap-3 group">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">💡</span>
                      </div>
                      <span className="font-bold text-2xl text-slate-800">StorySight</span>
                    </Link>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                      Platform interaktif untuk belajar bahasa Inggris melalui cerita yang menyenangkan dan penuh imajinasi bagi siswa.
                    </p>
                    
                    <div className="flex flex-col gap-3 mt-2">
                      <a href="https://wa.me/62895809372277" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">📱</div>
                        0895-8093-72277
                      </a>
                      <a href="mailto:storysight.id@gmail.com" className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">✉️</div>
                        storysight.id@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Shortcuts Column */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-800 tracking-wide uppercase text-sm">Pintasan</h4>
                    <nav className="flex flex-col gap-3 text-sm text-slate-500">
                      <Link href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Semua Cerita</Link>
                      {session ? (
                        <Link href="/dashboard" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Dashboard Siswa</Link>
                      ) : (
                        <Link href="/login" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Masuk / Daftar</Link>
                      )}
                      <Link href="/#leaderboard" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Papan Peringkat</Link>
                    </nav>
                  </div>

                  {/* Help Column */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-800 tracking-wide uppercase text-sm">Bantuan</h4>
                    <nav className="flex flex-col gap-3 text-sm text-slate-500">
                      <Link href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Pusat Bantuan</Link>
                      <Link href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">FAQ</Link>
                      <Link href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Panduan Pengguna</Link>
                    </nav>
                  </div>

                  {/* Legal Column */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-800 tracking-wide uppercase text-sm">Legal</h4>
                    <nav className="flex flex-col gap-3 text-sm text-slate-500">
                      <Link href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Syarat & Ketentuan</Link>
                      <Link href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block w-fit">Kebijakan Privasi</Link>
                    </nav>
                  </div>

                </div>

                {/* Bottom Bar: Collaboration & Copyright */}
                <div className="pt-8 border-t border-slate-200/60 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
                  <p className="text-xs text-slate-400 font-medium text-center md:text-left">
                    © 2026 StorySight. Bridging education and imagination.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">In Collaboration With</span>
                    <div className="flex items-center gap-5">
                      <img src="/logo-diu.jpeg" alt="DIU UNY Logo" className="h-7 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 rounded" />
                      <img src="/logo-porcalabs.png" alt="Porcalabs Indonesia Logo" className="h-5 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* 3. Mobile Layout (block md:hidden) */}
          <div className="block md:hidden bg-[#FAFAFA] min-h-screen">
            <main className="pb-32 pt-4 px-5 space-y-[24px] overflow-x-hidden">
              {/* 1. Hero Carousel Banner */}
              <section className="relative w-full h-[200px] rounded-[20px] overflow-hidden mobile-card-shadow bg-slate-900">
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
                        loading="lazy"
                        className="w-full h-full object-cover object-center"
                      />
                      
                      {/* Cinematic Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent z-10" />

                      {/* Content */}
                      <div className="absolute bottom-4 left-4 right-4 z-20 text-white flex flex-col justify-end">
                        <span className="px-2 py-0.5 rounded-full bg-primary text-[8px] font-bold uppercase tracking-wider w-fit mb-1 shadow-sm">
                          {story.genre}
                        </span>
                        <h1 className="font-display text-[18px] font-semibold tracking-tight leading-tight text-white mb-0.5 line-clamp-1">
                          {story.title}
                        </h1>
                        <p className="text-slate-300 text-[14px] line-clamp-1 mb-2.5 font-normal leading-relaxed">
                          {story.description}
                        </p>
                        <Link
                          href={`/stories/${story.slug}`}
                          className="inline-flex items-center justify-center bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-[14px] w-fit active:scale-95 transition-all shadow-md"
                        >
                          <Play className="w-2.5 h-2.5 mr-1 fill-current" /> Mulai Membaca
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Slider Dots */}
                <div className="absolute bottom-3 right-4 flex gap-1 z-30">
                  {featuredBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeSlide ? "w-4 bg-white" : "w-1 bg-white/40"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </section>

              {/* 2. Sedang Tren (Trending) Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Flame className="w-4 h-4 fill-current" />
                  </div>
                  <h2 className="text-[24px] font-bold text-slate-800 tracking-tight">
                    Sedang Tren
                  </h2>
                </div>

                {/* Full-bleed scroll for mobile cards */}
                <div className="flex gap-[16px] overflow-x-auto pb-2 scrollbar-none -mx-5 px-5 snap-x snap-mandatory">
                  {trendingStories.map((story) => (
                    <div key={story.id} className="w-[82vw] xs:w-[72vw] shrink-0 snap-start">
                      {renderMobileStoryCard(story)}
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Kategori Cerita Section */}
              <section className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Tag className="w-4 h-4" />
                      </div>
                      <h2 className="text-[24px] font-bold text-slate-800 tracking-tight">
                        Kategori Cerita
                      </h2>
                    </div>
                  </div>

                  {/* Search & Level Filter Controls (Mobile) */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari cerita..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-100/80 border border-slate-200/40 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 active:scale-95"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200/40 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition"
                    >
                      <option value="Semua">Semua Level</option>
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                      <option value="Level 4">Level 4</option>
                      <option value="Level 5">Level 5</option>
                      <option value="Level 6">Level 6</option>
                    </select>
                  </div>
                </div>

                {/* Category Scroll Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5">
                  {genres.map((genre) => {
                    const isSelected = selectedGenre === genre;
                    return (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 active:scale-[0.97] ${
                          isSelected
                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>

                {/* Category Stories Grid */}
                {filteredCategoryStories.length === 0 ? (
                  <div className="bg-slate-100/30 rounded-2xl p-8 text-center border border-dashed border-slate-200/50">
                    <p className="text-slate-400 text-xs font-semibold">
                      Tidak ada cerita yang cocok dengan kriteria pencarian Anda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-[16px]">
                    {displayCategoryStories.map((story) => renderMobileStoryCard(story))}
                  </div>
                )}
              </section>

              {/* 4. Rekomendasi Cerita Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h2 className="text-[24px] font-bold text-slate-800 tracking-tight">
                    Rekomendasi Cerita
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-[16px]">
                  {stories.map((story) => renderMobileStoryCard(story))}
                </div>
              </section>

              {/* 5. Leaderboard Section */}
              <section className="bg-[#2E2A5C] rounded-[20px] p-5 shadow-lg relative overflow-hidden text-white">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#6C5CC4]/20 rounded-full blur-2xl -z-10 -translate-y-1/2" />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-[#FFE9A8] flex items-center justify-center text-lg shadow-inner">🏆</div>
                    <h2 className="font-display text-[24px] font-bold text-white tracking-tight">Papan Peringkat Siswa</h2>
                    <p className="text-[#C9C4E6] text-[15px] leading-relaxed">
                      Selesaikan kuis setelah membaca cerita untuk naik peringkat dan kumpulkan skor terbaikmu.
                    </p>
                  </div>

                  <div>
                    {leaderboard.length === 0 ? (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <p className="text-[#C9C4E6] text-xs font-semibold">Belum ada data peringkat.</p>
                      </div>
                    ) : (
                      <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
                        {leaderboard.slice(0, 10).map((student, index) => {
                          const rank = index + 1;
                          const isFirst = rank === 1;
                          return (
                            <div
                              key={student.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                                isFirst
                                  ? "bg-white/10 border-[#FFE9A8]/30 shadow-md"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-xs shadow-inner ${
                                rank === 1 ? 'bg-gradient-to-br from-[#FFE9A8] to-[#FFB938] text-[#7A5200]' : 
                                rank === 2 ? 'bg-[#C0C0C0] text-slate-800' : 
                                rank === 3 ? 'bg-[#CD7F32] text-amber-950' : 
                                'bg-white/10 text-[#C9C4E6]'
                              }`}>
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold text-xs truncate">{student.name}</h4>
                                <p className="text-[#C9C4E6] text-[10px] truncate">
                                  {student.school} {student.class ? `(${student.class})` : ""}
                                </p>
                              </div>
                              
                              <div className="bg-[#4CB963]/20 border border-[#4CB963]/30 text-[#8FE6A1] font-black text-xs px-2.5 py-1 rounded-lg">
                                {Math.round(student.averageScore)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Link
                    href="/leaderboard"
                    className="w-full inline-flex items-center justify-center py-2.5 rounded-[14px] bg-[#FFE9A8] hover:bg-[#FFD66B] text-[#7A5200] font-bold text-xs transition-all active:scale-95 shadow-sm"
                  >
                    Lihat semua peringkat
                  </Link>
                </div>
              </section>

              {/* Mobile Footer */}
              <footer className="bg-white border-t border-slate-100 pt-8 pb-12 text-center px-5 rounded-t-[20px] -mx-5 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">💡</span>
                  <span className="font-bold text-lg text-slate-800">StorySight</span>
                </div>
                <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                  Platform interaktif untuk belajar bahasa Inggris melalui cerita yang menyenangkan dan penuh imajinasi bagi siswa.
                </p>
                <div className="flex flex-col gap-2 pt-2 text-xs text-slate-400">
                  <span>© 2026 StorySight. All rights reserved.</span>
                  <div className="flex items-center justify-center gap-4 pt-1">
                    <img src="/logo-diu.jpeg" alt="DIU Logo" className="h-6 w-auto object-contain rounded opacity-60" />
                    <img src="/logo-porcalabs.png" alt="Porcalabs Logo" className="h-4 w-auto object-contain opacity-60" />
                  </div>
                </div>
              </footer>
            </main>
          </div>

          {/* Scroll to Top FAB for Mobile */}
          {showScrollTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-[0_8px_30px_rgba(157,67,0,0.3)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 z-40 cursor-pointer"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-6 h-6 text-white" />
            </button>
          )}
        </>
      )}
    </>
  );
}
