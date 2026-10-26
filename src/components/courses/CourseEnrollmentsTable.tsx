"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  ShieldCheck,
  Send,
  Phone,
  Layers,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import { TablePagination } from "@/components/ui/TablePagination";
import { useAdminData } from "@/context/AdminDataContext";
import { CourseEnrollmentRecord } from "@/types/admin";
import { EnrollmentProgressModal } from "./EnrollmentProgressModal";
import { ReviewPaymentModal } from "./ReviewPaymentModal";

export function CourseEnrollmentsTable() {
  const {
    courseEnrollments,
    isCourseEnrollmentsLoading,
    courseCatalog,
    deleteCourseEnrollment,
  } = useAdminData();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [progressStatusFilter, setProgressStatusFilter] = useState("all");

  // Modals state
  const [progressModalEnrollmentId, setProgressModalEnrollmentId] = useState<number | null>(null);
  const [paymentReviewEnrollment, setPaymentReviewEnrollment] = useState<CourseEnrollmentRecord | null>(null);
  const [paymentReviewMode, setPaymentReviewMode] = useState<"verify" | "reject">("verify");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered Enrollments
  const filteredEnrollments = useMemo(() => {
    return courseEnrollments.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.clientName?.toLowerCase().includes(q) ||
        item.telegramId?.toLowerCase().includes(q) ||
        (item.clientUsername && item.clientUsername.toLowerCase().includes(q)) ||
        (item.clientPhone && item.clientPhone.toLowerCase().includes(q)) ||
        item.courseName?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedCourseFilter !== "all" && String(item.courseId) !== selectedCourseFilter) {
        return false;
      }

      if (typeFilter !== "all" && item.courseType !== typeFilter) {
        return false;
      }

      if (paymentStatusFilter !== "all" && item.paymentStatus !== paymentStatusFilter) {
        return false;
      }

      if (progressStatusFilter !== "all" && item.status !== progressStatusFilter) {
        return false;
      }

      return true;
    });
  }, [
    courseEnrollments,
    searchQuery,
    selectedCourseFilter,
    typeFilter,
    paymentStatusFilter,
    progressStatusFilter,
  ]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedEnrollments = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredEnrollments.slice(start, start + pageSize);
  }, [filteredEnrollments, safePage, pageSize]);

  // Metrics
  const metrics = useMemo(() => {
    const total = courseEnrollments.length;
    const freeCount = courseEnrollments.filter((e) => e.courseType === "free").length;
    const paidCount = courseEnrollments.filter((e) => e.courseType === "paid").length;
    const pendingPayments = courseEnrollments.filter((e) => e.paymentStatus === "pending_verification").length;
    const completedCount = courseEnrollments.filter((e) => e.status === "completed").length;
    return { total, freeCount, paidCount, pendingPayments, completedCount };
  }, [courseEnrollments]);

  // Dropdown Options
  const courseOptions: DropdownOption[] = useMemo(() => {
    const list: DropdownOption[] = [{ label: "All Courses", value: "all" }];
    courseCatalog.forEach((c) => {
      list.push({ label: c.name, value: String(c.id) });
    });
    return list;
  }, [courseCatalog]);

  const typeOptions: DropdownOption[] = [
    { label: "All Types", value: "all" },
    { label: "Free Courses", value: "free" },
    { label: "Paid Courses", value: "paid" },
  ];

  const paymentOptions: DropdownOption[] = [
    { label: "All Payments", value: "all" },
    { label: "Free", value: "free" },
    { label: "Pending Verification", value: "pending_verification" },
    { label: "Confirmed / Active", value: "confirmed" },
    { label: "Rejected", value: "rejected" },
  ];

  const progressOptions: DropdownOption[] = [
    { label: "All Progress", value: "all" },
    { label: "Not Started", value: "not_started" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

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
          });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return dateStr;
    }
  };

  const handleOpenReview = (enrollment: CourseEnrollmentRecord, mode: "verify" | "reject") => {
    setPaymentReviewEnrollment(enrollment);
    setPaymentReviewMode(mode);
  };

  const handleDelete = async (enrollment: CourseEnrollmentRecord) => {
    if (confirm(`Are you sure you want to delete enrollment record for ${enrollment.clientName} in ${enrollment.courseName}?`)) {
      await deleteCourseEnrollment(enrollment.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181C] border border-[#EBECEF] dark:border-[#202328] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6470] dark:text-[#8C92A0]">
            Total Enrolments
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#202328] dark:text-[#EBECEF]">
              {metrics.total}
            </span>
            <Users className="w-5 h-5 text-blue-500/70" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181C] border border-[#EBECEF] dark:border-[#202328] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6470] dark:text-[#8C92A0]">
            Free Enrolments
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#202328] dark:text-[#EBECEF]">
              {metrics.freeCount}
            </span>
            <BookOpen className="w-5 h-5 text-purple-500/70" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181C] border border-[#EBECEF] dark:border-[#202328] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6470] dark:text-[#8C92A0]">
            Paid Enrolments
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#202328] dark:text-[#EBECEF]">
              {metrics.paidCount}
            </span>
            <GraduationCap className="w-5 h-5 text-amber-500/70" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181C] border border-[#EBECEF] dark:border-[#202328] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6470] dark:text-[#8C92A0]">
            Pending Payments
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-2xl font-black ${
                metrics.pendingPayments > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-[#202328] dark:text-[#EBECEF]"
              }`}
            >
              {metrics.pendingPayments}
            </span>
            <ShieldCheck
              className={`w-5 h-5 ${
                metrics.pendingPayments > 0
                  ? "text-amber-500 animate-pulse"
                  : "text-slate-400"
              }`}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181C] border border-[#EBECEF] dark:border-[#202328] shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6470] dark:text-[#8C92A0]">
            Completed Courses
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.completedCount}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500/70" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border border-[#EBECEF] dark:border-[#202328] bg-white dark:bg-[#16181C] shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-[#5E6470] dark:text-[#8C92A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by student name, telegram ID, phone, or course..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-[#F7F8FA] dark:bg-[#202328] border-none text-xs rounded-xl h-10 w-full"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-40">
                <CustomDropdown
                  options={courseOptions}
                  value={selectedCourseFilter}
                  onChange={(val) => {
                    setSelectedCourseFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter Course"
                />
              </div>

              <div className="w-32">
                <CustomDropdown
                  options={typeOptions}
                  value={typeFilter}
                  onChange={(val) => {
                    setTypeFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Course Type"
                />
              </div>

              <div className="w-40">
                <CustomDropdown
                  options={paymentOptions}
                  value={paymentStatusFilter}
                  onChange={(val) => {
                    setPaymentStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Payment Status"
                />
              </div>

              <div className="w-36">
                <CustomDropdown
                  options={progressOptions}
                  value={progressStatusFilter}
                  onChange={(val) => {
                    setProgressStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Progress"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="rounded-2xl border border-[#EBECEF] dark:border-[#202328] bg-white dark:bg-[#16181C] shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-[#EBECEF] dark:border-[#202328] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#202328] dark:text-[#EBECEF] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-500" />
              Enrolled Students & Progress Tracking
            </CardTitle>
            <CardDescription className="text-xs text-[#5E6470] dark:text-[#8C92A0] mt-0.5">
              Showing {filteredEnrollments.length} enrolment records across all dynamic courses
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F7F8FA] dark:bg-[#202328]/50">
              <TableRow className="border-b border-[#EBECEF] dark:border-[#202328]">
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 min-w-[150px]">
                  Student / User
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 min-w-[180px] max-w-[280px]">
                  Course
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 min-w-[140px]">
                  Payment Status
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 min-w-[130px]">
                  Progress
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 min-w-[160px] max-w-[240px]">
                  Current Module
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 min-w-[120px]">
                  Course Status
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 min-w-[130px]">
                  Enrolled / Active
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-[#5E6470] dark:text-[#8C92A0] py-3.5 text-right min-w-[120px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCourseEnrollmentsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-[#EBECEF] dark:border-[#202328]">
                    <TableCell><Skeleton className="h-5 w-32 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-20 rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs text-[#5E6470] dark:text-[#8C92A0]">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6" />
                    </div>
                    No enrolment records matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEnrollments.map((item) => {
                  const isPaid = item.courseType === "paid";
                  const isPending = item.paymentStatus === "pending_verification";

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-[#EBECEF] dark:border-[#202328] hover:bg-[#F7F8FA]/60 dark:hover:bg-[#202328]/40 transition-colors"
                    >
                      {/* Student info */}
                      <TableCell className="py-3.5 font-medium text-xs text-[#202328] dark:text-[#EBECEF] align-top min-w-[150px]">
                        <div>
                          <span className="font-bold block">{item.clientName}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#5E6470] dark:text-[#8C92A0]">
                            {item.clientUsername && (
                              <span className="flex items-center gap-0.5">
                                <Send className="w-2.5 h-2.5 text-blue-500" />
                                @{item.clientUsername}
                              </span>
                            )}
                            <span className="font-mono text-[10px] bg-[#EBECEF] dark:bg-[#202328] px-1.5 py-0.2 rounded">
                              {item.telegramId}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Course info */}
                      <TableCell className="py-3.5 text-xs text-[#202328] dark:text-[#EBECEF] min-w-[180px] max-w-[280px] whitespace-normal align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold block text-xs whitespace-normal break-words leading-snug">
                            {item.courseName}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isPaid
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                                : "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25"
                            }`}
                          >
                            {isPaid ? `Paid (${item.amount} ${item.currency})` : "Free Course"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="py-3.5 align-top min-w-[140px]">
                        {item.courseType === "free" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            Free Access
                          </span>
                        ) : item.paymentStatus === "confirmed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        ) : item.paymentStatus === "pending_verification" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 animate-pulse">
                              <ShieldCheck className="w-3 h-3" /> Pending Review
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </TableCell>

                      {/* Progress bar */}
                      <TableCell className="py-3.5 text-xs text-[#202328] dark:text-[#EBECEF] align-top min-w-[130px]">
                        <div className="w-28 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span>{item.progressPercent}%</span>
                            <span className="text-[#5E6470] dark:text-[#8C92A0] text-[10px] font-normal">
                              {item.completedCount}/{item.totalModules}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#EBECEF] dark:bg-[#202328] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                item.progressPercent === 100
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(100, item.progressPercent)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Current Module */}
                      <TableCell className="py-3.5 text-xs text-[#5E6470] dark:text-[#8C92A0] min-w-[160px] max-w-[240px] whitespace-normal align-top">
                        <div className="flex items-start">
                          <span className="inline-flex border border-black/10 dark:border-white/10 text-xs bg-white dark:bg-[#202328] px-2.5 py-1 rounded-xl shadow-2xs max-w-full whitespace-normal break-words leading-relaxed text-left font-medium" title={item.currentModuleTitle}>
                            {item.currentModuleTitle || "Module 1"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5 align-top min-w-[120px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : item.status === "in_progress"
                              ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                              : "bg-slate-500/15 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {item.status === "completed"
                            ? "Completed"
                            : item.status === "in_progress"
                            ? "In Progress"
                            : "Not Started"}
                        </span>
                      </TableCell>

                      {/* Dates */}
                      <TableCell className="py-3.5 text-[11px] text-[#5E6470] dark:text-[#8C92A0] align-top min-w-[130px]">
                        <div>
                          <span className="block font-medium text-[#202328] dark:text-[#EBECEF]">
                            {formatDate(item.createdAt)}
                          </span>
                          <span className="text-[10px] text-[#5E6470] dark:text-[#8C92A0]">
                            Active: {formatDateTime(item.lastActiveAt)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right space-x-1 whitespace-nowrap">
                        {/* If pending payment: show quick verify & reject buttons */}
                        {isPending && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReview(item, "verify")}
                              className="h-7 px-2.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                            >
                              Verify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReview(item, "reject")}
                              className="h-7 px-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {/* View Progress Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProgressModalEnrollmentId(item.id)}
                          className="h-7 px-2.5 rounded-lg text-xs font-semibold border-[#EBECEF] dark:border-[#202328] hover:bg-[#F7F8FA] dark:hover:bg-[#202328]"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-[#5E6470] dark:text-[#8C92A0]" />
                          Progress
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredEnrollments.length > 0 && (
          <div className="p-4 border-t border-[#EBECEF] dark:border-[#202328]">
            <TablePagination
              currentPage={safePage}
              pageSize={pageSize}
              totalItems={filteredEnrollments.length}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </Card>

      {/* Progress Detail Modal */}
      <EnrollmentProgressModal
        isOpen={progressModalEnrollmentId !== null}
        onClose={() => setProgressModalEnrollmentId(null)}
        enrollmentId={progressModalEnrollmentId}
      />

      {/* Review Payment Modal */}
      <ReviewPaymentModal
        isOpen={paymentReviewEnrollment !== null}
        onClose={() => setPaymentReviewEnrollment(null)}
        enrollment={paymentReviewEnrollment}
        mode={paymentReviewMode}
      />
    </div>
  );
}
