"use client";

import React from "react";

export interface DonutSegment {
  label: string;
  count: number;
  percentage: number;
  colorHex: string;
  bgClass: string;
}

interface DemographicDonutCardProps {
  title: string;
  segments: DonutSegment[];
}

export function DemographicDonutCard({ title, segments }: DemographicDonutCardProps) {
  const radius = 38;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="bg-[#FEFDFE] rounded-2xl border border-[#28211D]/10 p-4 shadow-2xs space-y-3">
      {/* Title */}
      <div className="text-xs font-semibold text-[#28211D] tracking-tight">
        {title}
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Legend */}
        <div className="space-y-2 text-xs flex-1">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className={`w-3 h-3 rounded-2xl shrink-0 ${seg.bgClass}`} />
                <span className="text-[11px] font-medium text-[#28211D]/70 truncate">{seg.label}</span>
              </div>
              <span className="text-xs font-bold text-[#28211D]">
                {seg.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        {/* Right Side: Donut SVG */}
        <div className="relative shrink-0 flex items-center justify-center w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-24 h-24 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(40, 33, 29, 0.06)"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((seg, idx) => {
              const dash = (seg.percentage / 100) * circumference;
              const currentOffset = accumulatedOffset;
              accumulatedOffset -= dash;

              if (seg.percentage <= 0) return null;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={seg.colorHex}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={currentOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
