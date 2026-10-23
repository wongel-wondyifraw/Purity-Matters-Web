"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = "items",
  className = "",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, currentPage * pageSize);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  // Generate visible page numbers (smart ellipsis for desktop)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`shrink-0 px-4 py-2.5 border-t border-black/[0.06] bg-white/70 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs select-none touch-manipulation ${className}`}
    >
      {/* Left: Summary text & page size selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="text-neutral-500 font-medium">
          Showing <span className="font-bold text-[#202328]">{startIndex}</span>–
          <span className="font-bold text-[#202328]">{endIndex}</span> of{" "}
          <span className="font-bold text-[#202328]">{totalItems}</span> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-neutral-400 hidden md:inline">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-neutral-100 hover:bg-neutral-200/80 border border-black/10 rounded-lg px-2 py-1 text-xs font-semibold text-[#202328] cursor-pointer outline-none transition-colors"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
          className="w-8 h-8 rounded-lg border border-black/10 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#202328] transition-all cursor-pointer active:scale-95"
          aria-label="First Page"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className="h-8 px-2.5 rounded-lg border border-black/10 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-[#202328] font-medium transition-all cursor-pointer active:scale-95"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Prev</span>
        </button>

        {/* Page pills for desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                  page === currentPage
                    ? "bg-[#202328] text-[#F6CE46] shadow-xs"
                    : "border border-black/10 bg-white text-[#202328] hover:bg-neutral-100"
                }`}
              >
                <span>{page}</span>
              </button>
            ) : (
              <span key={`ellip-${idx}`} className="w-5 text-center text-neutral-400 font-bold">
                ...
              </span>
            )
          )}
        </div>

        {/* Compact page indicator for mobile */}
        <div className="sm:hidden px-3 py-1 bg-neutral-100 rounded-lg text-xs font-bold text-[#202328]">
          <span>{currentPage}</span> / <span>{totalPages}</span>
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          className="h-8 px-2.5 rounded-lg border border-black/10 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-[#202328] font-medium transition-all cursor-pointer active:scale-95"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline text-xs">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNext}
          className="w-8 h-8 rounded-lg border border-black/10 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#202328] transition-all cursor-pointer active:scale-95"
          aria-label="Last Page"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
