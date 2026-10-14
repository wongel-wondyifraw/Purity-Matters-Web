"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Laptop,
  Zap,
  Bot,
  Sliders,
  Link2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function OverviewWidgets() {
  const [isTimerPlaying, setIsTimerPlaying] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("devices");

  return (
    <div className="flex-1 min-h-0 h-full overflow-y-auto pr-1 space-y-4 lg:space-y-5">
      {/* ROW 1 CARDS: Profile, Progress, Time tracker, Onboarding (4 Columns) */}
      <section id="crextio-row-1-grid" className="grid grid-cols-12 gap-3.5 lg:gap-4">
        {/* Card 1: Purity Matters Ministry Brand Card */}
        <div
          id="purity-matters-brand-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl overflow-hidden relative shadow-2xs group h-[215px] xl:h-[225px] flex flex-col justify-end"
        >
          <img
            src="/purity_matters_card.jpg"
            alt="Purity Matters Ministry"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Card 2: Progress Card */}
        <div
          id="crextio-progress-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202328] tracking-tight">Progress</h3>
              <button
                type="button"
                className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[#202328] hover:bg-black/5 transition-colors cursor-pointer text-xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-light tracking-tight text-[#202328]">
                6.1 h
              </span>
              <span className="text-[11px] text-neutral-500 leading-tight">
                Work Time
                <br />
                this week
              </span>
            </div>
          </div>

          {/* Weekly Capsule Bars: S M T W T F S */}
          <div className="pt-1">
            <div className="grid grid-cols-7 gap-2 items-end h-20 relative pb-1">
              <div className="flex flex-col items-center justify-end h-full">
                <div className="w-2.5 h-6 bg-[#202328] rounded-full" />
              </div>
              <div className="flex flex-col items-center justify-end h-full">
                <div className="w-2.5 h-14 bg-[#202328] rounded-full" />
              </div>
              <div className="flex flex-col items-center justify-end h-full">
                <div className="w-2.5 h-10 bg-[#202328] rounded-full" />
              </div>
              <div className="flex flex-col items-center justify-end h-full">
                <div className="w-2.5 h-12 bg-[#202328] rounded-full" />
              </div>
              <div className="flex flex-col items-center justify-end h-full">
                <div className="w-2.5 h-14 bg-[#202328] rounded-full" />
              </div>
              <div className="flex flex-col items-center justify-end h-full relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#F6CE46] text-[#202328] text-[9px] font-bold whitespace-nowrap shadow-2xs">
                  5h 23m
                </div>
                <div className="w-2.5 h-16 bg-[#F6CE46] rounded-full" />
              </div>
              <div className="flex flex-col items-center justify-end h-full">
                <div className="w-2.5 h-8 bg-neutral-300 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-medium text-neutral-400 pt-1 border-t border-black/[0.04]">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span className="font-bold text-[#202328]">F</span>
              <span>S</span>
            </div>
          </div>
        </div>

        {/* Card 3: Time tracker Card */}
        <div
          id="crextio-time-tracker-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#202328] tracking-tight">Time tracker</h3>
            <button
              type="button"
              className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[#202328] hover:bg-black/5 transition-colors cursor-pointer text-xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center my-auto">
            <svg viewBox="0 0 120 120" className="w-24 h-24">
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="#E4E4E7"
                strokeWidth="2"
                strokeDasharray="3 4"
              />
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="#F6CE46"
                strokeWidth="6"
                strokeDasharray="200 290"
                strokeDashoffset="-20"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold tracking-tight text-[#202328]">02:35</span>
              <span className="text-[10px] text-neutral-500 font-medium -mt-0.5">
                Work Time
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTimerPlaying(!isTimerPlaying)}
                className="w-7 h-7 rounded-full border border-black/10 bg-white hover:bg-neutral-50 flex items-center justify-center text-[#202328] shadow-2xs cursor-pointer transition-colors"
              >
                {isTimerPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 ml-0.5 fill-current" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsTimerPlaying(false)}
                className="w-7 h-7 rounded-full border border-black/10 bg-white hover:bg-neutral-50 flex items-center justify-center text-[#202328] shadow-2xs cursor-pointer transition-colors"
              >
                <Pause className="w-3 h-3 fill-current" />
              </button>
            </div>
            <button
              type="button"
              className="w-7 h-7 rounded-full bg-[#202328] text-white flex items-center justify-center hover:bg-black shadow-2xs cursor-pointer transition-colors"
            >
              <Clock className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Onboarding Card */}
        <div
          id="crextio-onboarding-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px]"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-bold text-[#202328] tracking-tight">Onboarding</h3>
            <span className="text-3xl font-light tracking-tight text-[#202328]">18%</span>
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium px-1">
              <span>30%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-[#F6CE46] text-[#202328] px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center shadow-2xs">
                Task
              </div>
              <div className="w-14 bg-[#202328] text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center shadow-2xs">
                &nbsp;
              </div>
              <div className="w-10 bg-neutral-400/50 py-2 rounded-xl font-bold text-xs flex items-center justify-center">
                &nbsp;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 2 CARDS: Accordion, Calendar Timeline, Dark Task Card (3 Columns) */}
      <section id="crextio-row-2-grid" className="grid grid-cols-12 gap-3.5 lg:gap-4">
        {/* Card 1: Accordion List Card */}
        <div
          id="crextio-accordion-card"
          className="col-span-12 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between space-y-3 h-[230px] xl:h-[240px]"
        >
          <div className="pb-2.5 border-b border-dashed border-black/10">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "pension" ? null : "pension")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span>Pension contributions</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                  openAccordion === "pension" ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div className="pb-2.5 border-b border-dashed border-black/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#202328]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#202328]" />
                Inner Healing
              </span>
              <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
            </div>
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-6 rounded bg-[#202328] p-[1px] shadow-2xs shrink-0 flex items-center justify-center">
                  <div className="w-full h-full bg-[#202328] rounded flex items-center justify-center text-[10px] text-[#F6CE46] font-bold">
                    IH
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#202328] leading-tight">
                    Spiritual Deliverance
                  </div>
                  <div className="text-[10px] text-neutral-400 font-medium">
                    Session In-Queue
                  </div>
                </div>
              </div>
              <Link
                href="/inner-healing"
                className="text-neutral-400 hover:text-[#202328] p-1 text-xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="pb-2.5 border-b border-dashed border-black/10">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "compensation" ? null : "compensation")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span>Compensation Summary</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          <div className="pt-0.5">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "benefits" ? null : "benefits")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span>Employee Benefits</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Card 2: Anonymous Questions & Pastoral Inquiries Card */}
        <div
          id="crextio-anonymous-questions-card"
          className="col-span-12 lg:col-span-6 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[230px] xl:h-[240px]"
        >
          <div className="flex items-center justify-between pb-1 border-b border-black/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#202328] tracking-tight">
                  Anonymous Questions
                </h3>
                <span className="bg-[#202328] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Bot Inquiries
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Confidential questions submitted by Telegram community members
              </p>
            </div>

            <Link
              href="/anonymous-questions"
              className="text-xs font-semibold text-[#202328] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 py-1 overflow-hidden">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.06] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#202328]">
                    #AQ-101
                  </span>
                  <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-medium">
                    Habitual Triggers
                  </span>
                </div>
                <p className="text-xs text-[#202328] font-medium truncate mt-0.5">
                  "How do I overcome habitual relapse late at night when loneliness strikes?"
                </p>
              </div>
              <span className="shrink-0 bg-[#F6CE46]/30 border border-[#F6CE46]/50 text-[#202328] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Answered
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.06] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#202328]">
                    #AQ-102
                  </span>
                  <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-medium">
                    Guilt & Shame
                  </span>
                </div>
                <p className="text-xs text-[#202328] font-medium truncate mt-0.5">
                  "I feel unworthy to pray after falling into impurity. Does God still hear me?"
                </p>
              </div>
              <span className="shrink-0 bg-neutral-100 border border-black/10 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Pending
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-neutral-400">
            <span>Identity strictly confidential via Telegram</span>
            <Link
              href="/anonymous-questions"
              className="text-[#202328] font-semibold hover:underline"
            >
              Respond to Inquiries →
            </Link>
          </div>
        </div>

        {/* Card 3: Signature Dark Charcoal Task Card */}
        <div
          id="crextio-dark-task-card"
          className="col-span-12 lg:col-span-3 bg-[#202328] text-white rounded-2xl p-4 xl:p-5 shadow-md flex flex-col justify-between h-[230px] xl:h-[240px]"
        >
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-semibold text-white/90 tracking-tight">
              Onboarding Task
            </h3>
            <span className="text-2xl font-light text-white tracking-tight">2/8</span>
          </div>

          <div className="space-y-2.5 pt-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Laptop className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    Interview
                  </div>
                  <div className="text-[10px] text-white/50">Sep 13, 08:30</div>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    Team Meeting
                  </div>
                  <div className="text-[10px] text-white/50">Sep 13, 10:30</div>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 text-[#202328]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    Project Update
                  </div>
                  <div className="text-[10px] text-white/50">Sep 13, 13:00</div>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border border-white/20" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 text-[#202328]">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    Discuss Q3 Goals
                  </div>
                  <div className="text-[10px] text-white/50">Sep 13, 14:45</div>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border border-white/20" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 text-[#202328]">
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    HR Policy Review
                  </div>
                  <div className="text-[10px] text-white/50">Sep 13, 16:30</div>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border border-white/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
