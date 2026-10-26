"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  User,
  BookOpen,
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
import { CourseEnrollmentRecord } from "@/types/admin";
import { useAdminData } from "@/context/AdminDataContext";

interface ReviewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: CourseEnrollmentRecord | null;
  mode: "verify" | "reject";
}

export function ReviewPaymentModal({
  isOpen,
  onClose,
  enrollment,
  mode,
}: ReviewPaymentModalProps) {
  const { verifyCourseEnrollment, rejectCourseEnrollment } = useAdminData();
  const [notesOrReason, setNotesOrReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !enrollment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "reject" && !notesOrReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "verify") {
        await verifyCourseEnrollment(enrollment.id, notesOrReason.trim() || undefined);
      } else {
        await rejectCourseEnrollment(enrollment.id, notesOrReason.trim());
      }
      onClose();
      setNotesOrReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerify = mode === "verify";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md bg-[#F7F8FA] dark:bg-[#16181C] text-[#202328] dark:text-[#EBECEF] border border-[#EBECEF] dark:border-[#202328] rounded-2xl p-6 shadow-2xl"
      >
        <DialogHeader className="flex flex-row items-start justify-between pb-3 border-b border-[#EBECEF] dark:border-[#202328]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isVerify
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isVerify ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#202328] dark:text-[#EBECEF]">
                {isVerify ? "Confirm & Grant Course Access" : "Reject Course Payment"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#5E6470] dark:text-[#8C92A0] mt-0.5">
                {isVerify
                  ? "Approve transfer and instantly grant access to student"
                  : "Mark transfer as unconfirmed and notify student"}
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
          {/* Summary Card */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#202328]/60 border border-[#EBECEF] dark:border-[#202328] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#5E6470] dark:text-[#8C92A0] flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5" /> Student
              </span>
              <span className="font-bold text-[#202328] dark:text-[#EBECEF]">
                {enrollment.clientName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#5E6470] dark:text-[#8C92A0] flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5" /> Course
              </span>
              <span className="font-semibold text-[#202328] dark:text-[#EBECEF]">
                {enrollment.courseName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#5E6470] dark:text-[#8C92A0] flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5" /> Fee Amount
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {enrollment.amount} {enrollment.currency}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#5E6470] dark:text-[#8C92A0] font-medium">
                Telegram ID
              </span>
              <span className="font-mono text-[11px] text-[#5E6470] dark:text-[#8C92A0]">
                {enrollment.telegramId}
              </span>
            </div>
          </div>

          {/* Form Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#202328] dark:text-[#EBECEF]">
              {isVerify ? "Admin Notes (Optional)" : "Rejection Reason (Required)"}
            </label>
            <Input
              value={notesOrReason}
              onChange={(e) => setNotesOrReason(e.target.value)}
              placeholder={
                isVerify
                  ? "e.g., Verified in CBE Statement ref #12345"
                  : "e.g., Transaction ID not found or amount incorrect"
              }
              required={!isVerify}
              className="bg-white dark:bg-[#202328] border-[#EBECEF] dark:border-[#202328] text-xs h-10 rounded-xl"
            />
            {!isVerify && (
              <p className="text-[11px] text-[#5E6470] dark:text-[#8C92A0]">
                This reason will be sent to the student on Telegram so they can verify their payment.
              </p>
            )}
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
              disabled={isSubmitting || (!isVerify && !notesOrReason.trim())}
              className={`text-xs font-semibold rounded-xl text-white shadow-sm ${
                isVerify
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting
                ? "Processing..."
                : isVerify
                ? "Confirm Payment & Grant Access"
                : "Reject Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
