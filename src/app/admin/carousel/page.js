"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, UploadCloud, Check, Trash2, Image, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminCarouselPage() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [stories, setStories] = useState([]);
  
  // Form states
  const [imageUrl, setImageUrl] = useState("");
  const [selectedStoryId, setSelectedStoryId] = useState("");
  
  // Loading indicators
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersRes, storiesRes] = await Promise.all([
        fetch("/api/carousel"),
        fetch("/api/stories")
      ]);
      if (bannersRes.ok && storiesRes.ok) {
        const bannersData = await bannersRes.json();
        const storiesData = await storiesRes.json();
        
        setBanners(bannersData);
        // Only show published stories in the assign list
        setStories(storiesData.filter(s => s.status === "Published"));
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "thumbnail"); // saves to uploads/thumbnails which is public

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengunggah gambar.");
      } else {
        setImageUrl(data.url);
        setSuccess("Gambar banner berhasil diunggah!");
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi server gagal saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!imageUrl) {
      setError("Harap unggah gambar banner terlebih dahulu!");
      return;
    }
    if (!selectedStoryId) {
      setError("Harap pilih cerita yang ingin di-assign!");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          storyId: selectedStoryId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat banner carousel.");
      } else {
        setSuccess("Banner carousel baru berhasil ditambahkan!");
        setImageUrl("");
        setSelectedStoryId("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungi server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner carousel ini?")) return;
    
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/carousel/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("Banner carousel berhasil dihapus!");
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menghapus banner.");
      }
    } catch (e) {
      console.error(e);
      setError("Koneksi server gagal.");
    }
  };

  if (loading && BannersLengthZero()) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function BannersLengthZero() {
    return banners.length === 0;
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">Manage Carousel</h1>
        <p className="text-slate-500 font-sans font-semibold text-xs mt-1">
          Upload custom wide cover images and link them to published stories on the landing page slider.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form to Add Banner */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-[24px] space-y-6 border-white/20">
            <h2 className="text-sm font-display font-bold text-slate-800 border-b border-slate-200/40 pb-3">
              Add New Carousel Banner
            </h2>

            <form onSubmit={handleAddBanner} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Banner Cover Image (WebP only, Max 1MB)
                </label>
                {imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-[10px] font-semibold text-slate-600">
                      <span className="truncate max-w-[200px]">{imageUrl}</span>
                      <button type="button" onClick={() => setImageUrl("")} className="text-rose-500 hover:underline cursor-pointer font-bold">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-slate-200/60 hover:border-primary hover:bg-primary/5 p-6 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs font-semibold transition">
                      <UploadCloud className="w-6 h-6 text-primary" />
                      <span>{uploading ? "Uploading..." : "Choose Banner Image (WebP)"}</span>
                      <span className="text-[9px] text-slate-400">Dimensi lebar direkomendasikan</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Story Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Assign to Story
                </label>
                <select
                  required
                  value={selectedStoryId}
                  onChange={(e) => setSelectedStoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">-- Pilih Cerita --</option>
                  {stories.map(story => (
                    <option key={story.id} value={story.id}>
                      [{story.level}] {story.title}
                    </option>
                  ))}
                </select>
                {stories.length === 0 && (
                  <span className="text-[9px] text-rose-500 font-bold block mt-0.5">
                    * Tidak ada cerita yang dipublikasikan (Published). Terbitkan cerita terlebih dahulu.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full py-3 primary-gradient text-white rounded-xl text-xs font-display font-bold shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Banner
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List of Carousel Banners */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-[24px] border-white/20">
            <h2 className="text-sm font-display font-bold text-slate-800 border-b border-slate-200/40 pb-3">
              Active Carousel Banners ({banners.length})
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : banners.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <Image className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-xs font-display font-bold text-slate-700">No banners active</h3>
                <p className="text-slate-500 text-[10px] mt-1 font-medium font-sans">
                  Landing page will fallback to showing the first 5 stories. Add a banner to customize.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/50 hover:bg-primary/5 p-4 rounded-2xl border border-slate-200/25 transition-all duration-200 group"
                  >
                    {/* Cover image preview */}
                    <div className="relative aspect-[21/9] w-full sm:w-[150px] rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                      <img src={banner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 space-y-1.5">
                      <h4 className="text-xs font-black text-slate-800 tracking-tight">
                        {banner.story.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed line-clamp-2">
                        {banner.story.description}
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                          {banner.story.level}
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                          {banner.story.genre}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-300 rounded-lg transition shrink-0 self-end sm:self-center cursor-pointer"
                      title="Hapus Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
