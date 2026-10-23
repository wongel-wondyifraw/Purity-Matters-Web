/**
 * High-precision Haptic Feedback utility for Web and PWA environments.
 * Provides subtle, tactile vibration responses on supported mobile devices
 * when pulling to refresh, crossing thresholds, or completing data updates.
 */

export type HapticFeedbackType = "light" | "medium" | "heavy" | "success" | "warning";

export function triggerHaptic(type: HapticFeedbackType = "light"): void {
  if (typeof window === "undefined") return;

  if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
    try {
      switch (type) {
        case "light":
          // Subtle pulse when pull gesture engages or passes the threshold
          navigator.vibrate(14);
          break;
        case "medium":
          // Noticeable pulse when refresh is triggered
          navigator.vibrate(28);
          break;
        case "heavy":
          // Strong pulse for significant actions
          navigator.vibrate(45);
          break;
        case "success":
          // Pleasant double-pulse on successful data refresh
          navigator.vibrate([18, 40, 22]);
          break;
        case "warning":
          // Distinct stutter pulse for errors
          navigator.vibrate([35, 50, 35]);
          break;
      }
    } catch {
      // Gracefully ignore if user has not interacted or device blocks vibration
    }
  }
}
