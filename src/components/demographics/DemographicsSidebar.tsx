"use client";

import React from "react";
import {
  MapPin,
  Users,
  ShieldCheck,
  HeartHandshake,
  Phone,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DemographicStatCard } from "./DemographicStatCard";
import { SegmentedRatioBar } from "./SegmentedRatioBar";
import { DistributionBarList } from "./DistributionBarList";
import { DemographicDonutCard } from "./DemographicDonutCard";

interface DemographicsSidebarProps {
  isLoading: boolean;
  totalClients: number;
  verifiedClients: number;
  ethiopianClients: number;
  diasporaClients: number;
  unsharedClients: number;
  amharicClients: number;
  englishClients: number;
  oromoClients: number;
  otherLangClients: number;
  adminRoles: number;
  counselorRoles: number;
  counselingCount: number;
  innerHealingCount: number;
  coursesCount: number;
  resourceCount: number;
  clientFilter: string;
  onFilterChange: (filter: string) => void;
  onSelectTab: (tab: string) => void;
  className?: string;
}

export function DemographicsSidebar({
  isLoading,
  totalClients,
  verifiedClients,
  ethiopianClients,
  diasporaClients,
  unsharedClients,
  amharicClients,
  englishClients,
  oromoClients,
  otherLangClients,
  adminRoles,
  counselorRoles,
  counselingCount,
  innerHealingCount,
  coursesCount,
  resourceCount,
  clientFilter,
  onFilterChange,
  onSelectTab,
  className,
}: DemographicsSidebarProps) {
  const calcPct = (val: number) =>
    totalClients > 0 ? Math.round((val / totalClients) * 100) : 0;

  const totalInquiries = counselingCount + innerHealingCount;
  const avgInquiries =
    totalClients > 0 ? (totalInquiries / totalClients).toFixed(1) : "0";

  return (
    <aside
      id="demographics-sidebar"
      className={
        className ||
        "hidden lg:block w-full lg:w-[380px] xl:w-[420px] 2xl:w-[460px] shrink-0 bg-white/80 backdrop-blur-md border-b lg:border-b-0 lg:border-l border-black/[0.08] p-5 xl:p-6 space-y-5 h-full overflow-y-auto"
      }
    >
      {/* 1. REGION / LOCATION HEADER MATCHING SCREENSHOT */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-[#F6CE46]/25 border border-[#F6CE46]/40 flex items-center justify-center text-[#202328]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Ethiopia & Diaspora</span>
            </h2>
            <p className="text-[11px] text-[#202328]/60">Audience Demographics</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] bg-[#202328]/5 border-black/[0.08] text-[#202328] font-bold"
        >
          {isLoading ? "..." : `${totalClients} Users`}
        </Badge>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#28211D]/45 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#A68D20] mx-auto" />
          <p className="text-xs">Loading audience demographics...</p>
        </div>
      ) : totalClients === 0 ? (
        <div className="p-4 bg-[#FFFFFD] border border-[#28211D]/10 rounded-2xl text-center text-xs text-[#28211D]/60 space-y-1">
          <p className="font-semibold text-[#28211D]">No Audience Records Yet</p>
          <p className="text-[11px] text-[#28211D]/45">
            Demographic charts and ratios will populate automatically as users join the bot.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 2. TOTAL POPULATION & VERIFIED REACH (2-IN-1 METRIC CARD) */}
          <DemographicStatCard
            primary={{
              label: "Total Population",
              value: totalClients,
              unit: "Clients",
              icon: Users,
              sublabel: "Registered bot community",
            }}
            secondary={{
              label: "Verified Contact Reach",
              value: `${calcPct(verifiedClients)}%`,
              unit: `(${verifiedClients})`,
              icon: ShieldCheck,
              sublabel: "Verified Telegram phone",
            }}
          />

          {/* 3. GENDER / REGION RATIO BAR */}
          <SegmentedRatioBar
            title="Geographic Origin"
            segments={[
              {
                label: "Ethiopia",
                percentage: calcPct(ethiopianClients),
                colorClass: "bg-[#EDD338]",
              },
              {
                label: "Diaspora",
                percentage: calcPct(diasporaClients),
                colorClass: "bg-[#28211D]",
              },
              {
                label: "Other",
                percentage: calcPct(unsharedClients),
                colorClass: "bg-[#28211D]/20",
              },
            ]}
          />

          {/* 4. MARITAL STATUS / ROLE RATIO BAR */}
          <SegmentedRatioBar
            title="Member Roles"
            segments={[
              {
                label: "Clients",
                percentage: calcPct(totalClients - counselorRoles - adminRoles),
                colorClass: "bg-[#28211D]",
              },
              {
                label: "Counselors",
                percentage: calcPct(counselorRoles),
                colorClass: "bg-[#EDD338]",
              },
              {
                label: "Admins",
                percentage: calcPct(adminRoles),
                colorClass: "bg-[#28211D]/40",
              },
            ]}
          />

          {/* 5. AGE GROUP / LANGUAGE DISTRIBUTION (HORIZONTAL BARS) */}
          <DistributionBarList
            title="Language Preference"
            badge={`Top: ${amharicClients >= englishClients ? "Amharic" : "English"}`}
            items={[
              { label: "Amharic (am)", percentage: calcPct(amharicClients), count: amharicClients },
              { label: "English (en)", percentage: calcPct(englishClients), count: englishClients },
              { label: "Afaan Oromo", percentage: calcPct(oromoClients), count: oromoClients },
              { label: "Other / Def", percentage: calcPct(otherLangClients), count: otherLangClients },
            ]}
            colorClass="bg-[#28211D]"
          />

          {/* 6. INCOME GROUP / MINISTRY CARE INVOLVEMENT (HORIZONTAL BARS) */}
          <DistributionBarList
            title="Service Engagement"
            badge={`${totalInquiries} Inquiries`}
            items={[
              { label: "Counselling", percentage: calcPct(counselingCount), count: counselingCount },
              { label: "Inner Healing", percentage: calcPct(innerHealingCount), count: innerHealingCount },
              { label: "Course Journeys", percentage: calcPct(coursesCount), count: coursesCount },
              { label: "Digital Store", percentage: calcPct(resourceCount), count: resourceCount },
            ]}
            colorClass="bg-[#A68D20]"
          />

          {/* 7. AVERAGE HOUSEHOLD METRICS (AVG INQUIRIES & PHONE SHARE) */}
          <DemographicStatCard
            primary={{
              label: "Avg. Care Inquiries",
              value: avgInquiries,
              unit: "Sessions",
              icon: HeartHandshake,
              sublabel: "Intakes per active client",
            }}
            secondary={{
              label: "Phone Contact Rate",
              value: `${calcPct(verifiedClients)}%`,
              unit: "Verified",
              icon: Phone,
              sublabel: "Direct pastoral reach",
            }}
          />

          {/* 8. HOME OWNERSHIP / AUDIENCE DONUT CHART WITH LEGEND */}
          <DemographicDonutCard
            title="Audience Regional Distribution"
            segments={[
              {
                label: "Ethiopia (+251)",
                count: ethiopianClients,
                percentage: calcPct(ethiopianClients),
                colorHex: "#EDD338",
                bgClass: "bg-[#EDD338]",
              },
              {
                label: "Diaspora / Global",
                count: diasporaClients,
                percentage: calcPct(diasporaClients),
                colorHex: "#28211D",
                bgClass: "bg-[#28211D]",
              },
              {
                label: "Unshared",
                count: unsharedClients,
                percentage: calcPct(unsharedClients),
                colorHex: "rgba(40, 33, 29, 0.18)",
                bgClass: "bg-[#28211D]/20",
              },
            ]}
          />

          {/* 9. QUICK DEMOGRAPHIC FILTERS */}
          <div className="pt-2 border-t border-black/[0.06] space-y-2">
            <span className="font-semibold text-[#202328] flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#202328]/60" />
              Quick Demographic Filter
            </span>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: `All (${totalClients})` },
                { id: "ethiopia", label: `Ethiopia (${ethiopianClients})` },
                { id: "diaspora", label: `Diaspora (${diasporaClients})` },
                { id: "verified", label: `Verified (${verifiedClients})` },
                { id: "admin", label: `Admins (${adminRoles})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    onSelectTab("clients");
                    onFilterChange(btn.id);
                  }}
                  className={`px-2.5 py-1 text-[11px] rounded-2xl font-medium transition-colors cursor-pointer ${
                    clientFilter === btn.id
                      ? "bg-[#F6CE46] text-[#202328] font-bold shadow-2xs"
                      : "bg-[#202328]/5 text-[#202328] hover:bg-[#202328]/10"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
