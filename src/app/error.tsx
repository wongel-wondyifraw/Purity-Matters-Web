"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If a deployment updated chunk hashes while the user was on an older bundle,
    // reloading the window safely fetches the fresh HTML and modern chunk index.
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("CSS chunk");

    if (isChunkError && typeof window !== "undefined") {
      console.warn("ChunkLoadError detected from new deployment. Reloading window...");
      window.location.reload();
    } else {
      console.error("Application error boundary caught error:", error);
    }
  }, [error]);

  const handleHardReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div
      id="global-error-container"
      className="h-screen w-full bg-[#EBECEF] flex flex-col items-center justify-center p-6 select-none"
    >
      <div
        id="global-error-card"
        className="flex flex-col items-center gap-4 bg-white/95 border border-black/10 rounded-3xl p-8 shadow-lg max-w-sm w-full text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-[#202328]">
            Something unexpected occurred
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The application encountered a rendering issue or a new version was deployed.
          </p>
        </div>

        <button
          type="button"
          id="global-error-reload-button"
          onClick={handleHardReload}
          className="mt-2 w-full h-11 rounded-full bg-[#202328] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#F6CE46]" />
          <span>Reload Application</span>
        </button>
      </div>
    </div>
  );
}
