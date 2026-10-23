"use client";

import React, { useState, useRef, useEffect, useId, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomDropdownProps {
  id?: string;
  value?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  align?: "left" | "right";
  size?: "sm" | "default";
  variant?: "pill" | "rounded" | "outline" | "compact";
}

interface Coords {
  top?: number;
  bottom?: number;
  left?: number;
  width?: number;
}

export function CustomDropdown({
  id,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  triggerClassName = "",
  contentClassName = "",
  disabled = false,
  align = "left",
  size = "default",
  variant = "pill",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords>({});
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const generatedId = useId();
  const dropdownId = id || `dropdown-${generatedId}`;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute fixed coordinates relative to viewport
  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 210 && rect.top > spaceBelow;

    const width = Math.max(rect.width, 160);
    let left: number | undefined = rect.left;

    if (align === "right" || (left + width > window.innerWidth - 8)) {
      if (rect.right - width >= 8) {
        left = rect.right - width;
      } else {
        left = Math.max(8, window.innerWidth - width - 8);
      }
    }

    setCoords({
      top: showAbove ? undefined : rect.bottom + 4,
      bottom: showAbove ? window.innerHeight - rect.top + 4 : undefined,
      left,
      width,
    });
  };

  // Update coordinates whenever dropdown opens or window scrolls/resizes
  useLayoutEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, align]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const sizeClasses =
    size === "sm"
      ? "h-8 px-2.5 text-[11px]"
      : "h-9 px-3.5 text-xs";

  const roundedClasses =
    variant === "pill"
      ? "rounded-full"
      : variant === "rounded"
      ? "rounded-xl"
      : variant === "compact"
      ? "rounded-lg"
      : "rounded-xl";

  const menuDropdown = (
    <div
      ref={menuRef}
      role="listbox"
      id={`${dropdownId}-menu`}
      style={{
        position: "fixed",
        top: coords.top !== undefined ? `${coords.top}px` : "auto",
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : "auto",
        left: coords.left !== undefined ? `${coords.left}px` : "auto",
        minWidth: coords.width ? `${coords.width}px` : "160px",
        maxWidth: "min(340px, 92vw)",
        zIndex: 99999,
      }}
      className={`max-h-64 overflow-y-auto rounded-xl bg-white border border-black/15 p-1.5 shadow-2xl shadow-black/25 duration-100 animate-in fade-in-0 zoom-in-95 ${contentClassName}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={option.disabled}
            onClick={() => handleSelect(option)}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer select-none my-0.5 ${
              option.disabled
                ? "opacity-40 cursor-not-allowed"
                : isSelected
                ? "bg-[#202328] text-white font-semibold"
                : "text-[#202328] hover:bg-neutral-100 font-medium"
            }`}
          >
            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
              {option.icon && (
                <span
                  className={`shrink-0 flex items-center justify-center ${
                    isSelected ? "text-[#F6CE46]" : "text-neutral-500"
                  }`}
                >
                  {option.icon}
                </span>
              )}
              <span className="truncate">{option.label}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {option.badge && <span>{option.badge}</span>}
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-[#F6CE46] shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      id={`${dropdownId}-container`}
      className={`relative inline-block ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        id={dropdownId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            updateCoords();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full flex items-center justify-between gap-2 font-medium transition-all cursor-pointer border select-none outline-none focus:ring-1 focus:ring-[#202328] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${roundedClasses} ${
          triggerClassName
            ? triggerClassName
            : "bg-white/80 hover:bg-white text-[#202328] border-black/10 shadow-2xs"
        }`}
      >
        <span className="flex items-center gap-1.5 truncate text-left flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center justify-center">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 ml-1">
              {selectedOption.badge}
            </span>
          )}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#202328]" : ""
          }`}
        />
      </button>

      {/* Render via Portal to document.body to avoid being clipped by parent overflow-hidden or overflow-x-auto */}
      {mounted && isOpen && createPortal(menuDropdown, document.body)}
    </div>
  );
}
