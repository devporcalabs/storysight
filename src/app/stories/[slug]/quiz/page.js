"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, ArrowRight, HelpCircle, Check, FlipHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function QuizPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: userAnswer }
  const [submitting, setSubmitting] = useState(false);

  // States for Matching type
  const [selectedMatchKey, setSelectedMatchKey] = useState(null);
  const [matchingPairs, setMatchingPairs] = useState({}); // { english: indonesian }
  
  // States for Flashcards
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const fetchStoryAndQuiz = async () => {
      try {
        const res = await fetch(`/api/stories/${slug}`);
        if (!res.ok) {
          router.push("/stories");
          return;
        }
        const data = await res.json();
        setStory(data);
        if (data.quizzes && data.quizzes.length > 0) {
          const activeQuiz = data.quizzes[0];
          setQuiz(activeQuiz);
          setQuestions(activeQuiz.questions || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStoryAndQuiz();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!story || !quiz || questions.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-12 flex-1 flex flex-col justify-center text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">No Quiz Available</h2>
          <Link href={`/stories/${slug}`} className="mt-6 text-xs font-bold text-primary hover:underline">
            Go Back
          </Link>
        </div>
      </>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  const saveAnswer = (val) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleSelectMC = (optionText) => {
    saveAnswer(optionText);
  };

  const handleBlankChange = (e) => {
    saveAnswer(e.target.value);
  };

  const handleMatchClick = (side, word) => {
    if (side === "left") {
      setSelectedMatchKey(word);
    } else if (side === "right" && selectedMatchKey) {
      const updatedPairs = {
        ...matchingPairs,
        [selectedMatchKey]: word,
      };
      setMatchingPairs(updatedPairs);
      setSelectedMatchKey(null);
      
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: updatedPairs,
      }));
    }
  };

  const handleResetMatches = () => {
    setMatchingPairs({});
    setSelectedMatchKey(null);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {},
    }));
  };

  const handleFlashcardRating = (rating) => {
    saveAnswer(rating);
    setFlipped(false);
    
    if (!isLastQuestion) {
      setTimeout(() => {
        setCurrentIdx((idx) => idx + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentQuestion.type === "MATCHING" && Object.keys(matchingPairs).length < currentQuestion.options.length) {
      alert("Please match all pairs before proceeding.");
      return;
    }
    
    if (currentQuestion.type === "FLASHCARD" && !answers[currentQuestion.id]) {
      alert("Please rate your knowledge on this vocabulary card before proceeding.");
      return;
    }

    if (!answers[currentQuestion.id]) {
      alert("Please answer the question before proceeding.");
      return;
    }

    if (!isLastQuestion) {
      setCurrentIdx((idx) => idx + 1);
      setFlipped(false);
      const nextQ = questions[currentIdx + 1];
      if (nextQ.type === "MATCHING") {
        setMatchingPairs(answers[nextQ.id] || {});
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((idx) => idx - 1);
      setFlipped(false);
      const prevQ = questions[currentIdx - 1];
      if (prevQ.type === "MATCHING") {
        setMatchingPairs(answers[prevQ.id] || {});
      }
    }
  };

  const handleSubmit = async () => {
    if (currentQuestion.type === "MATCHING" && Object.keys(matchingPairs).length < currentQuestion.options.length) {
      alert("Please match all pairs before submitting.");
      return;
    }
    
    if (currentQuestion.type === "FLASHCARD" && !answers[currentQuestion.id]) {
      alert("Please rate this final card before submitting.");
      return;
    }

    if (!answers[currentQuestion.id]) {
      alert("Please answer this final question before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = Object.keys(answers).map((qId) => ({
        questionId: qId,
        userAnswer: answers[qId],
      }));

      const res = await fetch(`/api/quizzes/${story.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit quiz answers");
      }

      router.push(`/stories/${story.slug}/result`);
    } catch (e) {
      console.error(e);
      alert("Something went wrong while submitting the quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getMatchingOptions = () => {
    const leftKeys = currentQuestion.options.map(o => o.matchKey).filter(Boolean);
    const rightVals = currentQuestion.options.map(o => o.matchValue).filter(Boolean);
    return { leftKeys, rightVals };
  };

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col justify-between">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center w-full">
        {/* Top bar toolbar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/stories/${story.slug}`}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Quit Quiz
          </Link>
          <span className="text-[10px] font-black text-slate-400">
            PERTANYAAN {currentIdx + 1} DARI {questions.length}
          </span>
        </div>

        {/* Quiz block container */}
        <div className="w-full glass-card p-8 md:p-10 rounded-2xl relative z-10 transition-all duration-300">
          <div className="flex gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-primary shrink-0" />
            <h2 className="font-display text-lg md:text-xl font-extrabold text-slate-800 leading-snug">
              {currentQuestion.questionText}
            </h2>
          </div>

          <div className="mb-8 pt-6 border-t border-slate-200/40">
            {/* MULTIPLE CHOICE */}
            {currentQuestion.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-4">
                {currentQuestion.options.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt.optionText;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectMC(opt.optionText)}
                      className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                        selected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-slate-200 hover:border-primary hover:bg-primary/5 text-slate-600"
                      }`}
                    >
                      {opt.optionText}
                    </button>
                  );
                })}
              </div>
            )}

            {/* FILL IN THE BLANK */}
            {currentQuestion.type === "FILL_IN_THE_BLANK" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ""}
                  onChange={handleBlankChange}
                  placeholder="Ketik jawaban Anda di sini..."
                  className="w-full px-5 py-4.5 rounded-2xl border border-slate-200 bg-white/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-slate-700 transition"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-2 px-1">Case insensitive, spelling counts.</p>
              </div>
            )}

            {/* MATCHING */}
            {currentQuestion.type === "MATCHING" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column: English Keys */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-black text-slate-400 tracking-wider mb-2 uppercase">English Word</span>
                    {getMatchingOptions().leftKeys.map((key) => {
                      const isPaired = !!matchingPairs[key];
                      const isSelected = selectedMatchKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => !isPaired && handleMatchClick("left", key)}
                          disabled={isPaired}
                          className={`w-full text-left p-3.5 rounded-xl border text-[11px] font-bold transition-all ${
                            isPaired
                              ? "border-emerald-200 bg-emerald-50/20 text-emerald-600 cursor-not-allowed"
                              : isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-slate-200 hover:border-primary/40 hover:bg-slate-50/50 text-slate-600 cursor-pointer"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{key}</span>
                            {isPaired && <span className="text-[9px] text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded">Paired</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Indonesian Meanings */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-black text-slate-400 tracking-wider mb-2 uppercase">Indonesian Translation</span>
                    {getMatchingOptions().rightVals.map((val) => {
                      const isPaired = Object.values(matchingPairs).includes(val);
                      return (
                        <button
                          key={val}
                          onClick={() => !isPaired && handleMatchClick("right", val)}
                          disabled={isPaired || !selectedMatchKey}
                          className={`w-full text-left p-3.5 rounded-xl border text-[11px] font-bold transition-all ${
                            isPaired
                              ? "border-emerald-200 bg-emerald-50/20 text-emerald-600 cursor-not-allowed"
                              : selectedMatchKey
                              ? "border-primary-fixed hover:border-primary/40 hover:bg-primary/5 text-slate-600 cursor-pointer"
                              : "border-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Show pairs currently matched */}
                {Object.keys(matchingPairs).length > 0 && (
                  <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matched Pairs</span>
                      <button
                        onClick={handleResetMatches}
                        className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Reset Matches
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(matchingPairs).map(([k, v]) => (
                        <span key={k} className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-lg">
                          <span>{k}</span>
                          <span className="text-slate-400">→</span>
                          <span>{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FLASHCARD */}
            {currentQuestion.type === "FLASHCARD" && (
              <div className="flex flex-col items-center gap-8 py-4">
                {/* 3D Flip Card */}
                <div
                  onClick={() => setFlipped(!flipped)}
                  className="w-full max-w-sm h-60 cursor-pointer [perspective:1000px] group"
                >
                  <div
                    className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${
                      flipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    {/* Front Card Face */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl border border-slate-200/60 bg-gradient-to-tr from-primary/5 to-primary-container/10 flex flex-col justify-center items-center p-8 [backface-visibility:hidden] shadow-md hover:shadow-lg transition">
                      <FlipHorizontal className="absolute top-5 right-5 w-4 h-4 text-primary" />
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-4">Vocabulary Word</span>
                      <span className="text-3xl font-black text-slate-800">{currentQuestion.options[0]?.matchKey || "Word"}</span>
                      <span className="text-xs text-slate-400 font-semibold mt-6">Click card to reveal translation</span>
                    </div>

                    {/* Back Card Face */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl border border-emerald-200 bg-emerald-50/20 flex flex-col justify-center items-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-md">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-4">Indonesian Meaning</span>
                      <span className="text-3xl font-black text-slate-800">{currentQuestion.options[0]?.matchValue || "Translation"}</span>
                      <span className="text-xs text-slate-400 font-semibold mt-6">Flip back</span>
                    </div>
                  </div>
                </div>

                {/* Self evaluation controls */}
                <div className="flex gap-4 w-full max-w-sm mt-4">
                  <button
                    onClick={() => handleFlashcardRating("dont_know")}
                    className={`flex-1 py-3.5 border rounded-xl font-bold text-xs transition cursor-pointer ${
                      answers[currentQuestion.id] === "dont_know"
                        ? "border-rose-300 bg-rose-50/50 text-rose-600 shadow-sm"
                        : "border-slate-200 text-slate-500 hover:bg-rose-50/30 hover:border-rose-300/40"
                    }`}
                  >
                    I Don't Know
                  </button>
                  <button
                    onClick={() => handleFlashcardRating("know")}
                    className={`flex-1 py-3.5 border rounded-xl font-bold text-xs transition cursor-pointer ${
                      answers[currentQuestion.id] === "know"
                        ? "border-emerald-300 bg-emerald-50/50 text-emerald-600 shadow-sm"
                        : "border-slate-200 text-slate-500 hover:bg-emerald-50/30 hover:border-emerald-300/40"
                    }`}
                  >
                    I Know This!
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200/40">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              Kembali
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Quiz <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                Lanjut <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
