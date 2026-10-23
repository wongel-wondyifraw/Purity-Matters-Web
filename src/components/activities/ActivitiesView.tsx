"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  HeartHandshake,
  Sparkles,
  ShoppingBag,
  BookOpen,
  UserPlus,
  Search,
  Plus,
  Download,
  FileText,
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

interface ActivityItem {
  id: string;
  type: "registration" | "counseling" | "inner_healing" | "resource" | "course" | "note";
  title: string;
  client: string;
  detail: string;
  timestamp: string;
  badge: string;
}

export function ActivitiesView() {
  const {
    clients,
    counselingRequests,
    innerHealingRequests,
    resourceSales,
    courseProgressList,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [customActivities, setCustomActivities] = useState<ActivityItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newDetail, setNewDetail] = useState("");

  const rawActivityFeed = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [...customActivities];

    // Client Registrations
    clients.forEach((c) => {
      list.push({
        id: `reg-${c.id}`,
        type: "registration",
        title: "Client Intake",
        client: c.fullName,
        detail: `Registered via Bot (Phone: ${c.phone}, @${c.username || "n/a"})`,
        timestamp: c.joinedAt,
        badge: c.isRegistered ? "Verified" : "Pending Phone",
      });
    });

    // Counselling
    counselingRequests.forEach((c) => {
      list.push({
        id: `coun-${c.id}`,
        type: "counseling",
        title: "Counselling Intake",
        client: c.clientName,
        detail: `Issue: ${c.concern}${c.preferredMethod ? ` • ${c.preferredMethod}` : ""}`,
        timestamp: c.createdAt,
        badge: c.status.toUpperCase(),
      });
    });

    // Inner Healing
    innerHealingRequests.forEach((i) => {
      list.push({
        id: `heal-${i.id}`,
        type: "inner_healing",
        title: "Inner Healing Inquiry",
        client: i.clientName,
        detail: `Topic: ${i.topic}`,
        timestamp: i.createdAt,
        badge: i.status.toUpperCase(),
      });
    });

    // Digital Resources
    resourceSales.forEach((r) => {
      list.push({
        id: `res-${r.id}`,
        type: "resource",
        title: "Resource Access",
        client: r.clientName,
        detail: `Purchased "${r.resourceTitle}" ($${r.amount.toFixed(2)})`,
        timestamp: r.date,
        badge: "Fulfilled",
      });
    });

    // Course Progress
    courseProgressList.forEach((cp) => {
      const pct = Math.round((cp.currentDay / cp.totalDays) * 100);
      list.push({
        id: `course-${cp.id}`,
        type: "course",
        title: "Journey Milestone",
        client: cp.clientName,
        detail: `${cp.courseTitle} - Progress: ${pct}% (Day ${cp.currentDay}/${cp.totalDays})`,
        timestamp: cp.lastActive,
        badge: cp.accountabilityRequested ? "Partner Needed" : "Active",
      });
    });

    return list;
  }, [
    customActivities,
    clients,
    counselingRequests,
    innerHealingRequests,
    resourceSales,
    courseProgressList,
  ]);

  const filteredActivities = useMemo(() => {
    return rawActivityFeed.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.client.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (activityFilter !== "all" && item.type !== activityFilter) return false;

      return true;
    });
  }, [rawActivityFeed, searchQuery, activityFilter]);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newDetail.trim()) return;

    const newItem: ActivityItem = {
      id: `custom-${Date.now()}`,
      type: "note",
      title: newTitle.trim() || "Pastoral Note",
      client: newClient.trim(),
      detail: newDetail.trim(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      badge: "LOGGED",
    };

    setCustomActivities((prev) => [newItem, ...prev]);
    setNewTitle("");
    setNewClient("");
    setNewDetail("");
    setIsAddModalOpen(false);
  };

  const exportActivitiesCsv = () => {
    const headers = ["Activity Type", "Client Name", "Details", "Timestamp", "Status"];
    const rows = filteredActivities.map((a) => [
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.client.replace(/"/g, '""')}"`,
      `"${a.detail.replace(/"/g, '""')}"`,
      `"${a.timestamp}"`,
      `"${a.badge}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `purity_activities_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "registration":
        return <UserPlus className="w-3.5 h-3.5 text-[#202328]" />;
      case "counseling":
        return <HeartHandshake className="w-3.5 h-3.5 text-[#202328]" />;
      case "inner_healing":
        return <Sparkles className="w-3.5 h-3.5 text-[#202328]" />;
      case "resource":
        return <ShoppingBag className="w-3.5 h-3.5 text-[#202328]" />;
      case "course":
        return <BookOpen className="w-3.5 h-3.5 text-[#202328]" />;
      case "note":
        return <FileText className="w-3.5 h-3.5 text-[#202328]" />;
    }
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Activity & Event Stream</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Live audit trail of registrations, counselling requests, and ministry engagements.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search activity, client, detail..."
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
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option value="all">All Activities ({rawActivityFeed.length})</option>
              <option value="registration">Registrations</option>
              <option value="counseling">Counselling</option>
              <option value="inner_healing">Inner Healing</option>
              <option value="resource">Resources</option>
              <option value="course">Courses</option>
              <option value="note">Pastoral Notes</option>
            </select>

            {/* Export Action Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportActivitiesCsv}
              className="border-black/15 text-[#202328] bg-white/80 hover:bg-white text-xs h-9 px-3.5 rounded-full cursor-pointer shadow-2xs font-semibold shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-neutral-600" />
              <span>Export</span>
            </Button>

            {/* Action Button: + Activity */}
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
              <span>Activity</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        {/* Scrollable Table Container fitting viewport height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                  <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                    Activity Type
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Client Name
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Activity Details
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Timestamp
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 text-right px-4">
                    Status / Outcome
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-neutral-500 text-xs font-medium"
                    >
                      No activity matched your search query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                    >
                      <TableCell className="font-bold text-[#202328] text-xs px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#202328]/5 border border-black/10 flex items-center justify-center">
                            {getIcon(item.type)}
                          </div>
                          <span>{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#202328] font-semibold text-xs">
                        {item.client}
                      </TableCell>
                      <TableCell className="text-neutral-500 text-xs">
                        {item.detail}
                      </TableCell>
                      <TableCell className="text-neutral-400 text-xs font-medium">
                        {item.timestamp}
                      </TableCell>
                      <TableCell className="text-right px-4">
                        <span className="inline-flex items-center gap-1 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          {item.badge}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Log Activity Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-md shadow-2xl rounded-2xl p-6 overflow-hidden">
          <DialogHeader className="pb-3 border-b border-black/[0.06]">
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Log Ministry Activity</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              Record a manual pastoral note, counseling follow-up, or outreach record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddActivity} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Activity Title
              </label>
              <Input
                placeholder="e.g. Pastoral Follow-up Note"
                className="bg-white/80 border-black/10 rounded-xl h-9 text-xs"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Samuel Bekele"
                className="bg-white/80 border-black/10 rounded-xl h-9 text-xs"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Activity Details <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Enter details of conversation or ministry action..."
                className="w-full bg-white/80 border border-black/10 rounded-xl p-2.5 text-xs text-[#202328] focus:outline-none focus:ring-1 focus:ring-[#202328]"
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#202328] hover:bg-black text-[#F6CE46] rounded-full text-xs h-9 px-5 font-bold shadow-2xs"
              >
                Save Activity
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
