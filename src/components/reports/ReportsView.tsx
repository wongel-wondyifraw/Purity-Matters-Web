"use client";

import React from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Users,
} from "lucide-react";
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

export function ReportsView() {
  const {
    totalClients,
    verifiedClients,
    counselingRequests,
    innerHealingRequests,
    courseProgressList,
    resourceSales,
  } = useAdminData();

  const calcPct = (val: number, total: number) =>
    total > 0 ? Math.round((val / total) * 100) : 0;

  const counselingCompleted = counselingRequests.filter(
    (c) => c.status === "completed"
  ).length;
  const counselingActive = counselingRequests.length - counselingCompleted;

  const innerHealingCompleted = innerHealingRequests.filter(
    (i) => i.status === "completed"
  ).length;
  const innerHealingActive = innerHealingRequests.length - innerHealingCompleted;

  const reportBreakdowns = [
    {
      module: "User Intake & Registrations",
      icon: Users,
      total: totalClients,
      active: totalClients - verifiedClients,
      completed: verifiedClients,
      activeLabel: "Awaiting Phone",
      completedLabel: "Verified Clients",
      rate: `${calcPct(verifiedClients, totalClients)}% verified`,
      status: "Operational",
    },
    {
      module: "Pastoral Counselling Sessions",
      icon: Clock,
      total: counselingRequests.length,
      active: counselingActive,
      completed: counselingCompleted,
      activeLabel: "In Queue / Assigned",
      completedLabel: "Sessions Completed",
      rate: `${calcPct(counselingCompleted, counselingRequests.length)}% completed`,
      status: "High Demand",
    },
    {
      module: "Inner Healing & Spiritual Deliverance",
      icon: Sparkles,
      total: innerHealingRequests.length,
      active: innerHealingActive,
      completed: innerHealingCompleted,
      activeLabel: "Active Sessions",
      completedLabel: "Ministry Concluded",
      rate: `${calcPct(innerHealingCompleted, innerHealingRequests.length)}% resolved`,
      status: "Active",
    },
    {
      module: "Guided Journeys & Accountability",
      icon: BookOpen,
      total: courseProgressList.length,
      active: courseProgressList.filter((c) => c.accountabilityRequested).length,
      completed: courseProgressList.filter((c) => !c.accountabilityRequested).length,
      activeLabel: "Needs Partner",
      completedLabel: "Paired / Self-Paced",
      rate: `${calcPct(
        courseProgressList.length -
          courseProgressList.filter((c) => c.accountabilityRequested).length,
        courseProgressList.length
      )}% paired`,
      status: "Steady",
    },
    {
      module: "Digital Resources & E-Books",
      icon: ShoppingBag,
      total: resourceSales.length,
      active: 0,
      completed: resourceSales.length,
      activeLabel: "Pending",
      completedLabel: "Delivered",
      rate: "100% delivered",
      status: "Automated",
    },
  ];

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 border-b border-black/[0.06] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Ministry Analytics & Summary Reports</span>
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
              Comprehensive overview of client intake, counselling engagements, and spiritual restoration.
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202328]/5 border border-black/[0.08] text-xs font-semibold text-[#202328]">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Live Aggregations</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 gap-4 overflow-hidden">
        {/* Top Summary Cards (Fixed Height) */}
        <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-white/80 rounded-2xl border border-black/[0.06] shadow-2xs">
            <div className="text-xs text-neutral-500 font-medium">Total Registered Clients</div>
            <div className="text-2xl font-light text-[#202328] mt-1">{totalClients}</div>
            <div className="text-xs text-[#202328] font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#202328]" />{" "}
              {calcPct(verifiedClients, totalClients)}% verified profile
            </div>
          </div>
          <div className="p-3.5 bg-white/80 rounded-2xl border border-black/[0.06] shadow-2xs">
            <div className="text-xs text-neutral-500 font-medium">Counselling & Pastoral Sessions</div>
            <div className="text-2xl font-light text-[#202328] mt-1">{counselingRequests.length}</div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#202328]" />
              <span>{counselingCompleted} sessions completed</span>
            </div>
          </div>
          <div className="p-3.5 bg-white/80 rounded-2xl border border-black/[0.06] shadow-2xs">
            <div className="text-xs text-neutral-500 font-medium">Inner Healing Ministry Inquiries</div>
            <div className="text-2xl font-light text-[#202328] mt-1">{innerHealingRequests.length}</div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#202328]" />
              <span>{innerHealingCompleted} healed / completed</span>
            </div>
          </div>
        </div>

        {/* Breakdown Table Container fitting the viewport height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                  <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                    Ministry Service / Department
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Total Volume
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Active / In-Queue
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Concluded / Converted
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Completion Rate
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 text-right px-4">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportBreakdowns.map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <TableRow
                      key={idx}
                      className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                    >
                      <TableCell className="font-bold text-[#202328] text-xs px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#202328]/5 border border-black/10 flex items-center justify-center text-[#202328]">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{row.module}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#202328] font-bold text-xs">
                        {row.total}
                      </TableCell>
                      <TableCell className="text-neutral-500 text-xs font-medium">
                        {row.active} <span className="text-[10px] text-neutral-400">({row.activeLabel})</span>
                      </TableCell>
                      <TableCell className="text-[#202328] text-xs font-semibold">
                        {row.completed} <span className="text-[10px] text-neutral-400">({row.completedLabel})</span>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-[#202328]">
                        {row.rate}
                      </TableCell>
                      <TableCell className="text-right px-4">
                        <span className="inline-flex items-center gap-1 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          {row.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
