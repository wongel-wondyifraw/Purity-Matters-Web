"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Users,
  Search,
  Plus,
  Download,
  FileBarChart,
  Printer,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("all_time");

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

  const filteredBreakdowns = useMemo(() => {
    return reportBreakdowns.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.module.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.activeLabel.toLowerCase().includes(q) ||
        item.completedLabel.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [reportBreakdowns, searchQuery, statusFilter]);

  const exportReportCsv = () => {
    const headers = [
      "Ministry Module",
      "Total Volume",
      "Active Volume",
      "Completed Volume",
      "Rate",
      "Status",
    ];
    const rows = filteredBreakdowns.map((r) => [
      `"${r.module.replace(/"/g, '""')}"`,
      r.total,
      r.active,
      r.completed,
      `"${r.rate}"`,
      `"${r.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ministry_summary_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Ministry Analytics & Reports</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Aggregated performance metrics across counseling, healing, journeys, and resources.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search ministry area, status..."
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 2. Below Search on Mobile: All Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {/* Filter Dropdown */}
            <select
              className="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#202328] cursor-pointer h-9 shrink-0 flex-1 sm:flex-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Departments ({reportBreakdowns.length})</option>
              <option value="operational">Operational</option>
              <option value="high demand">High Demand</option>
              <option value="active">Active</option>
              <option value="steady">Steady</option>
              <option value="automated">Automated</option>
            </select>

            {/* Export Action Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportReportCsv}
              className="border-black/15 text-[#202328] bg-white/80 hover:bg-white text-xs h-9 px-3.5 rounded-full cursor-pointer shadow-2xs font-semibold shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-neutral-600" />
              <span>Export</span>
            </Button>

            {/* Action Button: + Report */}
            <Button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
              <span>Report</span>
            </Button>
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
              <span>{calcPct(verifiedClients, totalClients)}% verified profile</span>
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
                {filteredBreakdowns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-neutral-500 text-xs font-medium"
                    >
                      No ministry department matched your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBreakdowns.map((row, idx) => {
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
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Generate Report Dialog */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-md shadow-2xl rounded-2xl p-6 overflow-hidden">
          <DialogHeader className="pb-3 border-b border-black/[0.06]">
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Generate Executive Report</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              Compile ministry intake, counseling volumes, and digital engagement summary.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Report Time Range
              </label>
              <select
                className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-xs text-[#202328]"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
              >
                <option value="all_time">Cumulative (All Time)</option>
                <option value="month">Current Month</option>
                <option value="quarter">Last Quarter (90 Days)</option>
                <option value="year">Calendar Year to Date</option>
              </select>
            </div>

            <div className="bg-neutral-50 rounded-xl p-3 border border-black/[0.06] text-xs space-y-1.5 text-neutral-600">
              <div className="flex justify-between">
                <span>Total Registrations:</span>
                <span className="font-bold text-[#202328]">{totalClients}</span>
              </div>
              <div className="flex justify-between">
                <span>Counseling Requests:</span>
                <span className="font-bold text-[#202328]">{counselingRequests.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Inner Healing Inquiries:</span>
                <span className="font-bold text-[#202328]">{innerHealingRequests.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Resource Orders / Downloads:</span>
                <span className="font-bold text-[#202328]">{resourceSales.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-full text-xs h-9 px-4"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  exportReportCsv();
                  setIsReportModalOpen(false);
                }}
                className="bg-[#202328] hover:bg-black text-[#F6CE46] rounded-full text-xs h-9 px-5 font-bold shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
