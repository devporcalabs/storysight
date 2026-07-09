"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, RefreshCw, Volume2, Award, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const categorizedSentences = {
  "Greetings & Intro": [
    "Hello! Hi!", "Good morning, Teacher.", "Good afternoon, friends.", "Good evening, Mom.", "Good night, Dad.", "Goodbye! See you!",
    "My name is Rani.", "What is your name?", "I am eight years old.", "How are you?", "I am fine.", "I am happy.", "You are my friend.", "She is my teacher."
  ],
  "Colors & Numbers": [
    "One apple, two bananas, three watermelons, four oranges, five.", "Six, seven, eight, nine, ten.",
    "The apple is red.", "The sky is blue.", "The sun is yellow.", "The grass is green.", "The cat is black.", "The rabbit is white.", "The flower is pink.", "The orange is orange.", "The grape is purple.",
    "Eleven, twelve, thirteen, fourteen, fifteen.", "Sixteen, seventeen, eighteen, nineteen, twenty."
  ],
  "School & House": [
    "This is my school.", "This is my bag.", "This is my book.", "This is my pencil.", "This is my eraser.", "This is my ruler.", "The desk is clean.", "Sit on the chair.", "This is my sharpener.", "This is my pencil case.", "This is my pen.", "Look at the board.", "Look at the clock.",
    "This is my house.", "Open the window.", "Open the door.", "Clean the floor.", "The wall is white.", "The roof is red.", "The garden is beautiful."
  ],
  "Family & Food": [
    "This is my father.", "This is my mother.", "This is my brother.", "This is my sister.", "The baby is sleeping.", "This is my grandfather.", "This is my grandmother.",
    "I like apples.", "I like grapes.", "I like strawberries.", "I like bananas.", "I like watermelon.", "I like mangoes.", "What fruit do you like?",
    "I like fried chicken.", "I like noodles.", "I eat rice.", "I eat bread.", "I drink milk.", "I drink orange juice.", "I drink tea.", "My favourite food is fried rice.", "Do you like meatballs?"
  ],
  "Animals": [
    "The elephant is big.", "The cow is fat.", "The peacock is beautiful.", "The giraffe is tall.", "Hamsters are small.", "Cats are funny.", "The lion is strong.", "The wolf is wild.", "Horses are strong.",
    "The elephant has a strong trunk.", "The giraffe has a long neck.", "The rabbit has big ears.", "The cow has horns.", "The squirrel has a bushy tail."
  ],
  "School Activities & Hobbies": [
    "I like riding a bike.", "I like swimming.", "I like singing.", "I like reading a storybook.", "I like playing football.", "I like playing with dolls.",
    "We study in the laboratory.", "The teacher teaches in the classroom.", "We eat in the canteen.", "We drink water in the classroom.", "We read books in the library.", "We play football in the schoolyard.",
    "Today is Sunday.", "Today is Monday.", "It is Friday.", "I like playing football on Sunday."
  ]
};

export default function PronunciationPractice() {
  const categories = Object.keys(categorizedSentences);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [currentSentence, setCurrentSentence] = useState("");
  const [transcript, setTranscript] = useState("-");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [speakingSentence, setSpeakingSentence] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setRecording(true);
        setTranscript("Listening...");
        setScore(null);
        setFeedback("");
      };

      rec.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(`"${spokenText}"`);
        calculateScore(currentSentence, spokenText);
      };

      rec.onspeechend = () => {
        rec.stop();
      };

      rec.onend = () => {
        setRecording(false);
      };

      rec.onerror = (event) => {
        setRecording(false);
        setTranscript("Error: " + event.error);
        if (event.error === 'not-allowed') {
          setSupportMessage("Please allow microphone access in your browser settings to practice speaking.");
        }
      };

      setRecognition(rec);
    } else {
      setSupportMessage("Your browser does not support Speech Recognition. Please try Google Chrome for the best experience.");
    }
  }, [currentSentence]);

  // Load a new sentence when category changes or page loads
  useEffect(() => {
    loadNewSentence();
  }, [selectedCategory]);

  const loadNewSentence = () => {
    const list = categorizedSentences[selectedCategory];
    const randomIndex = Math.floor(Math.random() * list.length);
    setCurrentSentence(list[randomIndex]);
    setTranscript("-");
    setScore(null);
    setFeedback("");
    setSupportMessage("");
  };

  // Text-To-Speech Pronunciation checker
  const speakSentence = () => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentSentence);
      utterance.lang = "en-US";
      
      utterance.onstart = () => setSpeakingSentence(true);
      utterance.onend = () => setSpeakingSentence(false);
      utterance.onerror = () => setSpeakingSentence(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported on this browser.");
    }
  };

  const handleStartRecording = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.log("Speech recognition already running.");
      }
    } else {
      alert("Microphone feature is not initialized or unsupported.");
    }
  };

  // Levenshtein distance string similarity scoring
  const editDistance = (s1, s2) => {
    let costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  const calculateScore = (target, spoken) => {
    const cleanTarget = target.toLowerCase().replace(/[.,?\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const cleanSpoken = spoken.toLowerCase().replace(/[.,?\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

    let longer = cleanTarget;
    let shorter = cleanSpoken;
    if (cleanTarget.length < cleanSpoken.length) {
      longer = cleanSpoken;
      shorter = cleanTarget;
    }
    let longerLength = longer.length;
    let calculated = 0;
    
    if (longerLength !== 0) {
      calculated = Math.round(((longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)) * 100);
    }
    
    setScore(calculated);

    if (calculated >= 90) {
      setFeedback("Perfect! 🌟");
    } else if (calculated >= 70) {
      setFeedback("Good job! 👍");
    } else {
      setFeedback("Keep practicing! 💪");
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Desktop Wrapper */}
      <main className="hidden md:block max-w-4xl mx-auto px-6 py-12 space-y-8 bg-[#FAFAFA] min-h-screen">
        <div className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors cursor-pointer w-fit">
          <ArrowLeft className="w-5 h-5" />
          <Link href="/" className="font-bold text-sm">Kembali ke Home</Link>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10 flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <Mic className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pronunciation Practice</h1>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Choose a category, click the speaker to listen, then read the sentence into your microphone.
            </p>
          </div>

          {/* Category Selector Selector */}
          <div className="flex flex-wrap gap-2 justify-center w-full max-w-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Target Sentence Box */}
          <div className="w-full max-w-xl bg-slate-50 border border-slate-100 rounded-[20px] p-6 text-2xl font-bold text-slate-800 flex items-center justify-center relative min-h-[120px] shadow-inner">
            <span className="pr-12">{currentSentence}</span>
            <button
              onClick={speakSentence}
              className={`absolute right-4 w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                speakingSentence 
                  ? "bg-primary text-white border-primary animate-pulse" 
                  : "bg-white text-primary border-slate-200/60 hover:bg-slate-50 active:scale-90"
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Mic Button & Option controls */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStartRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                recording
                  ? "bg-red-600 border-red-600 shadow-[0_0_20px_rgba(220,53,69,0.5)] animate-pulse"
                  : "bg-primary hover:bg-[#c95906] border-primary shadow-[0_8px_20px_-6px_rgba(157,67,0,0.4)]"
              } text-white border active:scale-95 cursor-pointer`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {recording ? "Listening..." : "Click to Speak"}
            </span>

            <button
              onClick={loadNewSentence}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold py-2.5 px-5 rounded-[14px] transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Ganti Kalimat
            </button>
          </div>

          {/* Error messages */}
          {supportMessage && (
            <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4 text-xs text-amber-800 max-w-md flex items-start gap-2.5 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <span>{supportMessage}</span>
            </div>
          )}

          {/* Results Area */}
          {(score !== null || transcript !== "-") && (
            <div className="w-full max-w-xl border-t border-slate-100 pt-8 flex flex-col items-center space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Your Words</span>
                <span className="text-slate-700 italic font-medium text-lg block">{transcript}</span>
              </div>

              {score !== null && (
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Accuracy Score</span>
                  <div className={`text-6xl font-black font-display ${
                    score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {score}%
                  </div>
                  <span className={`text-sm font-extrabold ${
                    score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {feedback}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Wrapper */}
      <main className="md:hidden bg-[#FAFAFA] min-h-screen pb-32 pt-4 px-5 space-y-[24px] overflow-x-hidden">
        {/* Header Back Button */}
        <div className="flex items-center gap-1.5 text-slate-500 active:scale-95 transition-transform cursor-pointer w-fit">
          <ArrowLeft className="w-4 h-4" />
          <Link href="/" className="font-extrabold text-xs uppercase tracking-wider">Back</Link>
        </div>

        {/* Introduction Panel */}
        <div className="bg-white rounded-[18px] border border-slate-100 mobile-card-shadow p-5 flex flex-col items-center text-center space-y-5 animate-fade-in-up">
          <div className="space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <Mic className="w-6 h-6" />
            </div>
            <h1 className="text-[24px] font-bold text-slate-800 tracking-tight leading-tight">Pronunciation</h1>
            <p className="text-[#64748B] text-[14px] leading-relaxed max-w-xs mx-auto">
              Listen to the correct sound, read it yourself, and check your practice score!
            </p>
          </div>

          {/* Categories Selector Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full -mx-5 px-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 active:scale-[0.97] ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sentence Target Container */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-[18px] p-5 text-[18px] font-semibold text-slate-800 flex items-center justify-center relative min-h-[90px] shadow-inner">
            <span className="pr-12 text-center leading-snug">{currentSentence}</span>
            <button
              onClick={speakSentence}
              className={`absolute right-3 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                speakingSentence 
                  ? "bg-primary text-white border-primary animate-pulse" 
                  : "bg-white text-primary border-slate-200/60 active:scale-90"
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleStartRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 tap-feedback active:scale-[0.97] ${
                recording
                  ? "bg-red-600 border-red-600 shadow-[0_0_20px_rgba(220,53,69,0.5)] animate-pulse"
                  : "bg-primary border-primary shadow-[0_8px_20px_-6px_rgba(157,67,0,0.4)]"
              } text-white border`}
            >
              <Mic className="w-7 h-7" />
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {recording ? "Listening..." : "Tap to Practice"}
            </span>

            <button
              onClick={loadNewSentence}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 px-4 rounded-[14px] transition active:scale-[0.97] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Ganti Kalimat
            </button>
          </div>

          {/* Support status warning */}
          {supportMessage && (
            <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-3 text-[12px] text-amber-800 w-full flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{supportMessage}</span>
            </div>
          )}

          {/* Results Output */}
          {(score !== null || transcript !== "-") && (
            <div className="w-full border-t border-slate-100 pt-5 flex flex-col items-center space-y-3.5">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Spoken Word</span>
                <span className="text-slate-700 italic font-medium text-[15px] block">{transcript}</span>
              </div>

              {score !== null && (
                <div className="flex flex-col items-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accuracy Score</span>
                  <div className={`text-5xl font-black font-display leading-tight ${
                    score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {score}%
                  </div>
                  <span className={`text-[12px] font-extrabold ${
                    score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {feedback}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
