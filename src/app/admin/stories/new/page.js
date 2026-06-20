"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, Check, AlertCircle, Plus, Trash } from "lucide-react";

export default function NewStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [genre, setGenre] = useState("Daily Life");
  const [duration, setDuration] = useState("120");
  const [status, setStatus] = useState("Draft");

  // Upload fields URLs
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Uploading indicators
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Quiz Questions Creator States
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("MULTIPLE_CHOICE");

  // Type specific temp states
  const [mcOptions, setMcOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ]);
  const [blankAnswer, setBlankAnswer] = useState("");
  const [matchingPairs, setMatchingPairs] = useState([
    { key: "", val: "" },
    { key: "", val: "" }
  ]);
  const [flashcardWord, setFlashcardWord] = useState("");
  const [flashcardMeaning, setFlashcardMeaning] = useState("");

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      alert("Teks pertanyaan tidak boleh kosong!");
      return;
    }

    let payload = {
      questionText: newQuestionText,
      type: newQuestionType,
    };

    if (newQuestionType === "MULTIPLE_CHOICE") {
      const validOptions = mcOptions.filter(o => o.text.trim());
      if (validOptions.length < 2) {
        alert("Harap masukkan minimal 2 pilihan jawaban!");
        return;
      }
      if (!validOptions.some(o => o.isCorrect)) {
        alert("Harap pilih minimal 1 jawaban yang benar!");
        return;
      }
      payload.options = validOptions.map(o => ({
        optionText: o.text,
        isCorrect: o.isCorrect
      }));
    } else if (newQuestionType === "FILL_IN_THE_BLANK") {
      if (!blankAnswer.trim()) {
        alert("Harap isi kunci jawaban!");
        return;
      }
      payload.answer = blankAnswer.trim();
    } else if (newQuestionType === "MATCHING") {
      const validPairs = matchingPairs.filter(p => p.key.trim() && p.val.trim());
      if (validPairs.length < 2) {
        alert("Harap masukkan minimal 2 pasang kata!");
        return;
      }
      payload.pairs = validPairs;
    } else if (newQuestionType === "FLASHCARD") {
      if (!flashcardWord.trim() || !flashcardMeaning.trim()) {
        alert("Harap lengkapi kata dan artinya!");
        return;
      }
      payload.word = flashcardWord.trim();
      payload.meaning = flashcardMeaning.trim();
    }

    setQuestions([...questions, payload]);
    
    // Reset fields
    setNewQuestionText("");
    setMcOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ]);
    setBlankAnswer("");
    setMatchingPairs([
      { key: "", val: "" },
      { key: "", val: "" }
    ]);
    setFlashcardWord("");
    setFlashcardMeaning("");
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleFileUpload = async (e, type, setUrl, setUploading) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload file.");
      } else {
        setUrl(data.url);
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!thumbnailUrl || !pdfUrl || !videoUrl) {
      setError("Please provide all required fields (Thumbnail, PDF Link, and YouTube Video Link) before saving.");
      return;
    }

    const getYouTubeId = (url) => {
      if (!url) return null;
      if (url.length === 11) return url;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    if (!getYouTubeId(videoUrl)) {
      setError("Invalid YouTube Link. Please make sure to enter a valid YouTube video URL or ID.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          level,
          genre,
          thumbnailUrl,
          pdfUrl,
          videoUrl,
          duration: parseInt(duration),
          status,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create story.");
      } else {
        // Redirect back to stories list
        router.refresh();
        router.push("/admin/stories");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed during story creation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back Link */}
      <Link
        href="/admin/stories"
        className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-primary transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Stories List
      </Link>

      <div>
        <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">Create New Story</h1>
        <p className="text-slate-500 font-sans font-semibold text-xs mt-1">
          Add details and upload content resources to start a new English lesson course.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-base font-display font-bold text-slate-800 border-b border-slate-200/40 pb-3">1. Story Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Story Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Lost Kingdom"
                className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Description / Synopsis
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview of the story..."
                className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                English Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-bold text-slate-700 cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Narrative Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-bold text-slate-700 cursor-pointer"
              >
                <option value="Daily Life">Daily Life</option>
                <option value="Horror">Horror</option>
                <option value="Romance">Romance</option>
                <option value="School">School</option>
                <option value="Business">Business</option>
                <option value="Mystery">Mystery</option>
                <option value="Fantasy">Fantasy</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Video Duration (Seconds)
              </label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="120"
                className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-bold text-slate-700 cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload resources */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-base font-display font-bold text-slate-800 border-b border-slate-200/40 pb-3">2. Content Files</h2>
          
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Thumbnail Image</label>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">JPG, PNG, WebP (Max 10MB)</span>
              </div>
              <div className="md:col-span-2">
                {thumbnailUrl ? (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/50 p-3 rounded-xl font-sans">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-800 truncate">{thumbnailUrl}</span>
                    <button type="button" onClick={() => setThumbnailUrl("")} className="text-[10px] text-rose-500 font-bold ml-auto hover:underline cursor-pointer">Remove</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(e) => handleFileUpload(e, "thumbnail", setThumbnailUrl, setUploadingThumbnail)}
                      disabled={uploadingThumbnail}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-slate-200/60 hover:border-primary hover:bg-primary/5 p-4 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold transition">
                      <UploadCloud className="w-4 h-4 text-primary" />
                      <span>{uploadingThumbnail ? "Uploading..." : "Choose Thumbnail"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PDF Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-slate-200/40 pt-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Story PDF Link / Google Drive Link</label>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Masukkan link PDF (e.g. Google Drive Link atau Direct PDF URL)</span>
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="e.g. https://drive.google.com/file/d/.../view"
                  className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
                />
              </div>
            </div>

            {/* YouTube Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-slate-200/40 pt-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">YouTube Video Link / ID</label>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Masukkan link/ID video YouTube (e.g., https://www.youtube.com/watch?v=...)</span>
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full px-4 py-3 rounded-xl text-xs glass-input transition font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quiz Questions Composer */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-base font-display font-bold text-slate-800 border-b border-slate-200/40 pb-3">3. Quiz Questions</h2>
          
          {/* Added Questions List Summary */}
          {questions.length > 0 && (
            <div className="space-y-3 mb-6">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Daftar Pertanyaan ({questions.length})</span>
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50/50 border border-slate-200/40 p-4 rounded-xl text-xs font-sans">
                    <div>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wide mr-2 font-bold">
                        {q.type}
                      </span>
                      <span className="font-bold text-slate-800">{q.questionText}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-rose-500 hover:underline font-bold text-[10px] cursor-pointer flex items-center gap-1"
                    >
                      <Trash className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form to add a new question */}
          <div className="bg-slate-50/30 border border-slate-200/30 p-5 rounded-2xl space-y-4">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tambah Pertanyaan Baru</span>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Teks Pertanyaan</label>
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Tulis soal kuis di sini..."
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Tipe Pertanyaan</label>
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input transition font-bold text-slate-700 cursor-pointer font-sans"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice (Pilihan Ganda)</option>
                  <option value="FILL_IN_THE_BLANK">Fill In The Blank (Isian Kata)</option>
                  <option value="MATCHING">Matching (Pasangan Kata Inggris-Indo)</option>
                  <option value="FLASHCARD">Flashcard (Cek Hafalan Kata)</option>
                </select>
              </div>
            </div>

            {/* Type Specific Fields */}
            <div className="border-t border-slate-200/40 pt-4 mt-2">
              {/* MULTIPLE CHOICE */}
              {newQuestionType === "MULTIPLE_CHOICE" && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Pilihan Jawaban</label>
                  {mcOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...mcOptions];
                          updated[idx].text = e.target.value;
                          setMcOptions(updated);
                        }}
                        placeholder={`Pilihan ${idx + 1}`}
                        className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold font-sans"
                      />
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 select-none cursor-pointer font-sans">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const updated = [...mcOptions];
                            updated[idx].isCorrect = e.target.checked;
                            setMcOptions(updated);
                          }}
                          className="accent-primary w-3.5 h-3.5"
                        />
                        Jawaban Benar
                      </label>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMcOptions([...mcOptions, { text: "", isCorrect: false }])}
                    className="text-[10px] text-primary hover:underline font-bold cursor-pointer font-sans"
                  >
                    + Tambah Pilihan Jawaban
                  </button>
                </div>
              )}

              {/* FILL IN THE BLANK */}
              {newQuestionType === "FILL_IN_THE_BLANK" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Kunci Jawaban</label>
                  <input
                    type="text"
                    value={blankAnswer}
                    onChange={(e) => setBlankAnswer(e.target.value)}
                    placeholder="Jawaban benar..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold font-sans"
                  />
                </div>
              )}

              {/* MATCHING */}
              {newQuestionType === "MATCHING" && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Pasangan Kata (Inggris → Indonesia)</label>
                  {matchingPairs.map((pair, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={pair.key}
                        onChange={(e) => {
                          const updated = [...matchingPairs];
                          updated[idx].key = e.target.value;
                          setMatchingPairs(updated);
                        }}
                        placeholder="Kata Inggris (e.g. Blue)"
                        className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold font-sans"
                      />
                      <span className="text-slate-400">→</span>
                      <input
                        type="text"
                        value={pair.val}
                        onChange={(e) => {
                          const updated = [...matchingPairs];
                          updated[idx].val = e.target.value;
                          setMatchingPairs(updated);
                        }}
                        placeholder="Arti Indonesia (e.g. Biru)"
                        className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold font-sans"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMatchingPairs([...matchingPairs, { key: "", val: "" }])}
                    className="text-[10px] text-primary hover:underline font-bold cursor-pointer font-sans"
                  >
                    + Tambah Pasangan Kata
                  </button>
                </div>
              )}

              {/* FLASHCARD */}
              {newQuestionType === "FLASHCARD" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Kata Inggris</label>
                    <input
                      type="text"
                      value={flashcardWord}
                      onChange={(e) => setFlashcardWord(e.target.value)}
                      placeholder="e.g. Knight"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Arti Indonesia</label>
                    <input
                      type="text"
                      value={flashcardMeaning}
                      onChange={(e) => setFlashcardMeaning(e.target.value)}
                      placeholder="e.g. Ksatria"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold font-sans"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-2.5 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition cursor-pointer flex items-center justify-center gap-1 font-sans"
            >
              <Plus className="w-4 h-4" /> Tambahkan Pertanyaan ke List
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-1.5 py-4 primary-gradient text-white rounded-xl text-sm font-display font-bold shadow-lg hover:shadow-xl hover:shadow-primary/10 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> Save and Publish Story
            </>
          )}
        </button>
      </form>
    </div>
  );
}
