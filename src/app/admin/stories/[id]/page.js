"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, Check, AlertCircle, Plus, Trash, ArrowUp, ArrowDown, Edit } from "lucide-react";

export default function EditStoryPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  // Story state fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [level, setLevel] = useState("Level 1");
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

  const [loadingStory, setLoadingStory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Quiz Questions Creator States
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("MULTIPLE_CHOICE");
  const [editingIndex, setEditingIndex] = useState(null);
  const [newQuestionImageUrl, setNewQuestionImageUrl] = useState("");
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState(false);

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

  // Fetch story details on mount
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/stories/${id}`);
        if (!res.ok) {
          router.push("/admin/stories");
          return;
        }
        const data = await res.json();
        
        setTitle(data.title || "");
        setDescription(data.description || "");
        setLearningObjectives(data.learningObjectives || "");
        setLevel(data.level || "Level 1");
        setGenre(data.genre || "Daily Life");
        setDuration(String(data.duration || "120"));
        setStatus(data.status || "Draft");
        setThumbnailUrl(data.thumbnailUrl || "");
        setPdfUrl(data.pdfUrl || "");
        setVideoUrl(data.videoUrl || "");

        // Load quiz questions
        const quiz = data.quizzes?.[0];
        if (quiz && Array.isArray(quiz.questions)) {
          const parsedQuestions = quiz.questions.map((q) => {
            const payload = {
              questionText: q.questionText,
              type: q.type,
              points: q.points || 10,
              imageUrl: q.imageUrl || "",
            };
            if (q.type === "MULTIPLE_CHOICE") {
              payload.options = q.options.map((o) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
              }));
            } else if (q.type === "FILL_IN_THE_BLANK") {
               payload.answer = q.answers?.[0]?.correctAnswer || "";
            } else if (q.type === "MATCHING") {
              payload.pairs = q.options.map((o) => ({
                key: o.matchKey,
                val: o.matchValue,
              }));
            } else if (q.type === "FLASHCARD") {
              payload.word = q.options[0]?.matchKey || "";
              payload.meaning = q.options[0]?.matchValue || "";
            }
            return payload;
          });
          setQuestions(parsedQuestions);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail cerita.");
      } finally {
        setLoadingStory(false);
      }
    };
    fetchStory();
  }, [id, router]);

  const handleSaveQuestion = () => {
    if (!newQuestionText.trim()) {
      alert("Teks pertanyaan tidak boleh kosong!");
      return;
    }

    let payload = {
      questionText: newQuestionText,
      type: newQuestionType,
      points: 10,
      imageUrl: newQuestionImageUrl,
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

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = payload;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, payload]);
    }
    
    // Reset fields
    setNewQuestionText("");
    setNewQuestionImageUrl("");
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

  const handleEditQuestionStart = (index) => {
    const q = questions[index];
    setEditingIndex(index);
    setNewQuestionText(q.questionText);
    setNewQuestionType(q.type);
    setNewQuestionImageUrl(q.imageUrl || "");
    
    if (q.type === "MULTIPLE_CHOICE") {
      setMcOptions(q.options.map(o => ({ text: o.optionText, isCorrect: o.isCorrect })));
    } else if (q.type === "FILL_IN_THE_BLANK") {
      setBlankAnswer(q.answer);
    } else if (q.type === "MATCHING") {
      setMatchingPairs(q.pairs.map(p => ({ key: p.key, val: p.val })));
    } else if (q.type === "FLASHCARD") {
      setFlashcardWord(q.word);
      setFlashcardMeaning(q.meaning);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewQuestionText("");
    setNewQuestionImageUrl("");
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

  const handleMoveQuestion = (index, direction) => {
    const updated = [...questions];
    if (direction === "up" && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === "down" && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      handleCancelEdit();
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
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
        setError(data.error || "Gagal mengunggah file.");
      } else {
        setUrl(data.url);
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi server gagal saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!thumbnailUrl || !pdfUrl || !videoUrl) {
      setError("Harap isi semua file konten (Thumbnail, PDF Link, dan YouTube Video Link) sebelum menyimpan.");
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
      setError("Tautan YouTube tidak valid. Harap pastikan untuk memasukkan URL atau ID video YouTube yang benar.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          learningObjectives,
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
        setError(data.error || "Gagal memperbarui cerita.");
      } else {
        router.refresh();
        router.push("/admin/stories");
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi server gagal saat memperbarui cerita.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingStory) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl font-sans">
      {/* Back Link */}
      <Link
        href="/admin/stories"
        className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-primary transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Stories List
      </Link>

      <div>
        <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">Edit Story</h1>
        <p className="text-slate-500 font-sans font-semibold text-xs mt-1">
          Modify story details, content resources, and the comprehension quiz.
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

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Learning Objectives (Optional)
              </label>
              <textarea
                rows={3}
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
                placeholder="Write the learning objectives (e.g. key vocabulary, moral value, grammar focus)..."
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
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
                <option value="Level 5">Level 5</option>
                <option value="Level 6">Level 6</option>
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
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">WebP only (Max 1MB)</span>
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
                      accept=".webp"
                      onChange={(e) => handleFileUpload(e, "thumbnail", setThumbnailUrl, setUploadingThumbnail)}
                      disabled={uploadingThumbnail}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-slate-200/60 hover:border-primary hover:bg-primary/5 p-4 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold transition">
                      <UploadCloud className="w-4 h-4 text-primary" />
                      <span>{uploadingThumbnail ? "Uploading..." : "Choose Thumbnail (WebP)"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PDF Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-slate-200/40 pt-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Story PDF File / Link</label>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Unggah file PDF (Max 10MB) atau masukkan URL PDF</span>
              </div>
              <div className="md:col-span-2 space-y-3">
                {pdfUrl ? (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/50 p-3 rounded-xl font-sans">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-800 truncate">{pdfUrl}</span>
                    <button type="button" onClick={() => setPdfUrl("")} className="text-[10px] text-rose-500 font-bold ml-auto hover:underline cursor-pointer">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* File Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e, "pdf", setPdfUrl, setUploadingPdf)}
                        disabled={uploadingPdf}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="border-2 border-dashed border-slate-200/60 hover:border-primary hover:bg-primary/5 p-4 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold transition">
                        <UploadCloud className="w-4 h-4 text-primary" />
                        <span>{uploadingPdf ? "Uploading PDF..." : "Choose PDF File"}</span>
                      </div>
                    </div>
                    
                    {/* Manual Link Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0">ATAU MASUKKAN LINK:</span>
                      <input
                        type="text"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        placeholder="e.g. https://drive.google.com/file/d/.../view"
                        className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input transition font-semibold"
                      />
                    </div>
                  </div>
                )}
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
                    <div className="flex items-center gap-3">
                      {/* Reordering controls */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveQuestion(idx, "up")}
                          className="p-1 hover:bg-slate-200/60 rounded disabled:opacity-30 cursor-pointer text-slate-500 transition"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === questions.length - 1}
                          onClick={() => handleMoveQuestion(idx, "down")}
                          className="p-1 hover:bg-slate-200/60 rounded disabled:opacity-30 cursor-pointer text-slate-500 transition"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {q.imageUrl && (
                        <img src={q.imageUrl} alt="Kuis" className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                      )}

                      <div>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wide mr-2 font-bold">
                          {q.type}
                        </span>
                        <span className="font-bold text-slate-800">{q.questionText}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditQuestionStart(idx)}
                        className="text-amber-600 hover:underline font-bold text-[10px] cursor-pointer flex items-center gap-1 transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-rose-500 hover:underline font-bold text-[10px] cursor-pointer flex items-center gap-1 transition"
                      >
                        <Trash className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
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

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Gambar Soal (Opsional)</label>
              <div className="flex items-center gap-3">
                {newQuestionImageUrl ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={newQuestionImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewQuestionImageUrl("")}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition duration-200 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-xl p-4 cursor-pointer transition bg-white/40">
                    <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500">Unggah Gambar (WebP only, Max 1MB)</span>
                    <input
                      type="file"
                      accept=".webp"
                      onChange={(e) => handleFileUpload(e, "quiz", setNewQuestionImageUrl, setUploadingQuestionImage)}
                      className="hidden"
                      disabled={uploadingQuestionImage}
                    />
                  </label>
                )}
                {uploadingQuestionImage && <div className="text-[10px] text-slate-400 font-bold animate-pulse">Mengunggah...</div>}
              </div>
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

            {editingIndex !== null ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  className="flex-1 py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition cursor-pointer flex items-center justify-center gap-1 font-sans"
                >
                  <Save className="w-4 h-4" /> Simpan Perubahan Pertanyaan
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-2.5 px-4 bg-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-300 transition cursor-pointer font-sans"
                >
                  Batal Edit
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="w-full py-2.5 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition cursor-pointer flex items-center justify-center gap-1 font-sans"
              >
                <Plus className="w-4 h-4" /> Tambahkan Pertanyaan ke List
              </button>
            )}
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
              <Save className="w-4 h-4" /> Update and Save Story
            </>
          )}
        </button>
      </form>
    </div>
  );
}
