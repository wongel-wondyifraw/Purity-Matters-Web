"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  RefreshCw,
  Search,
  Plus,
  Users,
  GraduationCap,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
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
import { useAdminData } from "@/context/AdminDataContext";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import { TablePagination } from "@/components/ui/TablePagination";
import { CourseCatalogItem } from "@/types/admin";
import { CreateCourseModal } from "./CreateCourseModal";
import { EditCourseModal } from "./EditCourseModal";
import { CourseEnrollmentsTable } from "./CourseEnrollmentsTable";

export function CoursesTable() {
  const {
    courseCatalog,
    isCourseCatalogLoading,
    courseProgressList,
    isCoursesLoading,
    courseEnrollments,
    isCourseEnrollmentsLoading,
    syncWithRemoteBackend,
    isRefreshing,
    deleteCourse,
    apiUrl,
  } = useAdminData();

  // Active Sub-tab: "courses" (Course Catalog Management) vs "enrollments" (Enrolments & Progress) vs "journeys" (Quick Progress)
  const [activeTab, setActiveTab] = useState<"courses" | "enrollments" | "journeys">("courses");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");

  // Modals state
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseCatalogItem | null>(null);

  // Pagination for journeys
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Distinct themes in catalog
  const distinctThemes = useMemo(() => {
    const set = new Set<string>();
    courseCatalog.forEach((c) => {
      if (c.theme) set.add(c.theme);
    });
    return Array.from(set);
  }, [courseCatalog]);

  // Filtered Course Catalog
  const filteredCatalog = useMemo(() => {
    return courseCatalog.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.theme.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.generalObjective && c.generalObjective.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (themeFilter !== "all" && c.theme.toLowerCase() !== themeFilter.toLowerCase()) return false;

      return true;
    });
  }, [courseCatalog, searchQuery, typeFilter, themeFilter]);

  // Filtered Journeys
  const filteredJourneys = useMemo(() => {
    return courseProgressList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.clientName.toLowerCase().includes(q) ||
        item.courseTitle.toLowerCase().includes(q) ||
        (item.phone && item.phone.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (partnerFilter === "with_partner") return item.accountabilityRequested;
      if (partnerFilter === "no_partner") return !item.accountabilityRequested;
      return true;
    });
  }, [courseProgressList, searchQuery, partnerFilter]);

  // Reset pagination
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, partnerFilter, typeFilter, themeFilter, activeTab]);

  const paginatedJourneys = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJourneys.slice(start, start + pageSize);
  }, [filteredJourneys, currentPage, pageSize]);

  const handleDeleteCourse = async (course: CourseCatalogItem) => {
    if (
      window.confirm(
        `Are you sure you want to delete course "${course.name}"? This will delete all its modules, sections, and stored materials.`
      )
    ) {
      await deleteCourse(course.id);
    }
  };

  const getFullFileUrl = (filePath: string) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http")) return filePath;
    return `${apiUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  // KPI Calculations
  const totalCourses = courseCatalog.length;
  const freeCourses = courseCatalog.filter((c) => c.type === "free").length;
  const paidCourses = courseCatalog.filter((c) => c.type === "paid").length;
  const totalModules = courseCatalog.reduce((acc, c) => acc + (c.moduleCount || 0), 0);
  const totalEnrollments = courseEnrollments.length;
  const pendingPaymentsCount = courseEnrollments.filter(
    (e) => e.paymentStatus === "pending_verification"
  ).length;

  // Sub-tab options for Mobile
  const mobileTabOptions: DropdownOption[] = [
    {
      value: "courses",
      label: `Course Management (${totalCourses})`,
      icon: <GraduationCap className="w-3.5 h-3.5 text-[#F6CE46]" />,
    },
    {
      value: "enrollments",
      label: `Course Enrolments (${totalEnrollments})`,
      icon: <Users className="w-3.5 h-3.5 text-[#F6CE46]" />,
    },
    {
      value: "journeys",
      label: `Client Progress (${courseProgressList.length})`,
      icon: <BookOpen className="w-3.5 h-3.5 text-[#F6CE46]" />,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 pb-24">
      {/* 1. TOP KPI METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Courses</span>
            <div className="w-8 h-8 rounded-full bg-[#F6CE46]/20 text-[#202328] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#202328]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-[#202328] tracking-tight">
              {totalCourses}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Active Curriculum Tracks</p>
          </div>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Free Courses</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-[#202328] tracking-tight">
              {freeCourses}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Open Ministry Journeys</p>
          </div>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Paid Courses</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              {paidCourses}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Premium / Intensive Tracks</p>
          </div>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Modules</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-[#202328] tracking-tight">
              {totalModules}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Curriculum Milestones</p>
          </div>
        </Card>
      </div>

      {/* 2. MAIN CARD WITH SUB-TABS & ACTIONS */}
      <Card className="w-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] pb-3.5 sm:pb-4">
          {/* Left: Tab Switchers */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Desktop Pill Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-black/[0.06] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "courses"
                    ? "bg-[#202328] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Course Management ({totalCourses})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("enrollments")}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeTab === "enrollments"
                    ? "bg-[#202328] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Course Enrolments & Progress ({totalEnrollments})</span>
                {pendingPaymentsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("journeys")}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "journeys"
                    ? "bg-[#202328] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Quick Progress ({courseProgressList.length})</span>
              </button>
            </div>

            {/* Mobile Tab Dropdown */}
            <div className="sm:hidden w-full">
              <CustomDropdown
                id="select-courses-subtab"
                value={activeTab}
                options={mobileTabOptions}
                onChange={(val) => setActiveTab(val as "courses" | "enrollments" | "journeys")}
                className="w-full"
                triggerClassName="bg-white border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-bold shadow-2xs h-9 w-full"
              />
            </div>
          </div>

          {/* Right: Search, Filters, and + Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {activeTab === "enrollments" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => syncWithRemoteBackend()}
                disabled={isRefreshing}
                className="bg-white/80 border-black/10 text-xs rounded-full px-4 h-9 font-semibold shadow-2xs hover:bg-neutral-100 flex items-center gap-1.5 ml-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
                <span>Refresh Data</span>
              </Button>
            ) : (
              <>
                {/* Search Box */}
                <div className="relative w-full sm:w-56 lg:w-64">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                  <Input
                    placeholder={
                      activeTab === "courses"
                        ? "Search title, theme, objective..."
                        : "Search client, course, phone..."
                    }
                    className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Type / Partner Filter */}
                  {activeTab === "courses" ? (
                    <>
                      <CustomDropdown
                        id="select-courses-type-filter"
                        value={typeFilter}
                        options={[
                          { value: "all", label: "All Pricing" },
                          { value: "free", label: "Free Only" },
                          { value: "paid", label: "Paid Only" },
                        ]}
                        onChange={setTypeFilter}
                        className="shrink-0 flex-1 sm:flex-none"
                        triggerClassName="bg-white/80 border border-black/10 text-xs rounded-full px-3 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
                      />

                      {distinctThemes.length > 0 && (
                        <CustomDropdown
                          id="select-courses-theme-filter"
                          value={themeFilter}
                          options={[
                            { value: "all", label: "All Themes" },
                            ...distinctThemes.map((t) => ({ value: t, label: t })),
                          ]}
                          onChange={setThemeFilter}
                          className="shrink-0 flex-1 sm:flex-none"
                          triggerClassName="bg-white/80 border border-black/10 text-xs rounded-full px-3 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
                        />
                      )}

                      {/* + Create Course Button */}
                      <Button
                        type="button"
                        onClick={() => setIsCreateCourseOpen(true)}
                        className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-bold flex items-center gap-1.5 transition-all shrink-0 ml-auto sm:ml-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
                        <span>Create Course</span>
                      </Button>
                    </>
                  ) : (
                    <CustomDropdown
                      id="select-journeys-partner-filter"
                      value={partnerFilter}
                      options={[
                        { value: "all", label: "All Journeys" },
                        { value: "with_partner", label: "Has Partner" },
                        { value: "no_partner", label: "Self-Paced Only" },
                      ]}
                      onChange={setPartnerFilter}
                      className="shrink-0 flex-1 sm:flex-none"
                      triggerClassName="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </CardHeader>

        {/* 3. CONTENT AREA */}
        <CardContent className="p-4 sm:p-5 pt-4">
          {activeTab === "courses" ? (
            /* SUB-TAB 1: COURSE MANAGEMENT CARDS */
            <div className="w-full">
              {isCourseCatalogLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-black/[0.06] bg-white p-4 space-y-3"
                    >
                      <Skeleton className="h-36 w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4 rounded-full" />
                      <Skeleton className="h-3 w-1/2 rounded-full" />
                      <Skeleton className="h-8 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-[#202328] text-base mb-1">
                    {searchQuery || typeFilter !== "all" || themeFilter !== "all"
                      ? "No courses match your filter"
                      : "No Courses Created Yet"}
                  </h4>
                  <p className="text-xs text-neutral-500 mb-4 text-center leading-relaxed">
                    {searchQuery || typeFilter !== "all" || themeFilter !== "all"
                      ? "Try adjusting your search terms or filters."
                      : "Build your ministry curriculum by creating your first course with modules, lessons, and learning attachments."}
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIsCreateCourseOpen(true)}
                    className="bg-[#202328] hover:bg-black text-white text-xs font-bold rounded-full px-5 h-9 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
                    <span>Create Your First Course</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {filteredCatalog.map((course) => {
                    const bannerImg = course.bannerImage
                      ? getFullFileUrl(course.bannerImage)
                      : null;

                    return (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs hover:shadow-md hover:border-black/15 transition-all flex flex-col group"
                      >
                        {/* Course Banner Thumbnail */}
                        <Link
                          href={`/courses/${course.id}`}
                          className="relative w-full h-36 bg-gradient-to-br from-[#202328] to-neutral-700 block overflow-hidden cursor-pointer"
                        >
                          {bannerImg ? (
                            <img
                              src={bannerImg}
                              alt={course.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">
                              <BookOpen className="w-10 h-10" />
                            </div>
                          )}

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#202328] text-[10px] font-black shadow-xs">
                              {course.theme}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                                course.type === "free"
                                  ? "bg-[#202328] text-white"
                                  : "bg-[#F6CE46] text-[#202328]"
                              }`}
                            >
                              {course.type === "free"
                                ? "FREE"
                                : `${course.price.toLocaleString()} ${course.currency}`}
                            </span>
                          </div>
                        </Link>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <Link
                              href={`/courses/${course.id}`}
                              className="text-sm font-bold text-[#202328] hover:text-black line-clamp-1 cursor-pointer block"
                              title={course.name}
                            >
                              {course.name}
                            </Link>

                            {course.generalObjective ? (
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                                {course.generalObjective}
                              </p>
                            ) : course.description ? (
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                                {course.description}
                              </p>
                            ) : (
                              <p className="text-xs text-neutral-400 italic mt-1">
                                No objective summary defined.
                              </p>
                            )}
                          </div>

                          {/* Stats Metrics Chips */}
                          <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04] text-[11px] font-semibold text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{course.moduleCount || 0} Modules</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{course.sectionCount || 0} Sections</span>
                            </span>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] gap-2">
                            <Link
                              href={`/courses/${course.id}`}
                              className="flex-1 py-1.5 px-3 rounded-full bg-neutral-100 hover:bg-[#202328] hover:text-white text-[#202328] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <span>Manage Curriculum</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setCourseToEdit(course)}
                              className="p-2 text-neutral-500 hover:text-[#202328] hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                              title="Edit Course"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(course)}
                              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                              title="Delete Course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "enrollments" ? (
            /* SUB-TAB 2: COURSE ENROLMENTS & PROGRESS TABLE */
            <div className="w-full">
              <CourseEnrollmentsTable />
            </div>
          ) : (
            /* SUB-TAB 3: CLIENT JOURNEYS PROGRESS TABLE */
            <div className="w-full overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                    <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                      <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 min-w-[140px]">
                        Client
                      </TableHead>
                      <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[120px]">
                        Contact
                      </TableHead>
                      <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[200px] max-w-[360px]">
                        Journey Enrolled
                      </TableHead>
                      <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[160px]">
                        Current Progress
                      </TableHead>
                      <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[150px]">
                        Accountability Partner
                      </TableHead>
                      <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 min-w-[120px]">
                        Last Active
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCoursesLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow
                          key={`crs-skel-${idx}`}
                          className="border-b border-black/[0.04]"
                        >
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-3.5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-44 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24 rounded-full" />
                          </TableCell>
                          <TableCell className="px-4">
                            <Skeleton className="h-3.5 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredJourneys.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-12 text-neutral-500 text-sm"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <p className="font-semibold text-[#202328] text-sm">
                              No Enrolled Course Progress
                            </p>
                            <p className="text-xs text-neutral-500">
                              {searchQuery || partnerFilter !== "all"
                                ? "No client journey milestones match the current filters."
                                : "When users begin purity journeys in the bot, their progress will be tracked here."}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedJourneys.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                        >
                          <TableCell className="font-bold text-[#202328] text-sm px-4 py-3.5 align-top min-w-[140px]">
                            {item.clientName}
                          </TableCell>
                          <TableCell className="text-neutral-500 text-xs font-medium py-3.5 align-top min-w-[120px]">
                            {item.phone || "—"}
                          </TableCell>
                          <TableCell className="text-[#202328] text-xs font-semibold py-3.5 align-top min-w-[200px] max-w-[360px] whitespace-normal">
                            <div className="flex items-start">
                              <span className="inline-flex border border-black/10 text-xs bg-white text-[#202328] font-semibold px-2.5 py-1.5 rounded-xl shadow-2xs max-w-full whitespace-normal break-words leading-relaxed text-left">
                                {item.courseTitle}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 align-top min-w-[160px]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#202328] font-bold">
                                Day {item.currentDay} / {item.totalDays}
                              </span>
                              <div className="w-24 bg-neutral-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#202328] h-full rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(
                                        (item.currentDay / item.totalDays) * 100
                                      )
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.accountabilityRequested ? (
                              <span className="bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] font-bold text-xs px-2.5 py-1 rounded-full shadow-2xs">
                                ⚠️ Needs Partner
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-xs font-medium">
                                Self-paced
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-neutral-500 text-xs font-medium px-4">
                            {item.lastActive}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Journeys Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalItems={filteredJourneys.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="journeys"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE COURSE MODAL */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
      />

      {/* EDIT COURSE MODAL */}
      <EditCourseModal
        course={courseToEdit}
        isOpen={!!courseToEdit}
        onClose={() => setCourseToEdit(null)}
      />
    </div>
  );
}
