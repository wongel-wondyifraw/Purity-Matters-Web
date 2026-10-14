"use client";

import React from "react";
import { Hero } from "@/components/Hero";
import { AskQuestionSection } from "@/components/AskQuestionSection";
import { AllQuestionsCard } from "@/components/AllQuestionsCard";
import { AnonymousQuestion } from "@/types";
import { saveQuestionToLocalStorage } from "@/lib/storage";

export default function HomePage() {
  const handleQuestionSubmitted = (created: AnonymousQuestion) => {
    saveQuestionToLocalStorage(created);
  };

  const scrollToAsk = () => {
    document
      .getElementById("ask-question-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="public-website-app" className="min-h-screen flex flex-col bg-[#EBECEF]">
      <main className="flex-1">
        {/* Seamless Unified Upper Canvas with Continuous Flowing Gradient under the Question Modal */}
        <div
          id="hero-intake-canvas"
          className="relative w-full overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 110% 70% at 50% 0%, rgba(246, 206, 70, 0.28) 0%, rgba(246, 206, 70, 0.12) 35%, rgba(246, 206, 70, 0.05) 60%, rgba(235, 236, 239, 0) 90%), linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(235, 236, 239, 0) 50%, rgba(235, 236, 239, 0.7) 85%, #EBECEF 100%)",
          }}
        >
          {/* Ambient Gold Light Blooms extending continuously behind both Hero and Question Modal */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-[#F6CE46]/22 rounded-full blur-[110px] pointer-events-none select-none z-0" />
          <div className="absolute top-1/4 -left-24 w-[450px] h-[550px] bg-[#F6CE46]/14 rounded-full blur-[100px] pointer-events-none select-none z-0" />
          <div className="absolute top-1/3 -right-24 w-[450px] h-[550px] bg-[#F6CE46]/14 rounded-full blur-[100px] pointer-events-none select-none z-0" />

          <Hero onScrollToAsk={scrollToAsk} />

          {/* Side-by-Side Dual-Card Grid Using Full Page Width */}
          <section
            id="qa-dual-grid-section"
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14 sm:pb-20 relative z-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              {/* Left Column: Ask Anonymous Question Card */}
              <div className="w-full">
                <AskQuestionSection onQuestionSubmitted={handleQuestionSubmitted} />
              </div>

              {/* Right Column: All Questions Display Card with Search */}
              <div className="w-full">
                <AllQuestionsCard />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
