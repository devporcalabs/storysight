"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Video } from "lucide-react";
import Navbar from "@/components/Navbar";

function getYouTubeId(url) {
  if (!url) return null;
  if (url.length === 11) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function WatchVideoPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoWatched, setVideoWatched] = useState(false);
  const playerRef = useRef(null);

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
        setVideoWatched(data.progress?.isVideoWatched || false);
      } catch (e) {
        console.error(e);
        router.push(`/stories/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  const markVideoAsWatched = async () => {
    if (!story) return;
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: story.id,
          isVideoWatched: true,
        }),
      });
      router.refresh();
    } catch (e) {
      console.error("Failed to update video progress:", e);
    }
  };

  useEffect(() => {
    if (!story || !story.videoUrl) return;
    const videoId = getYouTubeId(story.videoUrl);
    if (!videoId) return;

    // Load the YouTube Iframe Player API asynchronously if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let player;
    let interval;

    const initPlayer = () => {
      // Check if container element still exists in DOM
      const container = document.getElementById("youtube-player");
      if (!container) return;

      player = new window.YT.Player("youtube-player", {
        videoId: videoId,
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING is 1
            if (event.data === window.YT.PlayerState.PLAYING) {
              interval = setInterval(() => {
                if (player && player.getCurrentTime && player.getDuration) {
                  const curr = player.getCurrentTime();
                  const dur = player.getDuration();
                  if (dur > 0) {
                    if ((curr / dur) >= 0.8 && !videoWatched) {
                      setVideoWatched(true);
                      markVideoAsWatched();
                      clearInterval(interval);
                    }
                  }
                }
              }, 1000);
            } else {
              clearInterval(interval);
            }
          },
        },
      });
      playerRef.current = player;
    };

    // If YT API is already loaded, init right away
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Define or chain ready callback
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousReady) previousReady();
        initPlayer();
      };
    }

    return () => {
      clearInterval(interval);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [story, videoWatched]);

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

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 pt-6 pb-20 w-full flex-1">
        
        {/* Navigation & Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <Link
            href={`/stories/${slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Detail Cerita
          </Link>
        </div>

        {/* Cinematic Video Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Player & Custom Controls */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative rounded-3xl overflow-hidden glass-card shadow-2xl aspect-video bg-slate-950">
              <div id="youtube-player" className="w-full h-full" />
            </div>

            {/* Video Status Console */}
            <div className="glass-card p-5 rounded-3xl flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                <span className="text-xs font-bold text-slate-600 font-sans">
                  Sistem pemantauan aktif. Menonton 80% dari durasi video akan menandai progress belajar Anda sebagai Selesai.
                </span>
              </div>

              <div className="flex items-center gap-4">
                {videoWatched ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/50 font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Video Selesai
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl font-sans">
                    Tonton 80% untuk Selesai
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Info Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200/40 pb-3">
                <div className="bg-primary/20 text-primary p-2.5 rounded-xl">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Now Playing</span>
                  <h3 className="font-display text-sm font-bold text-slate-800 leading-snug">{story.title}</h3>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] font-mono">Sinopsis</p>
                <p className="text-slate-500 font-semibold font-sans leading-relaxed mt-1">
                  {story.description}
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
