"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Maximize2, Minimize2, Home, ChevronLeft, ChevronRight } from "lucide-react";

// Helper to convert Google Drive and GitHub links to embeddable / raw URLs
function getEmbeddablePdfUrl(url) {
  if (!url) return "";
  
  // 1. Google Drive Link
  if (url.includes("drive.google.com")) {
    const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    
    try {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("id");
      if (id) {
        return `https://drive.google.com/file/d/${id}/preview`;
      }
    } catch (e) {
      console.error("Invalid URL format:", e);
    }
  }

  // 2. GitHub Web link to Raw GitHub Link
  if (url.includes("github.com") && url.includes("/blob/")) {
    return url
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/");
  }
  
  return url;
}

// ─── ComicPage: renders a single PDF page onto a canvas ───────────────────────
function ComicPage({ pageNum, pdfDoc }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1.4);
  const renderTaskRef = useRef(null);
  const isRenderingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (!pdfDoc || rendered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !rendered && !isRenderingRef.current) {
            loadAndRenderPage();
          }
        });
      },
      { root: null, rootMargin: "800px 0px", threshold: 0.01 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => { if (containerRef.current) observer.unobserve(containerRef.current); };
  }, [pdfDoc, rendered]);

  const loadAndRenderPage = async () => {
    if (isRenderingRef.current) return;
    isRenderingRef.current = true;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const baseViewport = page.getViewport({ scale: 1.0 });
      setAspectRatio(baseViewport.height / baseViewport.width);
      const scale = 1200 / baseViewport.width;
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      setRendered(true);
    } catch (error) {
      if (error.name !== "RenderingCancelledException" && error.message !== "Rendering cancelled") {
        console.error(`Error rendering page ${pageNum}:`, error);
      }
    } finally {
      isRenderingRef.current = false;
    }
  };

  const estimatedHeight = typeof window !== "undefined"
    ? Math.min(window.innerWidth, 900) * aspectRatio : 650;

  return (
    <div
      ref={containerRef}
      id={`page-wrapper-${pageNum}`}
      data-page={pageNum}
      className="page-wrapper w-full bg-zinc-950 flex flex-col items-center justify-center relative border-b border-zinc-900"
      style={{ minHeight: rendered ? "auto" : `${estimatedHeight}px` }}
    >
      <canvas
        ref={canvasRef}
        className={`w-full max-w-[900px] object-contain shadow-2xl block transition-opacity duration-500 ${rendered ? "opacity-100" : "opacity-0 absolute"}`}
      />
      {!rendered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-2">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-mono tracking-wider">Halaman {pageNum}</span>
        </div>
      )}
    </div>
  );
}

// ─── FullscreenViewer: fixed overlay showing one page at a time ───────────────
function FullscreenViewer({ pdfDoc, totalPages, currentPage, onClose, onPageChange, isGoogleDrive, pdfUrl }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const isRenderingRef = useRef(false);
  const [rendered, setRendered] = useState(false);

  // Re-render whenever currentPage changes
  useEffect(() => {
    if (!pdfDoc || isGoogleDrive) return;
    setRendered(false);
    renderPage(currentPage);
  }, [currentPage, pdfDoc]);

  const renderPage = async (pageNum) => {
    if (isRenderingRef.current) {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    }
    isRenderingRef.current = true;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const baseViewport = page.getViewport({ scale: 1.0 });

      // Scale to fill the screen as much as possible while keeping aspect ratio
      const scaleW = window.innerWidth / baseViewport.width;
      const scaleH = window.innerHeight / baseViewport.height;
      const scale = Math.max(scaleW, scaleH); // cover-mode: use max to fill screen
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      setRendered(true);
    } catch (error) {
      if (error.name !== "RenderingCancelledException" && error.message !== "Rendering cancelled") {
        console.error("Fullscreen render error:", error);
      }
    } finally {
      isRenderingRef.current = false;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") onPageChange(Math.min(totalPages, currentPage + 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") onPageChange(Math.max(1, currentPage - 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages, onClose, onPageChange]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Fullscreen Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-white/70 text-xs font-bold tracking-wider">
          Halaman {currentPage} / {totalPages}
        </span>
        <div className="flex items-center gap-4">
          {/* Page selector */}
          <select
            value={currentPage}
            onChange={(e) => onPageChange(parseInt(e.target.value))}
            className="bg-zinc-800/80 text-white border border-zinc-700 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer font-bold"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>Halaman {p}</option>
            ))}
          </select>
          <button
            onClick={onClose}
            title="Keluar Fullscreen (Esc)"
            className="p-2 text-white/70 hover:text-white rounded-lg border border-zinc-700/50 hover:border-zinc-500 transition-colors bg-zinc-900/60"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas / iframe area — fills entire screen */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {isGoogleDrive ? (
          <iframe
            src={getEmbeddablePdfUrl(pdfUrl)}
            className="w-full h-full border-none bg-white"
          />
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${rendered ? "opacity-100" : "opacity-0"}`}
              style={{ maxWidth: "100vw", maxHeight: "100vh", objectFit: "contain" }}
            />
            {!rendered && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 gap-3">
                <div className="w-10 h-10 border-2 border-zinc-700 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white text-xs font-bold disabled:opacity-30 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Sebelumnya
        </button>

        {/* Dot progress */}
        <div className="flex gap-1 max-w-xs overflow-hidden">
          {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => {
            const p = totalPages <= 20 ? i + 1 : Math.round((i / 19) * (totalPages - 1)) + 1;
            const isActive = p === currentPage || (i === 19 && currentPage === totalPages);
            return (
              <button
                key={i}
                onClick={() => onPageChange(p)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${isActive ? "bg-primary w-4" : "bg-zinc-700 w-1.5 hover:bg-zinc-500"}`}
              />
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white text-xs font-bold disabled:opacity-30 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          Selanjutnya <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ComicReaderPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const isGoogleDrive = story?.pdfUrl && story.pdfUrl.includes("drive.google.com");
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [resumePage, setResumePage] = useState(1);
  const [isScrollingToTarget, setIsScrollingToTarget] = useState(false);
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const [marking, setMarking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load PDF.js dynamically
  useEffect(() => {
    if (window.pdfjsLib) { setPdfjsLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      setPdfjsLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Fetch Story details
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/stories/${slug}`);
        if (!res.ok) { router.push(`/stories/${slug}`); return; }
        const data = await res.json();
        setStory(data);
      } catch (e) {
        console.error(e);
        router.push(`/stories/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  // Load PDF Document
  useEffect(() => {
    if (!pdfjsLoaded || !story) return;
    if (story.pdfUrl && story.pdfUrl.includes("drive.google.com")) {
      setTotalPages(1); return;
    }
    const loadPdf = async () => {
      try {
        const transformedUrl = getEmbeddablePdfUrl(story.pdfUrl);
        const doc = await window.pdfjsLib.getDocument(transformedUrl).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (error) {
        console.error("Error loading PDF document:", error);
      }
    };
    loadPdf();
  }, [pdfjsLoaded, story]);

  // Lock body scroll in fullscreen overlay
  useEffect(() => {
    if (isFullscreen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  // Scroll handler for tracking page number and toolbar hide/show
  useEffect(() => {
    if (totalPages === 0) return;
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) setToolbarHidden(true);
      else setToolbarHidden(false);
      lastScrollY = currentScrollY;
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = totalHeight > 0 ? (currentScrollY / totalHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      const wrappers = document.querySelectorAll("[data-page]");
      let activePage = 1, minDiff = Infinity;
      wrappers.forEach((wrap) => {
        const rect = wrap.getBoundingClientRect();
        const diff = Math.abs(rect.top);
        if (diff < minDiff) { minDiff = diff; activePage = parseInt(wrap.getAttribute("data-page")); }
      });
      setCurrentPage(activePage);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalPages]);

  // Save Progress to localStorage
  useEffect(() => {
    if (!story || totalPages === 0 || isScrollingToTarget) return;
    localStorage.setItem(`comic_progress_${story.id}`, JSON.stringify({
      page: currentPage, total: totalPages, updatedAt: new Date().toISOString(),
    }));
  }, [currentPage, story, totalPages, isScrollingToTarget]);

  // Show Resume Toast
  useEffect(() => {
    if (!story || totalPages === 0) return;
    const saved = localStorage.getItem(`comic_progress_${story.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.page > 1) {
          setResumePage(parsed.page);
          setShowResumeToast(true);
          const timer = setTimeout(() => setShowResumeToast(false), 10000);
          return () => clearTimeout(timer);
        }
      } catch (e) { console.error(e); }
    }
  }, [story, totalPages]);

  // Mark PDF Read
  const handleMarkPdfRead = async () => {
    if (!story) return;
    setMarking(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id, isPdfRead: true }),
      });
      if (res.ok) { router.push(`/stories/${slug}`); router.refresh(); }
    } catch (e) { console.error(e); }
    finally { setMarking(false); }
  };

  const scrollToPage = (pageNum) => {
    const target = document.getElementById(`page-wrapper-${pageNum}`);
    if (target) {
      setIsScrollingToTarget(true);
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - 80, behavior: "smooth" });
      setTimeout(() => setIsScrollingToTarget(false), 800);
    }
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
    // Sync fullscreen viewer to the page currently visible in scroll view
  };

  const closeFullscreen = () => setIsFullscreen(false);

  const handleFullscreenPageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  if (loading || !pdfjsLoaded) {
    return (
      <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-primary rounded-full animate-spin" />
        <h2 className="text-base font-bold tracking-wider font-display">Menyiapkan Ruang Baca...</h2>
        <p className="text-xs text-zinc-500">Memuat berkas PDF Komik</p>
      </div>
    );
  }

  if (!story) return null;

  const pdfRead = story.progress?.isPdfRead || false;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-zinc-950 text-slate-100 min-h-screen flex flex-col select-none overflow-x-hidden font-sans">

      {/* ── Fullscreen Overlay (CSS-based, no browser API needed) ── */}
      {isFullscreen && (
        <FullscreenViewer
          pdfDoc={pdfDoc}
          totalPages={totalPages}
          currentPage={currentPage}
          onClose={closeFullscreen}
          onPageChange={handleFullscreenPageChange}
          isGoogleDrive={isGoogleDrive}
          pdfUrl={story.pdfUrl}
        />
      )}

      {/* Immersive Toolbar Header */}
      <header
        className={`fixed top-0 w-full z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 shadow-lg transition-transform duration-300 ${
          toolbarHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex justify-between items-center h-16 px-4 md:px-12 w-full max-w-[1440px] mx-auto">
          {/* Back & Title info */}
          <div className="flex items-center gap-3">
            <Link
              href={`/stories/${slug}`}
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-slate-300 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs md:text-sm text-primary font-display">{story.title}</span>
              <span className="text-[10px] md:text-xs text-zinc-400">
                {isGoogleDrive ? "Membaca Komik via Google Drive" : (totalPages > 0 ? `Halaman ${currentPage} / ${totalPages}` : "Memuat halaman...")}
              </span>
            </div>
          </div>
          
          {/* Mid control page selector */}
          {totalPages > 0 && !isGoogleDrive && (
            <div className="flex items-center gap-2">
              <select
                value={currentPage}
                onChange={(e) => scrollToPage(parseInt(e.target.value))}
                className="bg-zinc-800 text-slate-100 border border-zinc-700 rounded-lg px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer font-bold font-sans"
              >
                {pageNumbers.map((p) => (
                  <option key={p} value={p}>Halaman {p}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={openFullscreen}
              className="p-2 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-zinc-800"
              title="Mode Layar Penuh"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Comic scrolling canvas */}
      <main className="relative pt-16 min-h-screen bg-zinc-950 flex flex-col items-center">
        
        {/* Comic container */}
        <div
          id="comic-container"
          className="flex flex-col items-center w-full max-w-[900px] mx-auto shadow-2xl bg-black"
        >
          {isGoogleDrive ? (
            <div className="w-full aspect-[3/4] sm:aspect-[1/1.4] h-[80vh] min-h-[500px]">
              <iframe
                src={getEmbeddablePdfUrl(story.pdfUrl)}
                className="w-full h-full border-none bg-white"
              />
            </div>
          ) : (
            pdfDoc && pageNumbers.map((pageNum) => (
              <ComicPage key={pageNum} pageNum={pageNum} pdfDoc={pdfDoc} />
            ))
          )}
        </div>

        {/* End of story actions */}
        <section className="w-full max-w-[900px] mx-auto py-16 px-6 bg-zinc-900 text-center border-t border-zinc-850 mt-8 rounded-b-2xl">
          <h2 className="text-2xl font-black text-primary mb-3 font-display">Membaca Selesai</h2>
          <p className="text-xs md:text-sm text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed font-semibold">
            Anda telah selesai membaca cerita &ldquo;{story.title}&rdquo;. Tandai bacaan selesai untuk menyimpan progres belajar Anda!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleMarkPdfRead}
              disabled={marking}
              className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-xs font-display cursor-pointer disabled:opacity-50"
            >
              {marking ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {pdfRead ? "Selesai Membaca (Kembali)" : "Tandai Selesai Belajar"}
                </>
              )}
            </button>
            <Link
              href={`/stories/${slug}`}
              className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-xs font-display border border-zinc-700/50"
            >
              <Home className="w-4 h-4" /> Kembali ke Detail
            </Link>
          </div>
        </section>
      </main>

      {/* Progress Indicator Bar */}
      <div
        className="fixed bottom-0 left-0 h-1.5 bg-primary z-[60] transition-all duration-100"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Resume Toast */}
      {showResumeToast && (
        <div className="fixed bottom-8 right-8 z-[100] bg-zinc-900 border border-primary/20 p-4 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-300">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-primary">Lanjutkan membaca?</span>
            <span className="text-xs text-zinc-400">Terakhir dibaca di Halaman {resumePage}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowResumeToast(false);
                localStorage.setItem(`comic_progress_${story.id}`, JSON.stringify({ page: 1, total: totalPages, updatedAt: new Date().toISOString() }));
              }}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-[10px] hover:bg-zinc-800 transition-colors cursor-pointer text-slate-300 font-bold"
            >
              Ulangi
            </button>
            <button
              onClick={() => { scrollToPage(resumePage); setShowResumeToast(false); }}
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:brightness-110 transition-all shadow-sm cursor-pointer"
            >
              Lanjut
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
