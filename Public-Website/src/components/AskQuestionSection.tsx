"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { QuestionCategory, QUESTION_CATEGORIES, AnonymousQuestion } from "@/types";
import { submitAnonymousQuestion } from "@/services/api";
import { saveQuestionToLocalStorage } from "@/lib/storage";

interface AskQuestionSectionProps {
  onQuestionSubmitted: (created: AnonymousQuestion) => void;
}

export function AskQuestionSection({ onQuestionSubmitted }: AskQuestionSectionProps) {
  const [questionText, setQuestionText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>("Habitual Triggers");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<AnonymousQuestion | null>(null);

  const charCount = questionText.trim().length;
  const isValid = charCount >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await submitAnonymousQuestion(questionText.trim(), selectedCategory);
      // Save to localStorage for client-side tracking
      saveQuestionToLocalStorage(created);
      setLastSubmitted(created);
      setQuestionText("");
      onQuestionSubmitted(created);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="ask-question-section" className="w-full">
      <div className="bg-white/85 backdrop-blur-xl border border-black/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46]" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#202328]">
                Confidential Pastoral Inquiry
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal">
              Your inquiry is fully anonymous. No names, IP addresses, or personal identifiers are collected.
            </p>
          </div>
        </div>

        {/* Success Confirmation Card */}
        {lastSubmitted && (
          <div className="mb-5 p-4 rounded-2xl bg-[#202328] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F6CE46]/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-4 h-4 text-[#F6CE46]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Question Received Safely</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-[#F6CE46] font-mono">
                    {lastSubmitted.referenceNumber}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Saved to your browser&apos;s local cache. Check &quot;My Inquiries&quot; anytime to read the response.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLastSubmitted(null)}
              className="text-[11px] text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer self-end sm:self-auto"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Category Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#202328] block mb-2.5">
              1. Select Ministry Topic
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUESTION_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#202328] text-white border-[#202328] shadow-2xs"
                        : "bg-white text-neutral-600 border-black/10 hover:border-black/25 hover:text-[#202328]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="question-input" className="text-xs font-bold uppercase tracking-wider text-[#202328]">
                2. Write Your Confidential Question
              </label>
              <span className={`text-[11px] font-mono ${charCount < 10 ? "text-neutral-400" : "text-emerald-700 font-semibold"}`}>
                {charCount} characters (min 10)
              </span>
            </div>

            <div className="relative">
              <textarea
                id="question-input"
                required
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Describe your situation, struggle, or spiritual concern with honesty. You don't need to hold back—this is a safe, compassionate space..."
                className="w-full bg-[#EBECEF]/40 focus:bg-white text-xs sm:text-sm text-[#202328] placeholder-neutral-400 p-4 rounded-2xl border border-black/15 focus:border-[#202328] focus:ring-1 focus:ring-[#202328] outline-none transition-all resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Footer Submit Bar */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              id="btn-submit-question"
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                isValid && !isSubmitting
                  ? "bg-[#202328] hover:bg-black text-white"
                  : "bg-black/10 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Privately...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#F6CE46]" />
                  <span>Send Anonymous Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
