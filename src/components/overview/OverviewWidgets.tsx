"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HeartHandshake,
  BookOpen,
  ShoppingBag,
  Users,
  CheckCircle2,
  HelpCircle,
  Bot,
  UserCheck,
  ShieldCheck,
  Radio,
  Check,
} from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";

export function OverviewWidgets() {
  const {
    clients,
    counselingRequests,
    innerHealingRequests,
    courseProgressList,
    resourceOrders,
    anonymousQuestions,
    totalClients,
    verifiedClients,
    counselingCount,
    innerHealingCount,
    coursesCount,
    resourceCount,
  } = useAdminData();

  const [openAccordion, setOpenAccordion] = useState<string | null>("counseling");

  // 1. Calculate 7-Day Weekly Inflow (Sun = 0, Mon = 1, ... Sat = 6)
  const weeklyData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const checkTimestamp = (ts: string | undefined | null) => {
      if (!ts) return;
      const d = new Date(ts);
      if (d >= startOfWeek && d < endOfWeek) {
        const dayIdx = d.getDay();
        counts[dayIdx] += 1;
      }
    };

    clients.forEach((c) => checkTimestamp(c.joinedAt));
    counselingRequests.forEach((c) => checkTimestamp(c.createdAt));
    innerHealingRequests.forEach((i) => checkTimestamp(i.createdAt));
    anonymousQuestions.forEach((q) => checkTimestamp(q.submittedAt));
    resourceOrders.forEach((o) => checkTimestamp(o.createdAt));

    const totalWeek = counts.reduce((a, b) => a + b, 0);
    const todayCount = counts[currentDayOfWeek];
    const maxCount = Math.max(...counts, 1);

    return {
      counts,
      totalWeek,
      todayCount,
      maxCount,
      currentDayOfWeek,
    };
  }, [clients, counselingRequests, innerHealingRequests, anonymousQuestions, resourceOrders]);

  // 2. Pastoral Care Resolution Rate
  const totalCareInquiries = counselingRequests.length + innerHealingRequests.length;
  const completedCareInquiries =
    counselingRequests.filter((c) => c.status === "completed").length +
    innerHealingRequests.filter((i) => i.status === "completed").length;
  const inQueueCareInquiries = totalCareInquiries - completedCareInquiries;
  const careResolutionRate =
    totalCareInquiries > 0
      ? Math.round((completedCareInquiries / totalCareInquiries) * 100)
      : 100;
  // SVG radius 46 circumference is 289
  const strokeDash = `${(careResolutionRate / 100) * 289} 289`;

  // 3. Intake Verification & Discipleship Funnel
  const verifiedRate = totalClients > 0 ? Math.round((verifiedClients / totalClients) * 100) : 0;
  const inCareRate = totalClients > 0 ? Math.round((counselingCount / totalClients) * 100) : 0;
  const onJourneyRate = totalClients > 0 ? Math.round((coursesCount / totalClients) * 100) : 0;

  // 4. Anonymous Questions metrics
  const pendingQuestionsCount = useMemo(() => {
    return anonymousQuestions.filter((q) => q.status === "pending").length;
  }, [anonymousQuestions]);

  const recentQuestions = useMemo(() => {
    return anonymousQuestions.slice(0, 2);
  }, [anonymousQuestions]);

  // 5. Intelligent Pastoral Priority Action Queue (5 items)
  const priorityActionItems = useMemo(() => {
    const items = [];

    // Action 1: Unanswered anonymous question
    const pendingQ = anonymousQuestions.find((q) => q.status === "pending");
    if (pendingQ) {
      items.push({
        id: "action-aq",
        icon: HelpCircle,
        title: `Reply to ${pendingQ.referenceNumber}`,
        subtitle: pendingQ.category || "Anonymous Inquiry",
        isCompleted: false,
        href: "/anonymous-questions",
      });
    } else {
      items.push({
        id: "action-aq-done",
        icon: HelpCircle,
        title: "Anonymous Questions Clear",
        subtitle: "All inquiries answered",
        isCompleted: true,
        href: "/anonymous-questions",
      });
    }

    // Action 2: Counseling intake
    const pendingCounseling = counselingRequests.find(
      (c) => c.status === "pending" || c.status === "assigned"
    );
    if (pendingCounseling) {
      items.push({
        id: "action-counseling",
        icon: HeartHandshake,
        title: `Intake: ${pendingCounseling.clientName}`,
        subtitle: pendingCounseling.concern || "Pastoral Session",
        isCompleted: false,
        href: "/counseling",
      });
    } else {
      items.push({
        id: "action-counseling-done",
        icon: HeartHandshake,
        title: "Counseling Intake Assigned",
        subtitle: "No unassigned clients",
        isCompleted: true,
        href: "/counseling",
      });
    }

    // Action 3: Inner Healing Session
    const pendingHealing = innerHealingRequests.find((i) => i.status === "pending");
    if (pendingHealing) {
      items.push({
        id: "action-healing",
        icon: Sparkles,
        title: `Healing: ${pendingHealing.clientName}`,
        subtitle: pendingHealing.topic || "Spiritual Deliverance",
        isCompleted: false,
        href: "/inner-healing",
      });
    } else {
      items.push({
        id: "action-healing-done",
        icon: Sparkles,
        title: "Deliverance Queue Up-to-Date",
        subtitle: "Sessions scheduled",
        isCompleted: true,
        href: "/inner-healing",
      });
    }

    // Action 4: Order Payment Verification
    const pendingOrder = resourceOrders.find(
      (o) => o.paymentStatus === "payment_submitted"
    );
    if (pendingOrder) {
      items.push({
        id: "action-order",
        icon: ShoppingBag,
        title: `Verify ${pendingOrder.orderNumber}`,
        subtitle: `${pendingOrder.resourceTitle} (${pendingOrder.paymentMethod || "Telebirr"})`,
        isCompleted: false,
        href: "/resources",
      });
    } else {
      items.push({
        id: "action-order-done",
        icon: ShoppingBag,
        title: "E-Book Deliveries Automated",
        subtitle: "No payments pending audit",
        isCompleted: true,
        href: "/resources",
      });
    }

    // Action 5: Accountability Partner Pair
    const partnerNeeded = courseProgressList.find((c) => c.accountabilityRequested);
    if (partnerNeeded) {
      items.push({
        id: "action-partner",
        icon: Users,
        title: `Pair Partner: ${partnerNeeded.clientName}`,
        subtitle: `${partnerNeeded.courseTitle} (Day ${partnerNeeded.currentDay})`,
        isCompleted: false,
        href: "/courses",
      });
    } else {
      items.push({
        id: "action-partner-done",
        icon: Users,
        title: "Discipleship Cohort Active",
        subtitle: "30-Day Journeys on track",
        isCompleted: true,
        href: "/courses",
      });
    }

    return items;
  }, [
    anonymousQuestions,
    counselingRequests,
    innerHealingRequests,
    resourceOrders,
    courseProgressList,
  ]);

  const completedActionsCount = priorityActionItems.filter((i) => i.isCompleted).length;

  // Day initials for the 7-day capsule bar chart
  const dayInitials = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="w-full flex-1 min-h-0 overflow-visible lg:overflow-y-auto lg:h-full pr-0 lg:pr-1 space-y-4 lg:space-y-5">
      {/* ROW 1 CARDS: Brand Cover, Weekly Inflow, Care Resolution, Intake Funnel (4 Columns) */}
      <section id="crextio-row-1-grid" className="grid grid-cols-12 gap-3.5 lg:gap-4">
        {/* Card 1: Purity Matters Ministry Brand Card with Live Status Overlay */}
        <div
          id="purity-matters-brand-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl overflow-hidden relative shadow-2xs group h-[215px] xl:h-[225px] flex flex-col justify-end"
        >
          <img
            src="/purity_matters_card.jpg"
            alt="Purity Matters Ministry"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Live Bot Connection Pill */}
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 bg-[#202328]/85 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-white text-[10px] font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telegram Bot Live</span>
          </div>

          {/* Bottom Gradient Overlay with Ministry Details */}
          <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-end justify-between text-white z-10">
            <div>
              <p className="text-xs font-bold text-white drop-shadow-xs">Purity Matters Portal</p>
              <p className="text-[10px] text-white/80 font-medium">{totalClients} Registered Bot Clients</p>
            </div>
            <Link
              href="/clients"
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition-colors"
              title="View Clients"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Weekly Inflow Capsule Bar Chart */}
        <div
          id="crextio-progress-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202328] tracking-tight">Weekly Inflow</h3>
              <Link
                href="/activities"
                className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[#202328] hover:bg-black/5 transition-colors cursor-pointer text-xs"
                title="View Ministry Activity Feed"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-light tracking-tight text-[#202328]">
                {weeklyData.totalWeek}
              </span>
              <span className="text-[11px] text-neutral-500 leading-tight">
                New Intakes
                <br />
                this week
              </span>
            </div>
          </div>

          {/* Weekly Capsule Bars: S M T W T F S */}
          <div className="pt-1">
            <div className="grid grid-cols-7 gap-2 items-end h-20 relative pb-1">
              {weeklyData.counts.map((count, dayIdx) => {
                const isToday = dayIdx === weeklyData.currentDayOfWeek;
                // Height percentage between 18% and 92%
                const heightPct = Math.max(18, Math.round((count / weeklyData.maxCount) * 88));

                return (
                  <div key={`capsule-${dayIdx}`} className="flex flex-col items-center justify-end h-full relative">
                    {/* Floating Pill on Current Day */}
                    {isToday && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#F6CE46] text-[#202328] text-[9px] font-bold whitespace-nowrap shadow-2xs">
                        {weeklyData.todayCount} Today
                      </div>
                    )}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-2.5 rounded-full transition-all duration-500 ${
                        isToday
                          ? "bg-[#F6CE46]"
                          : count > 0
                          ? "bg-[#202328]"
                          : "bg-neutral-200"
                      }`}
                      title={`${dayInitials[dayIdx]}: ${count} inquiries`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-medium text-neutral-400 pt-1 border-t border-black/[0.04]">
              {dayInitials.map((initial, dayIdx) => {
                const isToday = dayIdx === weeklyData.currentDayOfWeek;
                return (
                  <span
                    key={`label-${dayIdx}`}
                    className={isToday ? "font-bold text-[#202328]" : ""}
                  >
                    {initial}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Pastoral Care Resolution Rate Radial Gauge */}
        <div
          id="crextio-time-tracker-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#202328] tracking-tight">Pastoral Care</h3>
            <Link
              href="/counseling"
              className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[#202328] hover:bg-black/5 transition-colors cursor-pointer text-xs"
              title="View Counseling Requests"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
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
                strokeDasharray={strokeDash}
                strokeDashoffset="-20"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold tracking-tight text-[#202328]">{careResolutionRate}%</span>
              <span className="text-[10px] text-neutral-500 font-medium -mt-0.5">
                Care Rate
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#202328]" />
                <span>{completedCareInquiries} Done</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-black/10 text-neutral-600 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs">
                <Clock className="w-2.5 h-2.5 text-neutral-500" />
                <span>{inQueueCareInquiries} In Queue</span>
              </span>
            </div>
            <Link
              href="/counseling"
              className="w-7 h-7 rounded-full bg-[#202328] text-white flex items-center justify-center hover:bg-black shadow-2xs cursor-pointer transition-colors"
              title="Manage Counseling Queue"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Intake & Discipleship Funnel */}
        <div
          id="crextio-onboarding-card"
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px]"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202328] tracking-tight">Intake Funnel</h3>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Profile verification</p>
            </div>
            <span className="text-3xl font-light tracking-tight text-[#202328]">{verifiedRate}%</span>
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium px-1">
              <span title="Verified Telegram phone numbers">{verifiedRate}% Verif</span>
              <span title="Participating in counseling care">{inCareRate}% Care</span>
              <span title="Enrolled in 30-Day Guided Journeys">{onJourneyRate}% Jrn</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className="flex-1 bg-[#F6CE46] text-[#202328] px-2.5 py-2 rounded-xl font-bold text-xs flex items-center justify-between shadow-2xs"
                title={`${verifiedClients} verified clients out of ${totalClients}`}
              >
                <span>Verified</span>
                <span className="text-[11px] bg-white/40 px-1.5 py-0.2 rounded-md">{verifiedClients}</span>
              </div>
              <div
                className="w-16 bg-[#202328] text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center shadow-2xs text-[11px]"
                title={`${counselingCount} clients in pastoral care`}
              >
                {counselingCount} Care
              </div>
              <div
                className="w-12 bg-neutral-300 text-neutral-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center text-[11px]"
                title={`${coursesCount} disciples on journeys`}
              >
                {coursesCount} Jrn
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 2 CARDS: Ministry Service Queues Accordion, Live Anonymous Questions, Signature Dark Task Card (3 Columns) */}
      <section id="crextio-row-2-grid" className="grid grid-cols-12 gap-3.5 lg:gap-4">
        {/* Card 1: Active Ministry Service Queues Accordion */}
        <div
          id="crextio-accordion-card"
          className="col-span-12 lg:col-span-3 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between space-y-2.5 h-[230px] xl:h-[240px] overflow-hidden"
        >
          {/* Accordion Item 1: Pastoral Counselling */}
          <div className="pb-2 border-b border-dashed border-black/10">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "counseling" ? null : "counseling")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <HeartHandshake className="w-3.5 h-3.5 text-[#202328] shrink-0" />
                <span>Pastoral Care</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-bold">
                  {counselingCount} In-Queue
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                    openAccordion === "counseling" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {openAccordion === "counseling" && (
              <div className="flex items-center justify-between pt-1.5 text-[11px] text-neutral-500">
                <span className="truncate">
                  {counselingRequests[0]?.clientName ? `Latest: ${counselingRequests[0].clientName}` : "Sessions active"}
                </span>
                <Link
                  href="/counseling"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Item 2: Inner Healing & Deliverance */}
          <div className="pb-2 border-b border-dashed border-black/10">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "inner-healing" ? null : "inner-healing")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#202328] shrink-0" />
                <span>Inner Healing</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-bold">
                  {innerHealingCount} Active
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                    openAccordion === "inner-healing" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {openAccordion === "inner-healing" && (
              <div className="flex items-center justify-between pt-1.5 text-[11px] text-neutral-500">
                <span className="truncate">
                  {innerHealingRequests[0]?.topic ? `Focus: ${innerHealingRequests[0].topic}` : "Ministry scheduled"}
                </span>
                <Link
                  href="/inner-healing"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Item 3: 30-Day Guided Journeys */}
          <div className="pb-2 border-b border-dashed border-black/10">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "journeys" ? null : "journeys")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 text-[#202328] shrink-0" />
                <span>30-Day Journeys</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-bold">
                  {coursesCount} Disciples
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                    openAccordion === "journeys" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {openAccordion === "journeys" && (
              <div className="flex items-center justify-between pt-1.5 text-[11px] text-neutral-500">
                <span className="truncate">
                  {courseProgressList.filter((c) => c.accountabilityRequested).length} partner pairs requested
                </span>
                <Link
                  href="/courses"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Item 4: Literature & E-Books */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "literature" ? null : "literature")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <ShoppingBag className="w-3.5 h-3.5 text-[#202328] shrink-0" />
                <span>Literature & Books</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-bold">
                  {resourceCount} Catalog
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                    openAccordion === "literature" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {openAccordion === "literature" && (
              <div className="flex items-center justify-between pt-1.5 text-[11px] text-neutral-500">
                <span className="truncate">
                  {resourceOrders.filter((o) => o.paymentStatus === "payment_submitted").length} awaiting audit
                </span>
                <Link
                  href="/resources"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Live Anonymous Questions & Bot Inquiries Card */}
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
                  {pendingQuestionsCount > 0 ? `${pendingQuestionsCount} Pending` : "Bot Inquiries"}
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
            {recentQuestions.length === 0 ? (
              <div className="p-4 rounded-xl bg-neutral-50 border border-black/[0.06] text-center text-xs text-neutral-500">
                <p className="font-semibold text-[#202328]">No Anonymous Inquiries</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Questions submitted confidentially via the Telegram bot will appear here.
                </p>
              </div>
            ) : (
              recentQuestions.map((q) => {
                const isAnswered = q.status === "answered";
                return (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.06] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#202328]">
                          {q.referenceNumber}
                        </span>
                        <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-medium truncate max-w-[140px]">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#202328] font-medium truncate mt-0.5">
                        "{q.question}"
                      </p>
                    </div>
                    {isAnswered ? (
                      <span className="shrink-0 bg-[#F6CE46]/30 border border-[#F6CE46]/50 text-[#202328] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Answered
                      </span>
                    ) : (
                      <span className="shrink-0 bg-neutral-100 border border-black/10 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })
            )}
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

        {/* Card 3: Priority Pastoral Queue Signature Dark Charcoal Card */}
        <div
          id="crextio-dark-task-card"
          className="col-span-12 lg:col-span-3 bg-[#202328] text-white rounded-2xl p-4 xl:p-5 shadow-md flex flex-col justify-between h-[230px] xl:h-[240px]"
        >
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-semibold text-white/90 tracking-tight">
              Pastoral Priority Queue
            </h3>
            <span className="text-xl font-light text-white tracking-tight">
              {completedActionsCount}/{priorityActionItems.length}
            </span>
          </div>

          <div className="space-y-2 pt-0.5">
            {priorityActionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between hover:bg-white/5 p-1 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-white/80" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white leading-tight truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-white/50 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.isCompleted ? (
                    <div className="w-4 h-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center text-[10px] font-bold shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 group-hover:border-[#F6CE46] transition-colors" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
