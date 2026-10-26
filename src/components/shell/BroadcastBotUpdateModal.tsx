"use client";

import React, { useState } from "react";
import {
  Rocket,
  X,
  Send,
  Sparkles,
  Bot,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { triggerHaptic } from "@/lib/haptic";
import { broadcastBotUpdateApi } from "@/services/adminApi";

interface BroadcastBotUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BroadcastBotUpdateModal({
  isOpen,
  onClose,
}: BroadcastBotUpdateModalProps) {
  const { toast } = useToast();
  const [version, setVersion] = useState("v2.1.0");
  const [releaseNotes, setReleaseNotes] = useState(
    "• New dynamic training courses and sequential module learning\n• Instant free course access and manual CBE / Telebirr verification\n• Live completion status indicators (🟢, 📖, 🔒) on persistent menu"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await broadcastBotUpdateApi(version.trim(), releaseNotes.trim() || undefined);
      triggerHaptic();
      toast({
        title: "Bot Update Broadcast Sent!",
        description: `Delivered version announcement to ${res.sent} active user(s).`,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: "Broadcast Failed",
        description: err.message || "Failed to broadcast bot update.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg bg-[#F7F8FA] dark:bg-[#16181C] text-[#202328] dark:text-[#EBECEF] border border-[#EBECEF] dark:border-[#202328] rounded-2xl p-6 shadow-2xl"
      >
        <DialogHeader className="flex flex-row items-start justify-between pb-3.5 border-b border-[#EBECEF] dark:border-[#202328]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#202328] dark:text-[#EBECEF]">
                Broadcast Bot Update
              </DialogTitle>
              <DialogDescription className="text-xs text-[#5E6470] dark:text-[#8C92A0] mt-0.5">
                Notify users of the latest version and prompt them to refresh their persistent menu
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#5E6470] hover:text-[#202328] dark:hover:text-[#EBECEF]"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Version Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202328] dark:text-[#EBECEF] flex items-center gap-1.5">
              <span>Version Tag / Number</span>
              <span className="text-amber-500">*</span>
            </label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g., v2.1.0 or Version 2.0"
              required
              className="bg-white dark:bg-[#202328] border-[#EBECEF] dark:border-[#202328] text-xs h-10 rounded-xl font-mono"
            />
          </div>

          {/* Release Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202328] dark:text-[#EBECEF]">
              What&apos;s New / Release Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="List key highlights (e.g. • Added dynamic courses...)"
              className="w-full p-2.5 rounded-xl border border-[#EBECEF] dark:border-[#202328] bg-white dark:bg-[#202328] text-xs text-[#202328] dark:text-[#EBECEF] focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Telegram Message Preview Card */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#5E6470] dark:text-[#8C92A0] flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-blue-500" /> Telegram Message Preview
            </label>
            <div className="p-3.5 rounded-xl bg-[#EBECEF]/40 dark:bg-[#202328]/40 border border-[#EBECEF] dark:border-[#202328] text-xs space-y-2">
              <p className="font-bold text-[#202328] dark:text-[#EBECEF]">
                🚀 Purity Matters Bot Updated to {version || "v2.0"}!
              </p>

              {releaseNotes.trim() && (
                <div className="text-[11px] text-[#5E6470] dark:text-[#8C92A0] space-y-0.5 whitespace-pre-wrap font-sans">
                  <span className="font-semibold text-[#202328] dark:text-[#EBECEF]">What&apos;s New:</span>
                  <div>{releaseNotes.trim()}</div>
                </div>
              )}

              <p className="text-[11px] text-[#5E6470] dark:text-[#8C92A0]">
                We have introduced brand new features, dynamic training courses, and enhanced learning tools.
                <br /><br />
                Tap the button below to refresh your bot menu and get the latest experience!
              </p>

              {/* Mock Inline Button */}
              <div className="pt-1">
                <div className="w-full py-2 bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🔄 Refresh & Update Bot Menu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#EBECEF] dark:border-[#202328] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-[#EBECEF] dark:border-[#202328] rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !version.trim()}
              className="bg-[#202328] dark:bg-[#EBECEF] text-white dark:text-[#202328] hover:bg-black dark:hover:bg-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Broadcasting to users...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#F6CE46]" />
                  <span>Broadcast Update Message</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
