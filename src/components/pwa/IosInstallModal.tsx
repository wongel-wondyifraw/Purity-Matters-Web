"use client";

import React from "react";
import { Share, PlusSquare, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePwa } from "@/context/PwaContext";

export function IosInstallModal() {
  const { showIosInstructions, setShowIosInstructions } = usePwa();

  return (
    <Dialog open={showIosInstructions} onOpenChange={setShowIosInstructions}>
      <DialogContent className="max-w-sm bg-white rounded-3xl border border-black/10 p-6 text-[#202328] shadow-2xl">
        <DialogHeader className="pb-3 border-b border-black/[0.06] text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-black/10 flex items-center justify-center mx-auto mb-2 shadow-xs p-1">
            <img
              src="/icons/icon.svg"
              alt="Purity Matters Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <DialogTitle className="text-base font-bold text-[#202328]">
            Install Purity Matters
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 mt-1">
            Install on your iPhone or iPad for an app-like fullscreen experience with fast access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-3">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-black/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#202328] shrink-0 shadow-2xs">
              <Share className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#202328]">Step 1: Tap Share</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Tap the Safari <strong>Share</strong> button in your navigation bar at the bottom or top of your screen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-black/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#202328] shrink-0 shadow-2xs">
              <PlusSquare className="w-4 h-4 text-[#202328]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#202328]">Step 2: Add to Home Screen</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Scroll through the share options and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={() => setShowIosInstructions(false)}
            className="w-full h-10 rounded-full bg-[#202328] hover:bg-black text-[#F6CE46] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
