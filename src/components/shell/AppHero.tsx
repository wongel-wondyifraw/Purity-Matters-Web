"use client";

import React from "react";
import { Users, UserCheck, BookOpen } from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";

export function AppHero() {
  const {
    totalClients,
    counselingCount,
    innerHealingCount,
    resourceCount,
  } = useAdminData();
  const { user, timeGreeting } = useAuth();
  const displayName = user?.firstName || "Admin";

  return (
    <section
      id="crextio-hero-section"
      className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-1 shrink-0"
    >
      {/* Left Side: Welcome Headline & 4-Capsule Segmented Bar */}
      <div className="space-y-2.5">
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#202328]">
          {timeGreeting}, {displayName}
        </h1>

        {/* Segmented 4-Capsule Bar Exactly Matching Reference Layout */}
        <div id="crextio-segmented-bar" className="flex items-center gap-1.5 pt-1">
          <div
            className="h-9 px-4 rounded-full bg-[#202328] text-white flex items-center justify-between text-xs font-semibold shadow-xs"
            style={{ width: "175px" }}
          >
            <span>Active</span>
            <span className="text-[#F6CE46]">58%</span>
          </div>

          <div
            className="h-9 px-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-between text-xs font-bold shadow-xs"
            style={{ width: "125px" }}
          >
            <span>In Queue</span>
            <span>26%</span>
          </div>

          <div
            className="h-9 px-4 rounded-full bg-white text-[#202328] flex items-center justify-between text-xs font-bold shadow-xs border border-black/10"
            style={{ width: "95px" }}
          >
            <span>Done</span>
            <span>16%</span>
          </div>
        </div>
      </div>

      {/* Right Side: 3 Giant Stationary Metric Numbers */}
      <div
        id="crextio-stationary-kpis"
        className="flex items-center gap-6 sm:gap-9 xl:gap-11 pt-2 xl:pt-0"
      >
        {/* KPI 1: Clients */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-neutral-200/70 flex items-center justify-center text-neutral-600 mt-2 shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-light tracking-tight text-[#202328] leading-none">
              {totalClients}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1">Clients</div>
          </div>
        </div>

        {/* KPI 2: Requests */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-neutral-200/70 flex items-center justify-center text-neutral-600 mt-2 shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-light tracking-tight text-[#202328] leading-none">
              {counselingCount + innerHealingCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1">Requests</div>
          </div>
        </div>

        {/* KPI 3: eBooks */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-neutral-200/70 flex items-center justify-center text-neutral-600 mt-2 shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-light tracking-tight text-[#202328] leading-none">
              {resourceCount}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1">eBooks</div>
          </div>
        </div>
      </div>
    </section>
  );
}
