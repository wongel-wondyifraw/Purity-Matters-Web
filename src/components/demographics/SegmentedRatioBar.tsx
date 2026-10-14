"use client";

import React from "react";

export interface SegmentItem {
  label: string;
  percentage: number;
  colorClass: string;
}

interface SegmentedRatioBarProps {
  title: string;
  segments: SegmentItem[];
}

export function SegmentedRatioBar({ title, segments }: SegmentedRatioBarProps) {
  const total = segments.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <div className="bg-white/90 rounded-2xl border border-black/[0.06] p-4 shadow-2xs space-y-3">
      {/* Title */}
      <div className="text-xs font-semibold text-[#202328] tracking-tight">
        {title}
      </div>

      {/* Segmented Solid Ratio Bar */}
      <div className="w-full bg-[#202328]/8 rounded-full h-3 overflow-hidden flex p-[1.5px] gap-0.5">
        {segments.map((seg, idx) => {
          const widthPct = total > 0 ? (seg.percentage / total) * 100 : 0;
          if (widthPct === 0) return null;
          return (
            <div
              key={idx}
              className={`h-full rounded-full transition-all duration-500 ${seg.colorClass}`}
              style={{ width: `${widthPct}%` }}
              title={`${seg.label}: ${seg.percentage}%`}
            />
          );
        })}
      </div>

      {/* Bottom Labels & Percentages Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-center">
        {segments.map((seg, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="text-[11px] text-[#202328]/60 truncate font-medium">
              {seg.label}
            </div>
            <div className="text-xs font-extrabold text-[#202328]">
              {seg.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
