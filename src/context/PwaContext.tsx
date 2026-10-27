"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
            // Check for updates when worker installs
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    toast.info(
                      "PWA Updated",
                      "A new version of the app is available. Reload when ready to update."
                    );
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
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
