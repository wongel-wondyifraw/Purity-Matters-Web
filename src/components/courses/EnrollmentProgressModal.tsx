"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  X,
  CheckCircle2,
  BookOpen,
  Lock,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  Phone,
  Send,
  Sparkles,
  FileText,
  Paperclip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CourseEnrollmentRecord } from "@/types/admin";
import { fetchCourseEnrollmentDetailsApi } from "@/services/adminApi";
import { Skeleton } from "@/components/ui/skeleton";

interface EnrollmentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: number | null;
}

export function EnrollmentProgressModal({
  isOpen,
  onClose,
  enrollmentId,
}: EnrollmentProgressModalProps) {
  const [enrollment, setEnrollment] = useState<CourseEnrollmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !enrollmentId) {
      setEnrollment(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchCourseEnrollmentDetailsApi(enrollmentId)
      .then((data) => {
        if (isMounted) {
          setEnrollment(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load enrollment progress details");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, enrollmentId]);

  if (!isOpen) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#F7F8FA] dark:bg-[#16181C] text-[#202328] dark:text-[#EBECEF] border border-[#EBECEF] dark:border-[#202328] rounded-2xl p-6 sm:p-7 shadow-2xl"
      >
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-[#EBECEF] dark:border-[#202328]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-[#202328] dark:text-[#EBECEF]">
                Student Learning Progress
              </DialogTitle>
              <DialogDescription className="text-xs text-[#5E6470] dark:text-[#8C92A0] mt-0.5">
                Module-by-module sequential progression and enrollment overview
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5E6470] dark:text-[#8C92A0] hover:text-[#202328] dark:hover:text-[#EBECEF] hover:bg-[#EBECEF] dark:hover:bg-[#202328] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-24 w-full rounded-xl bg-[#EBECEF] dark:bg-[#202328]" />
            <Skeleton className="h-16 w-full rounded-xl bg-[#EBECEF] dark:bg-[#202328]" />
            <Skeleton className="h-40 w-full rounded-xl bg-[#EBECEF] dark:bg-[#202328]" />
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-rose-500">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#EBECEF] dark:border-[#202328]"
            >
              Close
            </Button>
          </div>
        ) : enrollment ? (
          <div className="space-y-6 pt-4">
            {/* User & Course Hero Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#202328]/60 border border-[#EBECEF] dark:border-[#202328] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#202328] dark:text-[#EBECEF]">
                    {enrollment.clientName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#5E6470] dark:text-[#8C92A0] mt-1 flex-wrap">
                    {enrollment.clientUsername && (
                      <span className="flex items-center gap-1 font-mono">
                        <Send className="w-3.5 h-3.5 text-blue-500" />
                        @{enrollment.clientUsername}
                      </span>
                    )}
                    {enrollment.clientPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {enrollment.clientPhone}
                      </span>
                    )}
                    <span className="font-mono text-[11px] bg-[#EBECEF] dark:bg-[#202328] px-2 py-0.5 rounded text-[#5E6470] dark:text-[#8C92A0]">
                      ID: {enrollment.telegramId}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      enrollment.courseType === "paid"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {enrollment.courseType === "paid" ? `💎 Paid (${enrollment.amount} ${enrollment.currency})` : "📖 Free"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      enrollment.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : enrollment.status === "in_progress"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {enrollment.status === "completed" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </>
                    ) : enrollment.status === "in_progress" ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> In Progress
                      </>
                    ) : (
                      "Not Started"
                    )}
                  </span>
                </div>
              </div>

              {/* Course Title and Progress Metric */}
              <div className="pt-2 border-t border-[#EBECEF] dark:border-[#202328]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5E6470] dark:text-[#8C92A0]">
                    Enrolled Course
                  </span>
                  <p className="text-sm font-semibold text-[#202328] dark:text-[#EBECEF]">
                    {enrollment.courseName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-bold text-[#202328] dark:text-[#EBECEF]">
                      {enrollment.progressPercent}%
                    </span>
                    <span className="text-xs text-[#5E6470] dark:text-[#8C92A0]">
                      ({enrollment.completedCount} / {enrollment.totalModules} modules)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-36 h-2 bg-[#EBECEF] dark:bg-[#16181C] rounded-full overflow-hidden mt-1.5 ml-auto">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        enrollment.progressPercent === 100
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, enrollment.progressPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Audit Info (For Paid Courses) */}
            {enrollment.courseType === "paid" && (
              <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Payment Verification Record
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      enrollment.paymentStatus === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : enrollment.paymentStatus === "pending_verification"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse"
                        : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {enrollment.paymentStatus.replace("_", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[#5E6470] dark:text-[#8C92A0]">
                  <div>
                    <span className="text-[10px] block uppercase font-medium">Fee</span>
                    <span className="font-semibold text-[#202328] dark:text-[#EBECEF]">
                      {enrollment.amount} {enrollment.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] block uppercase font-medium">Verified At</span>
                    <span className="text-[#202328] dark:text-[#EBECEF]">
                      {formatDate(enrollment.verifiedAt)}
                    </span>
                  </div>
                  {enrollment.adminNotes && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] block uppercase font-medium">Notes / Reason</span>
                      <span className="text-[#202328] dark:text-[#EBECEF] italic">
                        {enrollment.adminNotes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-[#202328]/40 border border-[#EBECEF] dark:border-[#202328]">
                <span className="text-[10px] uppercase font-semibold text-[#5E6470] dark:text-[#8C92A0] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Enrolled
                </span>
                <p className="font-semibold text-[#202328] dark:text-[#EBECEF] mt-1">
                  {formatDate(enrollment.createdAt)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#202328]/40 border border-[#EBECEF] dark:border-[#202328]">
                <span className="text-[10px] uppercase font-semibold text-[#5E6470] dark:text-[#8C92A0] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Last Active
                </span>
                <p className="font-semibold text-[#202328] dark:text-[#EBECEF] mt-1">
                  {formatDate(enrollment.lastActiveAt)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#202328]/40 border border-[#EBECEF] dark:border-[#202328] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-semibold text-[#5E6470] dark:text-[#8C92A0] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed Date
                </span>
                <p className="font-semibold text-[#202328] dark:text-[#EBECEF] mt-1">
                  {enrollment.completedAt ? formatDate(enrollment.completedAt) : "In Progress"}
                </p>
              </div>
            </div>

            {/* Sequential Module Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#5E6470] dark:text-[#8C92A0]">
                  Module Progression Sequence ({enrollment.moduleProgress?.length || 0})
                </h4>
                <div className="flex items-center gap-3 text-xs text-[#5E6470] dark:text-[#8C92A0]">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Unlocked
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Locked
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {(!enrollment.moduleProgress || enrollment.moduleProgress.length === 0) ? (
                  <div className="p-6 text-center text-xs text-[#5E6470] dark:text-[#8C92A0] rounded-xl border border-dashed border-[#EBECEF] dark:border-[#202328]">
                    No curriculum modules found for this course.
                  </div>
                ) : (
                  enrollment.moduleProgress.map((mod, index) => {
                    return (
                      <div
                        key={mod.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                          mod.isCompleted
                            ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/25"
                            : mod.isUnlocked
                            ? "bg-white dark:bg-[#202328] border-blue-500/30 shadow-sm"
                            : "bg-[#EBECEF]/40 dark:bg-[#16181C]/50 border-transparent opacity-60"
                        }`}
                      >
                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                            mod.isCompleted
                              ? "bg-emerald-500 text-white"
                              : mod.isUnlocked
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-slate-300 dark:bg-slate-700 text-slate-500"
                          }`}
                        >
                          {mod.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : mod.isUnlocked ? (
                            <BookOpen className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>

                        {/* Module Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#5E6470] dark:text-[#8C92A0]">
                                Module {index + 1}
                              </span>
                              <h5 className="text-sm font-bold text-[#202328] dark:text-[#EBECEF] truncate">
                                {mod.title}
                              </h5>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                mod.isCompleted
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : mod.isUnlocked
                                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                  : "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {mod.isCompleted
                                ? "Completed"
                                : mod.isUnlocked
                                ? "Current Active"
                                : "Locked"}
                            </span>
                          </div>

                          {mod.description && (
                            <p className="text-xs text-[#5E6470] dark:text-[#8C92A0] mt-1 line-clamp-2">
                              {mod.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-[11px] text-[#5E6470] dark:text-[#8C92A0]">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {mod.sectionsCount} Sections
                            </span>
                            <span className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              {mod.materialsCount} Attached Materials
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[#EBECEF] dark:border-[#202328] flex justify-end">
          <Button
            onClick={onClose}
            className="bg-[#202328] dark:bg-[#EBECEF] text-white dark:text-[#202328] hover:bg-[#32363E] dark:hover:bg-white text-xs font-semibold px-5 rounded-xl h-10 shadow-sm"
          >
            Close Overview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
