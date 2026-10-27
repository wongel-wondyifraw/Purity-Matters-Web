"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Users, UserCheck, BookOpen } from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";

export function AppHero() {
  const pathname = usePathname();
  const isDashboard = pathname === "/";
  const {
    totalClients,
    counselingCount,
    innerHealingCount,
    resourceCount,
  } = useAdminData();
  const { user, timeGreeting } = useAuth();
  const displayName = user?.firstName ? `, ${user.firstName}` : "";

  return (
    <section
      id="crextio-hero-section"
      className={`flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1 shrink-0 ${
        isDashboard ? "flex" : "hidden lg:flex"
      }`}
    >
      {/* Left Side: Welcome Headline */}
      <div id="crextio-welcome-header">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#202328]">
          {timeGreeting}{displayName}
        </h1>
      </div>

      {/* Right Side: 3 Giant Stationary Metric Numbers */}
      <div
        id="crextio-stationary-kpis"
        className={`items-center gap-4 sm:gap-8 xl:gap-11 pt-1 xl:pt-0 overflow-x-auto no-scrollbar ${
          isDashboard ? "flex" : "hidden lg:flex"
        }`}
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
