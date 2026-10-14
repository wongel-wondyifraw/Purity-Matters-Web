"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  sublabel?: string;
}

interface DemographicStatCardProps {
  primary: StatItem;
  secondary: StatItem;
}

export function DemographicStatCard({ primary, secondary }: DemographicStatCardProps) {
  const PrimaryIcon = primary.icon;
  const SecondaryIcon = secondary.icon;

  return (
    <div className="bg-white/90 rounded-2xl border border-black/[0.06] p-4 shadow-2xs space-y-4">
      {/* Primary Stat Block */}
      <div>
        <div className="text-xs font-medium text-[#202328]/60 mb-1.5">{primary.label}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[#202328] font-sans">
              {primary.value}
            </span>
            {primary.unit && (
              <span className="text-xs font-semibold text-[#202328]/60">{primary.unit}</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-2xl bg-[#F6CE46]/25 flex items-center justify-center text-[#D4A818]">
            <PrimaryIcon className="w-4 h-4" />
          </div>
        </div>
        {primary.sublabel && (
          <div className="text-[11px] text-[#202328]/45 mt-1">{primary.sublabel}</div>
        )}
      </div>

      <div className="border-t border-black/[0.06]" />

      {/* Secondary Stat Block */}
      <div>
        <div className="text-xs font-medium text-[#202328]/60 mb-1.5">{secondary.label}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[#202328] font-sans">
              {secondary.value}
            </span>
            {secondary.unit && (
              <span className="text-xs font-semibold text-[#202328]/60">{secondary.unit}</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-2xl bg-[#202328]/5 flex items-center justify-center text-[#202328]/70">
            <SecondaryIcon className="w-4 h-4" />
          </div>
        </div>
        {secondary.sublabel && (
          <div className="text-[11px] text-[#202328]/45 mt-1">{secondary.sublabel}</div>
        )}
      </div>
    </div>
  );
}
