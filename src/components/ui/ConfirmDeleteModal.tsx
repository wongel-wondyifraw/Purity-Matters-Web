"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this record? This action cannot be undone and will permanently remove all associated data.",
  itemName,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = isDeleting || internalLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-md shadow-2xl rounded-2xl p-6 max-h-[88vh] flex flex-col overflow-hidden">
        {/* Top-Right 1/4th Quadrant Watermark Icon under Close button */}
        <div className="absolute -top-18 -right-18 pointer-events-none select-none text-red-500/[0.08] z-0">
          <AlertTriangle className="w-36 h-36" strokeWidth={1.2} />
        </div>

        <DialogHeader className="pb-3 border-b border-black/[0.06] relative z-10 shrink-0">
          <div>
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>{title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              Permanent deletion confirmation
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-neutral-600 leading-relaxed">
            {description}
          </p>

          {itemName && (
            <div className="p-3 rounded-xl bg-neutral-50 border border-black/[0.08] flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="font-bold text-xs text-[#202328] truncate">
                {itemName}
              </span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-neutral-100 border border-black/10 text-[11px] text-[#202328] leading-normal">
            <span className="font-bold">Caution:</span> This action is permanent and cannot be reversed.
          </div>
        </div>

        <div className="pt-3 border-t border-black/[0.06] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="rounded-full text-xs font-semibold h-9 px-4 border-black/15 text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-semibold h-9 px-5 shadow-sm transition-all flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
