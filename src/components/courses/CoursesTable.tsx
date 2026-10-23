"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, RefreshCw, Search, Plus } from "lucide-react";
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
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export function CoursesTable() {
  const {
    courseProgressList,
    isCoursesLoading,
    syncWithRemoteBackend,
    isRefreshing,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");

  const filteredCourses = useMemo(() => {
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

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] pb-3.5 sm:pb-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Course Journeys & Accountability Requests</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Track client journey milestones and accountability partner requests.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search client, course, partner..."
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 2. Below Search on Mobile: All Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filter Dropdown */}
            <CustomDropdown
              id="select-courses-partner-filter"
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

            {/* Action Button: + Course */}
            <Button
              type="button"
              onClick={() => syncWithRemoteBackend()}
              disabled={isRefreshing}
              className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
              <span>Course</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        {/* Scrollable table container with sticky header */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                  Client
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Contact
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Journey Enrolled
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Current Progress
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Accountability Partner
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                  Last Active
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCoursesLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`crs-skel-${idx}`} className="border-b border-black/[0.04]">
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-44 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                    <TableCell className="px-4"><Skeleton className="h-3.5 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCourses.length === 0 ? (
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
                          ? "No course journey milestones match the current filters."
                          : "When users begin the 7-day or 21-day purity journeys in the bot, their progress will be tracked here."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                  >
                    <TableCell className="font-bold text-[#202328] text-sm px-4">
                      {item.clientName}
                    </TableCell>
                    <TableCell className="text-neutral-500 text-xs font-medium">
                      {item.phone || "—"}
                    </TableCell>
                    <TableCell className="text-[#202328] text-xs font-semibold">
                      {item.courseTitle}
                    </TableCell>
                    <TableCell>
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
                                Math.round((item.currentDay / item.totalDays) * 100)
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
        </div>
      </CardContent>
    </Card>
  );
}
