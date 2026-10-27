"use client";

import React, { useState, useMemo } from "react";
import { Search, Sparkles } from "lucide-react";
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
import { TablePagination } from "@/components/ui/TablePagination";

export function InnerHealingTable() {
  const {
    innerHealingRequests,
    isInnerHealingLoading,
    updateInnerHealingStatus,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return innerHealingRequests.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.clientName.toLowerCase().includes(q) ||
        item.referenceNumber.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === "all") return true;
      return item.status === statusFilter;
    });
  }, [innerHealingRequests, searchQuery, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to first page on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] pb-3.5 sm:pb-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Inner Healing Ministry Queue</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Requests submitted by clients for specialized emotional and spiritual restoration.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search ref, client, topic..."
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 2. Below Search on Mobile: All Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filter Dropdown */}
            <CustomDropdown
              id="select-inner-healing-status-filter"
              value={statusFilter}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "assigned", label: "Assigned" },
                { value: "completed", label: "Completed" },
              ]}
              onChange={setStatusFilter}
              className="shrink-0 flex-1 sm:flex-none"
              triggerClassName="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
            />
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
                <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 w-32 shrink-0">
                  Reference
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[140px]">
                  Client
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[260px] max-w-[460px]">
                  Topic / Issue Description
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[130px]">
                  Requested At
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[120px]">
                  Status
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3 text-right px-4 min-w-[140px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInnerHealingLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`ih-skel-${idx}`} className="border-b border-black/[0.04]">
                    <TableCell className="px-4 py-3 align-top"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="align-top"><Skeleton className="h-10 w-64 rounded-xl" /></TableCell>
                    <TableCell className="align-top"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="align-top"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right px-4 align-top"><Skeleton className="h-7 w-20 rounded-full ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-neutral-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-[#202328] text-sm">
                        No Inner Healing Requests
                      </p>
                      <p className="text-xs text-neutral-500">
                        {searchQuery || statusFilter !== "all"
                          ? "No inner healing requests match the current filters."
                          : "Clients submitting prayer & inner healing requests via the bot will appear here."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRequests.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                  >
                    <TableCell className="px-4 py-3.5 align-top">
                      <span className="text-[#202328] font-bold text-xs bg-[#F6CE46]/20 border border-[#F6CE46]/40 rounded-full px-2.5 py-1 font-mono">
                        {item.referenceNumber}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 align-top min-w-[140px]">
                      <div className="font-bold text-[#202328] text-sm">
                        {item.clientName}
                      </div>
                      <div className="text-xs text-neutral-400 font-medium">
                        {item.phone}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-3.5 min-w-[260px] max-w-[460px] whitespace-normal">
                      <div className="flex items-start">
                        <div className="inline-flex border border-black/10 text-xs bg-white text-[#202328] font-medium px-3 py-1.5 rounded-xl shadow-2xs max-w-full whitespace-normal break-words leading-relaxed text-left">
                          {item.topic || "General Inner Healing"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-500 text-xs font-medium py-3.5 align-top min-w-[130px]">
                      {item.createdAt}
                    </TableCell>
                    <TableCell className="py-3.5 align-top min-w-[120px]">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs ${
                          item.status === "pending"
                            ? "bg-neutral-100 text-neutral-600 border border-black/10"
                            : item.status === "contacted"
                            ? "bg-[#202328] text-white border border-[#202328]"
                            : "bg-[#F6CE46]/30 text-[#202328] font-bold border border-[#F6CE46]/50"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-4 py-3.5 align-top space-x-2 min-w-[140px]">
                      {item.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-black/15 bg-white text-[#202328] hover:bg-neutral-50 rounded-full px-3.5 py-1.5 cursor-pointer shadow-2xs font-semibold"
                          onClick={() => updateInnerHealingStatus(item.id, "contacted")}
                        >
                          Mark Contacted
                        </Button>
                      )}
                      {item.status === "contacted" && (
                        <Button
                          size="sm"
                          className="text-xs bg-[#202328] hover:bg-black text-white rounded-full px-3.5 py-1.5 cursor-pointer shadow-2xs font-semibold border-0"
                          onClick={() => updateInnerHealingStatus(item.id, "completed")}
                        >
                          Mark Completed
                        </Button>
                      )}
                      {item.status === "completed" && (
                        <span className="text-[#202328] font-bold text-xs bg-[#F6CE46]/30 border border-[#F6CE46]/50 rounded-full px-3 py-1">
                          Done
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </CardContent>

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredRequests.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="requests"
      />
    </Card>
  );
}
