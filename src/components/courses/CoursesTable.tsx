"use client";

import React from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

export function CoursesTable() {
  const { courseProgressList, isCoursesLoading } = useAdminData();

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 border-b border-black/[0.06] pb-4">
        <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
          <span>Course Journeys & Accountability Requests</span>
        </CardTitle>
        <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
          Track client journey milestones and accountability partner requests.
        </CardDescription>
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
              ) : courseProgressList.length === 0 ? (
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
                        When users begin the 7-day or 21-day purity journeys in the bot,
                        their progress will be tracked here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                courseProgressList.map((item) => (
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
