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
    <div className="bg-[#FEFDFE] rounded-2xl border border-[#28211D]/10 p-4 shadow-2xs space-y-4">
      {/* Primary Stat Block */}
      <div>
        <div className="text-xs font-medium text-[#28211D]/60 mb-1.5">{primary.label}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[#28211D] font-sans">
              {primary.value}
            </span>
            {primary.unit && (
              <span className="text-xs font-semibold text-[#28211D]/60">{primary.unit}</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-2xl bg-[#EDD338]/20 flex items-center justify-center text-[#A68D20]">
            <PrimaryIcon className="w-4 h-4" />
          </div>
        </div>
        {primary.sublabel && (
          <div className="text-[11px] text-[#28211D]/45 mt-1">{primary.sublabel}</div>
        )}
      </div>

      <div className="border-t border-[#28211D]/8" />

      {/* Secondary Stat Block */}
      <div>
        <div className="text-xs font-medium text-[#28211D]/60 mb-1.5">{secondary.label}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[#28211D] font-sans">
              {secondary.value}
            </span>
            {secondary.unit && (
              <span className="text-xs font-semibold text-[#28211D]/60">{secondary.unit}</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-2xl bg-[#28211D]/5 flex items-center justify-center text-[#28211D]/70">
            <SecondaryIcon className="w-4 h-4" />
          </div>
        </div>
        {secondary.sublabel && (
          <div className="text-[11px] text-[#28211D]/45 mt-1">{secondary.sublabel}</div>
        )}
      </div>
    </div>
  );
}
