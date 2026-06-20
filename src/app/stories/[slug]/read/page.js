"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

function getEmbeddablePdfUrl(url) {
  if (!url) return "";
  
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
  
  return `${url}#toolbar=0&navpanes=0`;
}

export default function ComicReaderPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [readerSize, setReaderSize] = useState("standard"); // standard, wide, large

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/stories/${slug}`);
        if (!res.ok) {
          router.push(`/stories/${slug}`);
          return;
        }
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

  const handleMarkPdfRead = async () => {
    if (!story) return;
    setMarking(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: story.id,
          isPdfRead: true,
        }),
      });
      if (res.ok) {
        router.push(`/stories/${slug}`);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

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

  const pdfRead = story.progress?.isPdfRead || false;

  // Reader width constraints
  const widthClasses = {
    standard: "max-w-4xl",
    wide: "max-w-6xl",
    large: "max-w-[1400px]",
  };

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-[1600px] mx-auto px-4 md:px-6 pt-6 pb-20 w-full flex flex-col items-center">
        
        {/* Navigation & Toolbar */}
        <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link
            href={`/stories/${slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Detail Cerita
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide font-mono">Lebar Reader:</span>
            <div className="bg-white/40 border border-slate-200/50 rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setReaderSize("standard")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  readerSize === "standard" ? "bg-primary text-white" : "text-slate-500 hover:bg-white/30"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setReaderSize("wide")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  readerSize === "wide" ? "bg-primary text-white" : "text-slate-500 hover:bg-white/30"
                }`}
              >
                Wide
              </button>
              <button
                onClick={() => setReaderSize("large")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  readerSize === "large" ? "bg-primary text-white" : "text-slate-500 hover:bg-white/30"
                }`}
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Comic Frame Book Reader */}
        <div className={`w-full ${widthClasses[readerSize]} transition-all duration-300`}>
          <div className="glass-card rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/20 p-2 md:p-4 bg-slate-900/5">
            
            {/* Header Title Block */}
            <div className="bg-slate-900 text-white rounded-t-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-4 border-slate-950">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-lg border border-primary/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-display text-sm md:text-base font-black tracking-tight">{story.title}</h1>
                  <span className="block text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Comic Book Reader</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {pdfRead ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-full font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Dibaca
                  </span>
                ) : (
                  <span className="text-[8px] md:text-[9px] font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full uppercase tracking-wider font-mono">
                    Membaca Mandiri
                  </span>
                )}
              </div>
            </div>

            {/* Embedded Comic PDF Canvas */}
            <div className="bg-slate-950 border-x-4 border-b-4 border-slate-950 relative h-[75vh] min-h-[500px] flex flex-col justify-center items-center overflow-hidden">
              <iframe
                src={getEmbeddablePdfUrl(story.pdfUrl)}
                className="w-full h-full border-none bg-white"
              />
            </div>

            {/* Footer mark as complete actions */}
            <div className="p-4 bg-white/40 backdrop-blur-md rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <p className="text-[10px] text-slate-500 font-semibold font-sans leading-relaxed text-center sm:text-left">
                {pdfRead
                  ? "Kamu telah menyelesaikan bacaan mandiri untuk cerita ini. Klik tombol di kanan jika ingin kembali ke detail."
                  : "Bacalah teks cerita di atas secara mandiri layaknya komik bergambar. Setelah selesai, klik tombol di kanan."}
              </p>
              
              <button
                onClick={handleMarkPdfRead}
                disabled={marking}
                className="w-full sm:w-auto px-8 py-3.5 primary-gradient text-white rounded-2xl text-xs font-display font-bold shadow-lg hover:shadow-xl hover:shadow-primary/10 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {marking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {pdfRead ? "Selesai Membaca (Kembali)" : "Tandai Selesai Membaca"}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
