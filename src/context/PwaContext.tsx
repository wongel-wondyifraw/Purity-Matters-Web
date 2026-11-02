"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/toast";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  isIos: boolean;
  installPwa: () => Promise<void>;
  showIosInstructions: boolean;
  setShowIosInstructions: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isStandalone: false,
  isIos: false,
  installPwa: async () => {},
  showIosInstructions: false,
  setShowIosInstructions: () => {},
});

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const updateRequested = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Detect if already running as installed standalone app
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleControllerChange = () => {
      if (updateRequested.current) {
        window.location.reload();
      }
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    // 2. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    setIsIos(Boolean(isIosDevice));

    // If on iOS and not standalone, it can be added to home screen
    if (isIosDevice && !window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(true);
    }

    // 3. Register Service Worker with clean lifecycle and listener cleanup
    let onVisibilityChange: (() => void) | null = null;

    if ("serviceWorker" in navigator) {
      const registerSw = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // Keep an update waiting until the user chooses a safe reload point.
            if (reg.waiting) {
              setWaitingWorker(reg.waiting);
            }

            // Check for updates when worker installs
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    setWaitingWorker(installingWorker);
                  }
                };
              }
            };

            // Auto-check for updates whenever the PWA is resumed or focused
            onVisibilityChange = () => {
              if (document.visibilityState === "visible") {
                reg.update().catch(() => {});
              }
            };
            document.addEventListener("visibilitychange", onVisibilityChange);
          })
          .catch((err) => {
            console.warn("ServiceWorker registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        registerSw();
      } else {
        window.addEventListener("load", registerSw, { once: true });
      }
    }

    // 4. Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success("App Installed", "Purity Matters has been added to your device.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
      if (onVisibilityChange) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [toast]);

  const installPwa = useCallback(async () => {
    // If standard browser prompt event is available
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstallable(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn("Error invoking install prompt:", err);
      }
      return;
    }

    // If on iOS Safari
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    // Fallback info
    toast.info(
      "Install Purity Matters",
      "You can install this app using your browser menu (click the install icon in the URL bar or menu)."
    );
  }, [deferredPrompt, isIos, toast]);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isStandalone,
        isIos,
        installPwa,
        showIosInstructions,
        setShowIosInstructions,
      }}
    >
      <div id="pwa-app-shell" className="contents">
        {children}
      </div>
      {!isOnline && (
        <div
          id="pwa-offline-banner"
          role="status"
          className="fixed inset-x-3 top-3 z-[100] mx-auto max-w-xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
        >
          You are offline. Records already on this screen may remain visible; new data needs a connection.
        </div>
      )}
      {waitingWorker && (
        <div
          id="pwa-update-banner"
          role="status"
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-xl bg-[#202328] px-4 py-3 text-sm text-white shadow-xl"
        >
          <p>A new version is ready. Reload when you are ready to update.</p>
          <button
            type="button"
            className="shrink-0 rounded-lg bg-[#F6CE46] px-3 py-2 font-semibold text-[#202328]"
            onClick={() => {
              updateRequested.current = true;
              waitingWorker.postMessage({ type: "SKIP_WAITING" });
            }}
          >
            Update now
          </button>
        </div>
      )}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
