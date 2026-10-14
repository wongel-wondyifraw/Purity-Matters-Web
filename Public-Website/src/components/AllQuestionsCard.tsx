"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  User,
  RefreshCw,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { AnonymousQuestion, QUESTION_CATEGORIES } from "@/types";
import { fetchPublicWisdomQuestions } from "@/services/api";

export function AllQuestionsCard() {
  const [questions, setQuestions] = useState<AnonymousQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadQuestions = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchPublicWisdomQuestions();
      if (Array.isArray(data)) {
        setQuestions(data);
      }
    } catch (err) {
      console.warn("Could not load public questions:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesCategory =
        selectedCategory === "all" || q.category === selectedCategory;
      const qLower = (q.question || "").toLowerCase();
      const aLower = (q.answer || "").toLowerCase();
      const refLower = (q.referenceNumber || "").toLowerCase();
      const sLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !sLower ||
        qLower.includes(sLower) ||
        aLower.includes(sLower) ||
        refLower.includes(sLower);
      return matchesCategory && matchesSearch;
    });
  }, [questions, selectedCategory, searchQuery]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div id="all-questions-card" className="w-full">
      <div className="bg-white/85 backdrop-blur-xl border border-black/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46]" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#202328]">
                All Answered Questions
              </h2>
              <span className="text-xs bg-[#202328] text-white font-bold px-2 py-0.5 rounded-full ml-1">
                {questions.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal">
              Search through biblical guidance, answered inquiries, and community counsel.
            </p>
          </div>

          <button
            type="button"
            title="Refresh questions"
            onClick={loadQuestions}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-neutral-400 hover:text-[#202328] hover:bg-black/[0.04] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#F6CE46]" : ""}`}
            />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="input-search-questions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword or topic..."
            className="w-full bg-[#EBECEF]/40 focus:bg-white text-xs sm:text-sm text-[#202328] placeholder-neutral-400 pl-10 pr-9 py-2.5 rounded-full border border-black/15 focus:border-[#202328] focus:ring-1 focus:ring-[#202328] outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#202328] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-[#202328] text-white border-[#202328] shadow-2xs"
                : "bg-white/80 text-neutral-600 border-black/10 hover:border-black/20 hover:text-[#202328]"
            }`}
          >
            All Topics
          </button>
          {QUESTION_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-[#202328] text-white border-[#202328] shadow-2xs"
                    : "bg-white/80 text-neutral-600 border-black/10 hover:border-black/20 hover:text-[#202328]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto max-h-[500px] pr-1 space-y-2.5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-black/20 border-t-[#F6CE46] rounded-full animate-spin" />
              <span>Loading answered inquiries...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 rounded-2xl bg-black/[0.02] border border-black/[0.04] p-6">
              <HelpCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#202328]">
                No questions found
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                {searchQuery
                  ? `No matches for "${searchQuery}". Try a different keyword.`
                  : "No answered questions in this category yet."}
              </p>
            </div>
          ) : (
            filteredQuestions.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  id={`all-question-item-${item.id}`}
                  className="rounded-2xl border border-black/[0.06] bg-white/70 hover:bg-white transition-all overflow-hidden shadow-2xs"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-3.5 sm:p-4 cursor-pointer flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded-md text-[#202328]">
                          {item.referenceNumber}
                        </span>
                        <span className="text-[11px] font-medium text-neutral-500">
                          {item.category}
                        </span>
                        {item.answeredAt && (
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.answeredAt)}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-semibold text-[#202328] leading-snug line-clamp-2">
                        {item.question}
                      </h3>
                    </div>

                    <div className="shrink-0 pt-1 text-neutral-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {isExpanded && item.answer && (
                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-0 border-t border-black/[0.04] animate-in fade-in">
                      <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-[#202328] text-white space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                          <div className="flex items-center gap-1.5 font-semibold text-[#F6CE46]">
                            <User className="w-3.5 h-3.5" />
                            <span>
                              {item.assignedCounselor || "Pastoral Counsel"}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                            Biblical Guidance
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed font-normal">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
