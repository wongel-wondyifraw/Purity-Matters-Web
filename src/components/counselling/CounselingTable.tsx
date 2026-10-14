"use client";

import React, { useMemo } from "react";
import { HeartHandshake, RefreshCw, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminData } from "@/context/AdminDataContext";
import { AddCounselingModal } from "./AddCounselingModal";
import { SearchableCounselorSelect } from "./SearchableCounselorSelect";

export function CounselingTable() {
  const {
    counselingRequests,
    isLoading,
    counselingFilter,
    setCounselingFilter,
    updateCounselingStatus,
    deleteCounselingRequest,
  } = useAdminData();

  const filteredCounseling = useMemo(() => {
    return counselingRequests.filter((item) => {
      if (counselingFilter === "all") return true;
      return item.status === counselingFilter;
    });
  }, [counselingRequests, counselingFilter]);

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-row items-center justify-between border-b border-black/[0.06] pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Counselling Intake Management</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Manage and assign counselling requests submitted by clients.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-counseling-filter"
            className="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#202328] cursor-pointer"
            value={counselingFilter}
            onChange={(e) => setCounselingFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>

          <AddCounselingModal />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        {/* Scrollable container with sticky header */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                  Ref #
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Client
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Concern Area
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Preferred Method
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Preferred Time
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Status
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3">
                  Assigned To
                </TableHead>
                <TableHead className="text-[#202328] font-bold text-xs py-3 text-right px-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-neutral-500 text-xs"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#202328]" />
                      <span className="font-medium">Loading counselling requests...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCounseling.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-neutral-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <HeartHandshake className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-[#202328] text-sm">
                        No Counselling Bookings
                      </p>
                      <p className="text-xs text-neutral-500">
                        {counselingFilter !== "all"
                          ? `No counselling requests with status '${counselingFilter}'.`
                          : "No clients have submitted counselling booking requests yet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCounseling.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                  >
                    <TableCell className="px-4">
                      <span className="text-[#202328] font-bold text-xs bg-black/[0.04] rounded-full px-2.5 py-1 border border-black/10 font-mono">
                        {item.referenceNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[#202328] text-sm">
                        {item.clientName}
                      </div>
                      <div className="text-xs text-neutral-400 font-medium">
                        {item.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="border border-black/10 text-xs bg-white text-[#202328] font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                        {item.concern}
                      </span>
                    </TableCell>
                    <TableCell className="text-neutral-700 text-xs font-medium">
                      {item.preferredMethod}
                    </TableCell>
                    <TableCell className="text-neutral-700 text-xs font-medium">
                      {item.preferredTime}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs ${
                          item.status === "pending"
                            ? "bg-neutral-100 text-neutral-600 border border-black/10"
                            : item.status === "assigned"
                            ? "bg-[#F6CE46]/25 text-[#202328] border border-[#F6CE46]/40"
                            : item.status === "scheduled"
                            ? "bg-[#202328] text-white border border-[#202328]"
                            : "bg-[#F6CE46] text-[#202328] font-bold border border-[#F6CE46]"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-neutral-700 text-xs font-semibold">
                      {item.assignedTo || "—"}
                    </TableCell>
                    <TableCell className="text-right px-4">
                      <Dialog>
                        <DialogTrigger className="inline-flex items-center justify-center rounded-full text-xs font-semibold transition-all bg-[#202328] hover:bg-black text-white h-7 px-3.5 shadow-2xs cursor-pointer">
                          Manage
                        </DialogTrigger>
                        <DialogContent className="bg-white border border-black/[0.08] text-[#202328] max-w-md shadow-xl rounded-2xl max-h-[88vh] flex flex-col overflow-hidden">
                          {/* Top-Right 1/4th Quadrant Watermark Icon under Close button */}
                          <div className="absolute -top-18 -right-18 pointer-events-none select-none text-black/[0.05] z-0">
                            <HeartHandshake className="w-36 h-36" strokeWidth={1.2} />
                          </div>

                          <DialogHeader className="relative z-10 shrink-0">
                            <DialogTitle className="text-[#202328] font-bold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
                              <span>Manage Request {item.referenceNumber}</span>
                            </DialogTitle>
                            <DialogDescription className="text-neutral-500 text-xs">
                              Client: {item.clientName} ({item.phone})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-2 flex-1 min-h-0 overflow-y-auto pr-1">
                            <div className="p-3 bg-neutral-50/80 border border-black/[0.06] rounded-2xl text-xs space-y-1">
                              <p className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                                DESCRIPTION FROM CLIENT:
                              </p>
                              <p className="text-[#202328] leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            {/* Counselor Assignment with Searchable dropdown */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                Assign Counselor
                              </label>
                              <SearchableCounselorSelect
                                id={`manage-counselor-${item.id}`}
                                value={item.assignedTo || ""}
                                onChange={(newCounselor) =>
                                  updateCounselingStatus(
                                    item.id,
                                    item.status === "pending" && newCounselor ? "assigned" : item.status,
                                    newCounselor
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                              <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                Workflow Status
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateCounselingStatus(item.id, "scheduled")
                                  }
                                  className="text-xs rounded-full border-black/15 bg-white text-[#202328] hover:bg-neutral-50 cursor-pointer shadow-2xs font-semibold"
                                >
                                  Mark Scheduled
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateCounselingStatus(item.id, "completed")
                                  }
                                  className="text-xs bg-[#202328] hover:bg-black text-white rounded-full px-3.5 shadow-2xs cursor-pointer font-semibold border-0"
                                >
                                  Mark Completed
                                </Button>
                              </div>
                            </div>

                            {/* Delete Action */}
                            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                              <span className="text-[11px] text-neutral-400">
                                Remove request from system
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Are you sure you want to delete counselling request ${item.referenceNumber}? This action cannot be undone.`
                                    )
                                  ) {
                                    deleteCounselingRequest(item.id);
                                  }
                                }}
                                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full cursor-pointer h-7 px-3 flex items-center gap-1 font-medium transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Request</span>
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
