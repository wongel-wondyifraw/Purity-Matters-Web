"use client";

import React, { useMemo } from "react";
import {
  Activity,
  HeartHandshake,
  Sparkles,
  ShoppingBag,
  BookOpen,
  UserPlus,
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

interface ActivityItem {
  id: string;
  type: "registration" | "counseling" | "inner_healing" | "resource" | "course";
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

  const activityFeed = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

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
        detail: `Issue: ${c.concern} • ${c.preferredTime}`,
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
    clients,
    counselingRequests,
    innerHealingRequests,
    resourceSales,
    courseProgressList,
  ]);

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
    }
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 border-b border-black/[0.06] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Activity & Event Stream</span>
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
              Live audit trail of registrations, counselling requests, and ministry engagements.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202328]/5 border border-black/[0.08] text-xs font-semibold text-[#202328]">
            <Activity className="w-3.5 h-3.5" />
            <span>{activityFeed.length} Events Logged</span>
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
                {activityFeed.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-neutral-500 text-xs font-medium"
                    >
                      No activity recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  activityFeed.map((item) => (
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
    </Card>
  );
}
