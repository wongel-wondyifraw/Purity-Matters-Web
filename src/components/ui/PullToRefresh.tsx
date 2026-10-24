"use client";

import React, { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { RefreshCw, ArrowDown, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  children: ReactNode;
  className?: string;
  threshold?: number;
  maxPull?: number;
}

export function PullToRefresh({
  onRefresh,
  isRefreshing = false,
  children,
  className = "",
  threshold = 65,
  maxPull = 95,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [internalRefreshing, setInternalRefreshing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const isEligibleRef = useRef<boolean>(false);
  const pullDistanceRef = useRef<number>(0);
  const hasVibratedRef = useRef<boolean>(false);

  const activeRefreshing = isRefreshing || internalRefreshing;

  // Strict check to ensure the page is at the absolute top boundary
  const isScrolledToVeryTop = useCallback((target?: EventTarget | null): boolean => {
    // 1. Check window / document scroll
    if (typeof window !== "undefined") {
      if (window.scrollY > 0 || window.pageYOffset > 0) return false;
      if (document.documentElement && document.documentElement.scrollTop > 0) return false;
      if (document.body && document.body.scrollTop > 0) return false;
    }

    // 2. Check the main shell scroll container (#admin-main)
    const adminMain = document.getElementById("admin-main");
    if (adminMain && adminMain.scrollTop > 0) return false;

    // 3. Check the pull-to-refresh container itself
    const container = containerRef.current;
    if (container && container.scrollTop > 0) return false;

    // 4. Walk up from target element to ensure NO ancestor is scrolled down
    if (target && target instanceof Element) {
      let curr: Element | null = target;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.scrollTop > 0) {
          return false;
        }
        curr = curr.parentElement;
      }
    }

    // 5. Check any scrollable elements inside the container that might have scrolled
    if (container) {
      const scrollables = container.querySelectorAll<HTMLElement>(
        '[class*="overflow-y-auto"], [class*="overflow-auto"], .overflow-y-auto'
      );
      for (let i = 0; i < scrollables.length; i++) {
        if (scrollables[i].scrollTop > 0) {
          return false;
        }
      }
    }

    return true;
  }, []);

  // Handle pull gesture start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (activeRefreshing) return;

      // Verify that the page is strictly at the top
      const isAtTop = isScrolledToVeryTop(e.target);

      if (isAtTop && e.touches.length === 1) {
        isEligibleRef.current = true;
        startYRef.current = e.touches[0].clientY;
        startXRef.current = e.touches[0].clientX;
        hasVibratedRef.current = false;
      } else {
        isEligibleRef.current = false;
      }
    },
    [activeRefreshing, isScrolledToVeryTop]
  );

  // Handle pull gesture move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isEligibleRef.current || activeRefreshing || e.touches.length !== 1) return;

      const clientY = e.touches[0].clientY;
      const clientX = e.touches[0].clientX;
      const deltaY = clientY - startYRef.current;
      const deltaX = clientX - startXRef.current;

      // If user is swiping horizontally or scrolling up into content, immediately cancel
      if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY <= 0) {
        isEligibleRef.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      // Re-verify that no element has scrolled
      if (!isScrolledToVeryTop(e.target)) {
        isEligibleRef.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      // Damped pull distance with an initial deadzone of 8px
      if (deltaY > 8) {
        const distance = Math.min(maxPull, Math.pow(deltaY - 8, 0.8) * 1.4);
        pullDistanceRef.current = distance;
        setPullDistance(distance);
        setIsPulling(true);

        // Tactile haptic feedback trigger when crossing refresh threshold
        if (distance >= threshold && !hasVibratedRef.current) {
          triggerHaptic("light");
          hasVibratedRef.current = true;
        } else if (distance < threshold && hasVibratedRef.current) {
          hasVibratedRef.current = false;
        }

        // Prevent native overscroll clash only when pulling down from the very top
        if (e.cancelable && deltaY > 16) {
          e.preventDefault();
        }
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [activeRefreshing, isScrolledToVeryTop, maxPull, threshold]
  );

  // Handle pull gesture release
  const handleTouchEnd = useCallback(async () => {
    if (!isEligibleRef.current || activeRefreshing) return;
    isEligibleRef.current = false;

    const finalDistance = pullDistanceRef.current;

    if (finalDistance >= threshold) {
      pullDistanceRef.current = 52;
      setPullDistance(52); // Lock to comfortable loading badge height
      setInternalRefreshing(true);
      triggerHaptic("medium");

      try {
        await onRefresh();
        triggerHaptic("success");
      } catch {
        triggerHaptic("warning");
      } finally {
        setInternalRefreshing(false);
        pullDistanceRef.current = 0;
        setPullDistance(0);
        setIsPulling(false);
        hasVibratedRef.current = false;
      }
    } else {
      pullDistanceRef.current = 0;
      setPullDistance(0);
      setIsPulling(false);
      hasVibratedRef.current = false;
    }
  }, [activeRefreshing, onRefresh, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => handleTouchStart(e);
    const onTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const onTouchEnd = () => handleTouchEnd();

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const rotationDeg = Math.min(360, (pullDistance / threshold) * 360);
  const isPastThreshold = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      id="pull-to-refresh-container"
      className={`relative w-full h-full flex flex-col ${className}`}
    >
      {/* Floating Animated Pull & Refresh Indicator Badge */}
      {(isPulling || activeRefreshing || pullDistance > 0) && (
        <div
          id="pull-refresh-indicator"
          style={{
            transform: `translateY(${Math.max(0, pullDistance - 48)}px)`,
            opacity: Math.min(1, pullDistance / 24),
            transition: isPulling ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease",
          }}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none"
        >
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full shadow-lg border text-xs font-semibold backdrop-blur-md transition-colors ${
              isPastThreshold || activeRefreshing
                ? "bg-[#202328] text-white border-white/10 shadow-black/20"
                : "bg-white/95 text-[#202328] border-black/10 shadow-black/10"
            }`}
          >
            {activeRefreshing ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F6CE46]" />
                <span>Loading latest live data...</span>
              </div>
            ) : isPastThreshold ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#F6CE46] animate-pulse" />
                <span>Release for hard refresh</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ArrowDown
                  style={{ transform: `rotate(${rotationDeg}deg)` }}
                  className="w-3.5 h-3.5 text-neutral-500 transition-transform"
                />
                <span>Swipe down to refresh</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content wrapped with smooth displacement when pulling */}
      <div
        id="pull-refresh-content-wrapper"
        style={{
          transform: activeRefreshing
            ? "translateY(28px)"
            : pullDistance > 0
            ? `translateY(${pullDistance * 0.35}px)`
            : "none",
          transition: isPulling ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="flex-1 flex flex-col min-h-0 w-full"
      >
        {children}
      </div>
    </div>
  );
}
