"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  ChevronDown,
  Sparkles,
  HeartHandshake,
  BookOpen,
  ShoppingBag,
  Users,
  CheckCircle2,
  HelpCircle,
  Check,
  MessageSquare,
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

  // 4. Anonymous Questions metrics & pending inquiries list (Uncluttered, questions only)
  const pendingQuestionsCount = useMemo(() => {
    return anonymousQuestions.filter((q) => q.status === "pending").length;
  }, [anonymousQuestions]);

  const pendingInquiries = useMemo(() => {
    return anonymousQuestions.filter((q) => q.status === "pending");
  }, [anonymousQuestions]);

  // 5. Intelligent Priority Action Queue (Renamed to Priority Queue, grows with content, completed within 24h auto-removed)
  const isWithin24Hours = (dateStr: string | undefined | null): boolean => {
    if (!dateStr) return false;
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      return Date.now() - parsed <= 24 * 60 * 60 * 1000;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return Date.now() - d.getTime() <= 24 * 60 * 60 * 1000;
    }
    return false;
  };

  const priorityActionItems = useMemo(() => {
    interface PriorityItem {
      id: string;
      icon: React.ElementType;
      title: string;
      subtitle: string;
      isCompleted: boolean;
      href: string;
    }

    const pendingList: PriorityItem[] = [];
    const completedRecentList: PriorityItem[] = [];

    // Category 1: Anonymous Questions
    anonymousQuestions
      .filter((q) => q.status === "pending")
      .slice(0, 3)
      .forEach((q) => {
        pendingList.push({
          id: `aq-${q.id}`,
          icon: HelpCircle,
          title: `Reply to ${q.referenceNumber}`,
          subtitle: q.category || "Anonymous Inquiry",
          isCompleted: false,
          href: "/anonymous-questions",
        });
      });

    anonymousQuestions
      .filter((q) => q.status === "answered" && isWithin24Hours(q.answeredAt || q.submittedAt))
      .slice(0, 2)
      .forEach((q) => {
        completedRecentList.push({
          id: `aq-done-${q.id}`,
          icon: HelpCircle,
          title: `Answered ${q.referenceNumber}`,
          subtitle: `${q.category || "Inquiry"} • Completed`,
          isCompleted: true,
          href: "/anonymous-questions",
        });
      });

    // Category 2: Counseling Intake Requests
    counselingRequests
      .filter((c) => c.status === "pending" || c.status === "assigned")
      .slice(0, 3)
      .forEach((c) => {
        pendingList.push({
          id: `counseling-${c.id}`,
          icon: HeartHandshake,
          title: `Intake: ${c.clientName}`,
          subtitle: c.concern || "Pastoral Session",
          isCompleted: false,
          href: "/counselling",
        });
      });

    counselingRequests
      .filter((c) => c.status === "completed" && isWithin24Hours(c.scheduledAt || c.createdAt))
      .slice(0, 2)
      .forEach((c) => {
        completedRecentList.push({
          id: `counseling-done-${c.id}`,
          icon: HeartHandshake,
          title: `Care Completed: ${c.clientName}`,
          subtitle: `${c.concern || "Counseling"} • Completed`,
          isCompleted: true,
          href: "/counselling",
        });
      });

    // Category 3: Inner Healing Sessions
    innerHealingRequests
      .filter((i) => i.status === "pending")
      .slice(0, 2)
      .forEach((i) => {
        pendingList.push({
          id: `healing-${i.id}`,
          icon: Sparkles,
          title: `Healing: ${i.clientName}`,
          subtitle: i.topic || "Spiritual Deliverance",
          isCompleted: false,
          href: "/inner-healing",
        });
      });

    innerHealingRequests
      .filter((i) => i.status === "completed" && isWithin24Hours(i.createdAt))
      .slice(0, 2)
      .forEach((i) => {
        completedRecentList.push({
          id: `healing-done-${i.id}`,
          icon: Sparkles,
          title: `Healing Done: ${i.clientName}`,
          subtitle: `${i.topic || "Deliverance"} • Completed`,
          isCompleted: true,
          href: "/inner-healing",
        });
      });

    // Category 4: Literature & Book Orders
    resourceOrders
      .filter((o) => o.paymentStatus === "payment_submitted")
      .slice(0, 2)
      .forEach((o) => {
        pendingList.push({
          id: `order-${o.id}`,
          icon: ShoppingBag,
          title: `Verify ${o.orderNumber || "Order #" + o.id}`,
          subtitle: `${o.resourceTitle} (${o.currency} ${o.amount})`,
          isCompleted: false,
          href: "/resources",
        });
      });

    resourceOrders
      .filter((o) => (o.paymentStatus === "verified" || o.fulfillmentStatus === "delivered") && isWithin24Hours(o.verifiedAt || o.createdAt))
      .slice(0, 2)
      .forEach((o) => {
        completedRecentList.push({
          id: `order-done-${o.id}`,
          icon: ShoppingBag,
          title: `Dispatched: ${o.orderNumber || "#" + o.id}`,
          subtitle: `${o.resourceTitle} • Completed`,
          isCompleted: true,
          href: "/resources",
        });
      });

    // Category 5: Accountability Partner Requests
    courseProgressList
      .filter((c) => c.accountabilityRequested)
      .slice(0, 2)
      .forEach((c) => {
        pendingList.push({
          id: `partner-${c.id}`,
          icon: Users,
          title: `Pair Partner: ${c.clientName}`,
          subtitle: `${c.courseTitle} (Day ${c.currentDay})`,
          isCompleted: false,
          href: "/courses",
        });
      });

    // Return combined: pending items first, followed by items completed within 24hr
    return [...pendingList, ...completedRecentList];
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
    <div
      id="overview-widgets-container"
      className="w-full grid grid-cols-12 lg:grid-rows-[225px_minmax(290px,auto)] gap-3.5 lg:gap-4 pr-0 lg:pr-1"
    >
      {/* =========================================================================
          ROW 1 (Desktop) / Mobile Secondary Order (Cards 4-7 on Mobile):
          Brand Card, Weekly Inflow, Care Resolution, Intake Funnel
          ========================================================================= */}

      {/* Card 1: Purity Matters Ministry Brand Cover (Top card on Mobile!) */}
      <div
        id="purity-matters-brand-card"
        className="col-span-12 sm:col-span-6 lg:col-span-3 lg:row-start-1 bg-white/90 border border-black/[0.06] rounded-2xl overflow-hidden relative shadow-2xs group h-[215px] xl:h-[225px] flex flex-col justify-end order-1 lg:order-none"
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
        className="col-span-12 sm:col-span-6 lg:col-span-3 lg:row-start-1 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px] order-6 lg:order-none"
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
              const heightPct = Math.max(18, Math.round((count / weeklyData.maxCount) * 88));

              return (
                <div key={`capsule-${dayIdx}`} className="flex flex-col items-center justify-end h-full relative">
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
        className="col-span-12 sm:col-span-6 lg:col-span-3 lg:row-start-1 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px] order-5 lg:order-none"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202328] tracking-tight">Pastoral Care</h3>
          <Link
            href="/counselling"
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
            href="/counselling"
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
        className="col-span-12 sm:col-span-6 lg:col-span-3 lg:row-start-1 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between h-[215px] xl:h-[225px] order-7 lg:order-none"
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

      {/* =========================================================================
          ROW 2 (Desktop): Fills Remaining Space Below
          MOBILE PRIMARY ORDER (Order 1, 2, 3 on Mobile):
          1. Anonymous Questions (First below banner on mobile!)
          2. Priority Queue (Second on mobile, renamed, grows with content!)
          3. Pastoral Care Queues Accordion (Third on mobile!)
          ========================================================================= */}

      {/* CARD 6 / MOBILE ORDER 2: Live Anonymous Inquiries Card (Uncluttered, questions only) */}
      <div
        id="crextio-anonymous-questions-card"
        className="col-span-12 lg:col-span-6 lg:row-start-2 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between min-h-[290px] lg:h-full lg:min-h-0 order-2 lg:order-none"
      >
        <div className="shrink-0 pb-2.5 border-b border-black/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#202328] tracking-tight">
                Anonymous Questions
              </h3>
              {pendingQuestionsCount > 0 ? (
                <span className="bg-[#202328] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingQuestionsCount} Pending
                </span>
              ) : (
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  All Addressed
                </span>
              )}
            </div>

            <Link
              href="/anonymous-questions"
              className="text-xs font-semibold text-[#202328] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Confidential questions submitted by Telegram community members
          </p>
        </div>

        {/* Scrollable Questions List (Uncluttered, questions only - answers not displayed) */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2.5 space-y-2">
          {pendingInquiries.length === 0 ? (
            <div className="p-5 rounded-xl bg-neutral-50 border border-black/[0.06] text-center text-xs text-neutral-500 my-auto">
              <MessageSquare className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
              <p className="font-semibold text-[#202328]">No Pending Inquiries</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Questions submitted confidentially via the Telegram bot will appear here live.
              </p>
            </div>
          ) : (
            pendingInquiries.map((q) => (
              <div
                key={q.id}
                className="p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100/80 border border-black/[0.06] transition-colors"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#202328]">
                        {q.referenceNumber}
                      </span>
                      <span className="text-[10px] bg-[#202328]/5 px-2 py-0.5 rounded-full text-neutral-600 font-medium truncate max-w-[150px]">
                        {q.category}
                      </span>
                      {q.submittedAt && (
                        <span className="text-[9px] text-neutral-400">
                          {q.submittedAt}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#202328] font-medium mt-1 line-clamp-2">
                      &ldquo;{q.question}&rdquo;
                    </p>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>Pending</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-neutral-400">
          <span>Identity strictly confidential via Telegram</span>
          <Link
            href="/anonymous-questions"
            className="text-[#202328] font-bold hover:underline cursor-pointer"
          >
            Respond to Inquiries &rarr;
          </Link>
        </div>
      </div>

      {/* CARD 7 / MOBILE ORDER 3: Priority Queue (Signature Dark Charcoal Card - Grows with Content, 24h Removal) */}
      <div
        id="crextio-dark-task-card"
        className="col-span-12 lg:col-span-3 lg:row-start-2 bg-[#202328] text-white rounded-2xl p-4 xl:p-5 shadow-md flex flex-col justify-between min-h-[290px] lg:h-full lg:min-h-0 order-3 lg:order-none"
      >
        <div className="shrink-0 flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Priority Queue
            </h3>
          </div>
          {priorityActionItems.length > 0 ? (
            <span className="text-xs font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
              {completedActionsCount}/{priorityActionItems.length} Resolved
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>All Clear</span>
            </span>
          )}
        </div>

        {/* Dynamic Growing Queue Content */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2.5 space-y-2">
          {priorityActionItems.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center my-auto">
              <div className="w-8 h-8 rounded-full bg-[#F6CE46]/20 text-[#F6CE46] flex items-center justify-center mb-2">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-white">Priority Queue All Clear</p>
              <p className="text-[10px] text-white/50 mt-1 max-w-[200px] leading-snug">
                All inquiries, intakes, and deliveries are handled. Completed items are automatically pruned after 24h.
              </p>
            </div>
          ) : (
            priorityActionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between hover:bg-white/10 p-2 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.isCompleted ? "bg-[#F6CE46]/20 text-[#F6CE46]" : "bg-white/10 text-white/90"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white leading-tight truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-white/50 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.isCompleted ? (
                    <div
                      className="w-4 h-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs"
                      title="Completed in last 24h"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/30 shrink-0 group-hover:border-[#F6CE46] transition-colors" />
                  )}
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Note explaining 24h auto-pruning */}
        <div className="shrink-0 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
          <span>Auto-clears completed items after 24h</span>
          <span className="text-[#F6CE46] font-semibold">Live Queue</span>
        </div>
      </div>

      {/* CARD 5 / MOBILE ORDER 4: Active Ministry Service Queues Accordion */}
      <div
        id="crextio-accordion-card"
        className="col-span-12 lg:col-span-3 lg:row-start-2 bg-white/90 border border-black/[0.06] rounded-2xl p-4 xl:p-5 shadow-2xs flex flex-col justify-between min-h-[290px] lg:h-full lg:min-h-0 order-4 lg:order-none"
      >
        <div className="shrink-0 flex items-center justify-between pb-2 border-b border-black/[0.06]">
          <h3 className="text-sm font-bold text-[#202328] tracking-tight">
            Pastoral Care Queues
          </h3>
          <span className="text-[10px] font-bold text-neutral-500 bg-black/5 px-2 py-0.5 rounded-full">
            Intake Streams
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2 space-y-2">
          {/* Accordion Item 1: Pastoral Counselling */}
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04]">
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
              <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-black/[0.04] text-[11px] text-neutral-500">
                <span className="truncate">
                  {counselingRequests[0]?.clientName ? `Latest: ${counselingRequests[0].clientName}` : "Sessions active"}
                </span>
                <Link
                  href="/counselling"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Item 2: Inner Healing & Deliverance */}
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04]">
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
              <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-black/[0.04] text-[11px] text-neutral-500">
                <span className="truncate">
                  {innerHealingRequests[0]?.topic ? `Focus: ${innerHealingRequests[0].topic}` : "Ministry scheduled"}
                </span>
                <Link
                  href="/inner-healing"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Item 3: 30-Day Guided Journeys */}
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04]">
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
              <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-black/[0.04] text-[11px] text-neutral-500">
                <span className="truncate">
                  {courseProgressList.filter((c) => c.accountabilityRequested).length} partner pairs requested
                </span>
                <Link
                  href="/courses"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Item 4: Literature & E-Books */}
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04]">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === "literature" ? null : "literature")
              }
              className="w-full flex items-center justify-between text-xs font-semibold text-[#202328] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <ShoppingBag className="w-3.5 h-3.5 text-[#202328] shrink-0" />
                <span>Literature &amp; Books</span>
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
              <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-black/[0.04] text-[11px] text-neutral-500">
                <span className="truncate">
                  {resourceOrders.filter((o) => o.paymentStatus === "payment_submitted").length} awaiting audit
                </span>
                <Link
                  href="/resources"
                  className="text-[#202328] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-neutral-400">
          <span>Active ministry pipelines</span>
          <Link
            href="/counselling"
            className="text-[#202328] font-bold hover:underline cursor-pointer"
          >
            Manage Care &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
