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
  const hasVibratedRef = useRef<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const isEligibleRef = useRef<boolean>(false);

  const activeRefreshing = isRefreshing || internalRefreshing;

  // Handle pull gesture start
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (activeRefreshing) return;

    // Verify if container or window is at the top
    const container = containerRef.current;
    const isAtTop = container ? container.scrollTop <= 0 : window.scrollY <= 0;

    if (isAtTop) {
      isEligibleRef.current = true;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      startYRef.current = clientY;
      hasVibratedRef.current = false;
    } else {
      isEligibleRef.current = false;
    }
  };

  // Handle pull gesture move
  const handleTouchMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!isEligibleRef.current || activeRefreshing) return;

      const container = containerRef.current;
      const isAtTop = container ? container.scrollTop <= 0 : window.scrollY <= 0;
      if (!isAtTop) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - startYRef.current;

      if (deltaY > 0) {
        // Damped pull distance
        const distance = Math.min(maxPull, Math.pow(deltaY, 0.85) * 1.5);
        setPullDistance(distance);
        setIsPulling(true);

        // Tactile haptic feedback trigger when crossing refresh threshold
        if (distance >= threshold && !hasVibratedRef.current) {
          triggerHaptic("light");
          hasVibratedRef.current = true;
        } else if (distance < threshold && hasVibratedRef.current) {
          hasVibratedRef.current = false;
        }

        // Prevent native bounce interference if dragging down
        if (e.cancelable && deltaY > 15) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [activeRefreshing, maxPull, threshold]
  );

  // Handle pull gesture release
  const handleTouchEnd = useCallback(async () => {
    if (!isEligibleRef.current || activeRefreshing) return;
    isEligibleRef.current = false;

    if (pullDistance >= threshold) {
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
        setPullDistance(0);
        setIsPulling(false);
        hasVibratedRef.current = false;
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
      hasVibratedRef.current = false;
    }
  }, [activeRefreshing, onRefresh, pullDistance, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const moveListener = (e: TouchEvent) => handleTouchMove(e);
    const endListener = () => handleTouchEnd();

    container.addEventListener("touchmove", moveListener, { passive: false });
    container.addEventListener("touchend", endListener);
    container.addEventListener("touchcancel", endListener);

    return () => {
      container.removeEventListener("touchmove", moveListener);
      container.removeEventListener("touchend", endListener);
      container.removeEventListener("touchcancel", endListener);
    };
  }, [handleTouchMove, handleTouchEnd]);

  const rotationDeg = Math.min(360, (pullDistance / threshold) * 360);
  const isPastThreshold = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      id="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onMouseDown={handleTouchStart}
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
