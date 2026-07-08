"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowLeft, RefreshCw, ArrowRight, LayoutDashboard } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function QuizResultPage() {
  const { slug } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/quizzes/${slug}/result`);
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-12 flex-1 flex flex-col justify-center text-center">
          <h2 className="text-xl font-bold text-slate-800">No Result Found</h2>
          <Link href={`/stories/${slug}`} className="mt-6 text-xs font-bold text-primary hover:underline">
            Back to Story Details
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, review, story, nextStorySlug } = result;

  return (
    <div className="bg-surface mesh-gradient-bg min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center w-full">
        {/* Header Title */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-black text-primary tracking-widest uppercase font-mono">Quiz Evaluation</span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-800 mt-2">{story.title}</h1>
        </div>

        {/* Score Card Summary */}
        <div className="glass-card p-8 md:p-10 mb-10 text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 ${attempt.passed ? "bg-emerald-500" : "bg-rose-500"}`} />
          
          <div className="flex flex-col items-center">
            {attempt.passed ? (
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            ) : (
              <div className="bg-rose-100 text-rose-600 p-4 rounded-full mb-4">
                <XCircle className="w-12 h-12" />
              </div>
            )}
            
            <h2 className={`text-2xl font-black ${attempt.passed ? "text-emerald-700" : "text-rose-700"}`}>
              {attempt.passed ? "Passed!" : "Failed"}
            </h2>
            
            <div className="text-5xl font-black text-slate-800 mt-4 mb-2">
              {attempt.score}%
            </div>
            
            <p className="text-xs text-slate-500 font-semibold">
              Correct: {attempt.correctCount} of {attempt.totalQuestions} Questions
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
            <Link
              href={`/stories/${slug}/quiz`}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Quiz
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>

            {nextStorySlug ? (
              <Link
                href={`/stories/${nextStorySlug}`}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl primary-gradient text-white hover:shadow-lg text-xs font-black shadow-md transition cursor-pointer"
              >
                Next Story <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/stories"
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl primary-gradient text-white hover:shadow-lg text-xs font-black shadow-md transition cursor-pointer"
              >
                Story List <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Detailed Review Panel */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Question Review</h3>
          
          {review.map((item, idx) => (
            <div key={item.id} className="glass-card p-6 flex flex-col justify-between gap-3 relative">
              <div className="absolute top-6 left-6 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                {idx + 1}
              </div>
              
              <div className="pl-8">
                {/* Question text */}
                <h4 className="font-extrabold text-slate-800 text-sm leading-snug mb-4">
                  {item.questionText}
                </h4>

                {item.imageUrl && (
                  <div className="w-full max-w-xs rounded-xl overflow-hidden mb-4 border border-slate-200 bg-slate-50">
                    <img src={item.imageUrl} alt="Kuis" className="max-h-40 object-contain w-full" />
                  </div>
                )}

                {/* Show details depending on question types */}
                <div className="space-y-2 text-xs">
                  {/* Correct / Incorrect indicator */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  {item.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-500">
                        Your answer: <span className={item.isCorrect ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{item.userAnswer}</span>
                      </p>
                      {!item.isCorrect && (
                        <p className="font-semibold text-slate-500">
                          Correct option: <span className="text-emerald-600 font-bold">{item.options.find(o => o.isCorrect)?.optionText}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {item.type === "FILL_IN_THE_BLANK" && (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-500">
                        Your answer: <span className={item.isCorrect ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>"{item.userAnswer}"</span>
                      </p>
                      {!item.isCorrect && (
                        <p className="font-semibold text-slate-500">
                          Correct word: <span className="text-emerald-600 font-bold">"{item.answers[0]?.correctAnswer}"</span>
                        </p>
                      )}
                    </div>
                  )}

                  {item.type === "MATCHING" && (
                    <div className="space-y-3 pt-2">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Your pairings:</span>
                      <div className="flex flex-wrap gap-2">
                        {item.options.map((opt) => {
                          let userVal = "";
                          try {
                            const parsed = JSON.parse(item.userAnswer);
                            userVal = parsed[opt.matchKey] || "";
                          } catch (e) {}

                          const pairCorrect = userVal.trim().toLowerCase() === opt.matchValue.trim().toLowerCase();

                          return (
                            <span
                              key={opt.id}
                              className={`inline-flex items-center gap-1 border px-2.5 py-1.5 rounded-lg ${
                                pairCorrect ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                              }`}
                            >
                              <span>{opt.matchKey}</span>
                              <span className="text-slate-400">→</span>
                              <span>{userVal || "Unmatched"}</span>
                              {!pairCorrect && <span className="text-slate-400 font-semibold"> (Correct: {opt.matchValue})</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {item.type === "FLASHCARD" && (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-500">
                        Your self-rating: <span className={item.isCorrect ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                          {item.userAnswer === "know" ? "I Know This" : "I Don't Know"}
                        </span>
                      </p>
                      <p className="font-semibold text-slate-500 font-sans">
                        Word check: <span className="text-primary font-bold">{item.options[0]?.matchKey}</span> = <span className="text-primary font-bold">{item.options[0]?.matchValue}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
