"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

interface HeroProps {
  onScrollToAsk: () => void;
}

export function Hero({ onScrollToAsk }: HeroProps) {
  return (
    <section
      id="hero-section"
      className="relative w-full pt-14 pb-4 sm:pt-20 sm:pb-6 overflow-hidden flex flex-col items-center justify-center text-center"
    >

      {/* Floating Anonymity & Security Small SVGs Across the Full Width */}
      {/* 1. Incognito Fedora & Shades (Far Left Top) */}
      <div
        id="float-svg-incognito"
        className="absolute top-6 left-4 sm:left-10 lg:left-20 xl:left-32 pointer-events-none select-none z-0 opacity-40 animate-float-1"
        style={{ filter: "drop-shadow(0 0 12px rgba(246, 206, 70, 0.8))" }}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-7 h-7 sm:w-8 sm:h-8 text-[#202328]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 20 C13 10, 17 8, 24 8 C31 8, 35 10, 36 20 Z" fill="currentColor" />
          <path d="M12 19 C18 18, 30 18, 36 19 L36 21 C30 20, 18 20, 12 21 Z" fill="#F6CE46" />
          <path d="M4 22 C12 19, 36 19, 44 22 C46 23, 42 24, 34 24 C22 25, 10 24, 4 22 Z" fill="currentColor" />
          <rect x="11" y="27" width="10" height="7" rx="3" fill="currentColor" />
          <rect x="27" y="27" width="10" height="7" rx="3" fill="currentColor" />
          <path d="M21 30 C23 29, 25 29, 27 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. Anonymous Mask (Far Right Top) */}
      <div
        id="float-svg-mask"
        className="absolute top-8 right-5 sm:right-12 lg:right-20 xl:right-32 pointer-events-none select-none z-0 opacity-40 animate-float-2"
        style={{ filter: "drop-shadow(0 0 12px rgba(246, 206, 70, 0.8))" }}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 text-[#202328]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 6 C13 6, 8 15, 8 25 C8 35, 16 43, 24 43 C32 43, 40 35, 40 25 C40 15, 35 6, 24 6 Z"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="currentColor"
            fillOpacity="0.06"
          />
          <path d="M14 20 C17 18, 20 18, 21 20 C19 22, 16 22, 14 20 Z" fill="#F6CE46" />
          <path d="M34 20 C31 18, 28 18, 27 20 C29 22, 32 22, 34 20 Z" fill="#F6CE46" />
          <path d="M17 31 C20 30, 22 29, 24 29 C26 29, 28 30, 31 31" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="24" cy="36" r="1.3" fill="#F6CE46" />
        </svg>
      </div>

      {/* 3. Security Padlock (Far Left Mid) */}
      <div
        id="float-svg-lock"
        className="absolute top-1/2 -translate-y-8 left-3 sm:left-8 lg:right-auto lg:left-16 xl:left-24 pointer-events-none select-none z-0 opacity-35 animate-float-3"
        style={{ filter: "drop-shadow(0 0 12px rgba(246, 206, 70, 0.8))" }}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#202328]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 20 V15 C16 10.5, 19.5 7, 24 7 C28.5 7, 32 10.5, 32 15 V20"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <rect x="11" y="20" width="26" height="21" rx="5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="24" cy="29" r="2.5" fill="#F6CE46" />
          <path d="M24 31.5 V35" stroke="#F6CE46" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 4. Privacy Shield with Keyhole (Far Right Mid) */}
      <div
        id="float-svg-shield"
        className="absolute top-1/2 -translate-y-4 right-3 sm:right-8 lg:right-16 xl:right-24 pointer-events-none select-none z-0 opacity-35 animate-float-1"
        style={{ filter: "drop-shadow(0 0 12px rgba(246, 206, 70, 0.8))" }}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 text-[#202328]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 6 L38 11 C38 27, 32 36, 24 42 C16 36, 10 27, 10 11 L24 6 Z"
            stroke="currentColor"
            strokeWidth="2.4"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <circle cx="24" cy="20" r="2.5" fill="#F6CE46" />
          <path d="M23 22 L22 28 L26 28 L25 22 Z" fill="#F6CE46" />
        </svg>
      </div>

      {/* 5. Discreet Eye-Off Visor (Bottom Left) */}
      <div
        id="float-svg-eye-off"
        className="absolute bottom-5 left-8 sm:left-16 lg:left-28 xl:left-40 pointer-events-none select-none z-0 opacity-35 animate-float-2"
        style={{ filter: "drop-shadow(0 0 12px rgba(246, 206, 70, 0.8))" }}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#202328]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 24 C13 16, 20 12, 24 12 C28 12, 35 16, 40 24 C35 32, 28 36, 24 36 C20 36, 13 32, 8 24 Z"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="currentColor"
            fillOpacity="0.06"
          />
          <circle cx="24" cy="24" r="5" fill="#F6CE46" />
          <path d="M10 38 L38 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>

      {/* 6. Anonymity Fingerprint Shroud (Bottom Right) */}
      <div
        id="float-svg-fingerprint"
        className="absolute bottom-5 right-8 sm:right-16 lg:right-28 xl:right-40 pointer-events-none select-none z-0 opacity-35 animate-float-3"
        style={{ filter: "drop-shadow(0 0 12px rgba(246, 206, 70, 0.8))" }}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#202328]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 10 C18 10, 14 14, 14 20 C14 28, 17 34, 19 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 15 C20 15, 18 18, 18 22 C18 29, 21 34, 23 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 20 C23 20, 22 21, 22 23 C22 27, 24 31, 25 34" stroke="#F6CE46" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M29 12 C33 15, 34 20, 34 25 C34 31, 31 35, 29 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Foreground Hero Content (Centered) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col items-center justify-center">
        {/* Brand Top Headline: Purity Matters with Yellow Dot */}
        <div
          id="brand-top-headline"
          className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-3 sm:mb-4 text-center"
        >
          <span
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#F6CE46] shadow-[0_0_18px_#F6CE46] animate-pulse shrink-0"
            aria-hidden="true"
          />
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#202328] text-center">
            Purity Matters
          </h1>
          <span
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full opacity-0 pointer-events-none shrink-0"
            aria-hidden="true"
          />
        </div>

        {/* Prominent Question Headline: "What Are You Struggling With?" */}
        <div
          id="question-invitation-headline"
          className="w-full flex items-center justify-center text-center mb-3 sm:mb-4"
        >
          <h2 className="inline-flex items-center justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tight text-[#202328] text-center">
            <span
              className="w-6 sm:w-8 md:w-10 h-8 sm:h-11 md:h-13 opacity-0 pointer-events-none shrink-0"
              aria-hidden="true"
            />
            <span className="text-center">What Are You Struggling With</span>
            <svg
              viewBox="0 0 14 22"
              className="w-6 h-8 sm:w-8 sm:h-11 md:w-10 md:h-13 inline-block text-[#202328] -mb-1 shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="?"
            >
              <path
                d="M2.5 5.5 C2.5 2 11.5 2 11.5 6 C11.5 9 7 9.8 7 13.5"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <circle
                cx="7"
                cy="18.5"
                r="2.5"
                fill="#F6CE46"
                style={{ filter: "drop-shadow(0 0 8px rgba(246, 206, 70, 1))" }}
              />
            </svg>
          </h2>
        </div>

        {/* Sub-headline: Ask in Absolute Confidentiality */}
        <p
          id="sub-headline-confidentiality"
          className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-neutral-700 mb-6 sm:mb-8 text-center"
        >
          Ask in Absolute Confidentiality.
        </p>

        {/* Call to Actions */}
        <div className="flex items-center justify-center text-center">
          <button
            type="button"
            id="btn-hero-ask"
            onClick={onScrollToAsk}
            className="w-full sm:w-auto bg-[#202328] hover:bg-black text-white text-sm font-semibold px-7 py-3 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <span>Ask Your Question Anonymously</span>
            <ArrowDown className="w-4 h-4 text-[#F6CE46]" />
          </button>
        </div>
      </div>
    </section>
  );
}
