"use client";

import React from "react";

export interface DistributionItem {
  label: string;
  count?: number;
  percentage: number;
}

interface DistributionBarListProps {
  title: string;
  badge?: string;
  items: DistributionItem[];
  colorClass?: string;
}

export function DistributionBarList({
  title,
  badge,
  items,
  colorClass = "bg-[#28211D]",
}: DistributionBarListProps) {
  const barColor = colorClass;
  return (
    <div className="bg-white/90 rounded-2xl border border-black/[0.06] p-4 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#202328] tracking-tight">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold text-[#202328] bg-[#F6CE46] px-2 py-0.5 rounded-2xl shadow-2xs">
            {badge}
          </span>
        )}
      </div>

      {/* Horizontal Bar Items */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const barWidth = Math.max(item.percentage > 0 ? item.percentage : 0, item.percentage > 0 ? 16 : 4);

          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              {/* Category Label */}
              <div className="w-24 shrink-0 text-[#202328]/60 text-[11px] font-medium truncate">
                {item.label}
              </div>

              {/* Progress Bar Container */}
              <div className="flex-1 bg-[#202328]/6 rounded-2xl h-6 overflow-hidden relative flex items-center">
                <div
                  className={`h-full rounded-2xl flex items-center justify-end px-2 text-[10px] font-bold text-white shadow-2xs transition-all duration-500 ${barColor}`}
                  style={{ width: `${barWidth}%` }}
                >
                  {item.percentage > 0 && `${item.percentage.toFixed(1)}%`}
                </div>
                {item.percentage === 0 && (
                  <span className="text-[10px] font-medium text-[#202328]/40 pl-2">0%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
