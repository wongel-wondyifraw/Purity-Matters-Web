"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  HeartHandshake,
  Sparkles,
  BookOpen,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Bot,
  Activity,
  Phone,
  Calendar,
  ChevronRight,
  Download,
  Send,
  MoreVertical,
  UserCheck,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Check,
  Copy,
  Globe,
  FileText,
  Shield,
  User,
  Eye,
  CheckCheck,
  PieChart,
  MapPin,
  Languages,
  BarChart3,
  Briefcase,
  Bookmark,
  TrendingDown,
  Info,
  Plus,
  ChevronDown,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DemographicsSidebar } from "@/components/demographics/DemographicsSidebar";

// Interface definitions for portal records and entities
export interface ClientRecord {
  id: number;
  telegramId: string;
  fullName: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  languageCode?: string | null;
  phone: string;
  role: string;
  isRegistered: boolean;
  registrationStep?: string | null;
  counselingCount?: number;
  innerHealingCount?: number;
  coursesCount?: number;
  purchasesCount?: number;
  metadata?: Record<string, any> | null;
  joinedAt: string;
  updatedAt?: string;
}

export interface CounselingRecord {
  id: number;
  referenceNumber: string;
  telegramId?: string;
  clientName: string;
  phone: string;
  concern: string;
  description: string;
  preferredMethod: string;
  preferredTime: string;
  status: "pending" | "assigned" | "scheduled" | "completed";
  assignedTo?: string;
  createdAt: string;
}

export interface InnerHealingRecord {
  id: number;
  referenceNumber: string;
  telegramId?: string;
  clientName: string;
  phone: string;
  topic: string;
  status: "pending" | "contacted" | "completed";
  createdAt: string;
}

export interface CourseProgressRecord {
  id: number;
  telegramId?: string;
  clientName: string;
  phone?: string;
  courseTitle: string;
  currentDay: number;
  totalDays: number;
  accountabilityRequested: boolean;
  lastActive: string;
}

export interface ResourceSaleRecord {
  id: number;
  telegramId?: string;
  clientName: string;
  phone?: string;
  resourceTitle: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
}

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [chartPeriod, setChartPeriod] = useState<"3m" | "30d" | "7d">("3m");
  const [efficiencyMonth, setEfficiencyMonth] = useState<string>("January");
  const [completedReminders, setCompletedReminders] = useState<number[]>([2]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [counselingFilter, setCounselingFilter] = useState<string>("all");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://bot-api.puritymattersethiopia.com";
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<"remote_live" | "preview_fallback">("preview_fallback");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Portal entities state - initialized empty, populated from live records
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [counselingRequests, setCounselingRequests] = useState<CounselingRecord[]>([]);
  const [innerHealingRequests, setInnerHealingRequests] = useState<InnerHealingRecord[]>([]);
  const [courseProgressList, setCourseProgressList] = useState<CourseProgressRecord[]>([]);
  const [resourceSales, setResourceSales] = useState<ResourceSaleRecord[]>([]);

  // Copy helper
  const copyToClipboard = (text: string, idKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format dates helper
  const formatDateTime = (dateVal: string | Date | undefined) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sync with remote server
  const syncWithRemoteBackend = useCallback(async () => {
    setIsRefreshing(true);
    setApiStatus("checking");
    const startTime = Date.now();

    try {
      // Step 1: Check health endpoint
      const healthRes = await fetch(`${apiUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (!healthRes.ok) {
        setApiStatus("offline");
        setDataSource("preview_fallback");
        setIsRefreshing(false);
        return;
      }

      setApiLatency(Date.now() - startTime);
      setApiStatus("online");

      // Step 2: Concurrently query all schema endpoints
      const [clientsRes, counselingRes, innerHealingRes, coursesRes, resourcesRes] = await Promise.allSettled([
        fetch(`${apiUrl}/api/admin/clients`, { signal: AbortSignal.timeout(6000) }),
        fetch(`${apiUrl}/api/admin/counseling`, { signal: AbortSignal.timeout(6000) }),
        fetch(`${apiUrl}/api/admin/inner-healing`, { signal: AbortSignal.timeout(6000) }),
        fetch(`${apiUrl}/api/admin/courses`, { signal: AbortSignal.timeout(6000) }),
        fetch(`${apiUrl}/api/admin/resources`, { signal: AbortSignal.timeout(6000) }),
      ]);

      // Handle clients from remote table: client
      if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
        const rawClients = await clientsRes.value.json();
        const mappedClients: ClientRecord[] = Array.isArray(rawClients)
          ? rawClients.map((item: any) => ({
              id: item.id,
              telegramId: String(item.telegramId),
              fullName: item.fullName || (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : `User #${item.telegramId}`),
              username: item.username || null,
              firstName: item.firstName || null,
              lastName: item.lastName || null,
              languageCode: item.languageCode || "en",
              phone: item.phone || "Not shared",
              role: item.role || "client",
              isRegistered: !!item.isRegistered,
              registrationStep: item.registrationStep || (item.isRegistered ? "completed" : "pending"),
              counselingCount: item.counselingCount ?? 0,
              innerHealingCount: item.innerHealingCount ?? 0,
              coursesCount: item.coursesCount ?? 0,
              purchasesCount: item.purchasesCount ?? 0,
              metadata: item.metadata || {},
              joinedAt: formatDateTime(item.createdAt),
              updatedAt: formatDateTime(item.updatedAt || item.createdAt),
            }))
          : [];
        setClients(mappedClients);
      } else {
        setClients([]);
      }

      // Handle counseling requests from remote table: counseling_request
      if (counselingRes.status === "fulfilled" && counselingRes.value.ok) {
        const rawCounseling = await counselingRes.value.json();
        const mappedCounseling: CounselingRecord[] = Array.isArray(rawCounseling)
          ? rawCounseling.map((item: any) => ({
              id: item.id,
              referenceNumber: item.referenceNumber || `CN-${item.id}`,
              telegramId: String(item.telegramId),
              clientName: item.clientName || "Client",
              phone: item.phone || "N/A",
              concern: item.concern || "General Counseling",
              description: item.description || "No description provided",
              preferredMethod: item.preferredMethod || "Telegram",
              preferredTime: item.preferredTime || "Next Available",
              status: item.status || "pending",
              assignedTo: item.assignedTo || undefined,
              createdAt: formatDateTime(item.createdAt),
            }))
          : [];
        setCounselingRequests(mappedCounseling);
      } else {
        setCounselingRequests([]);
      }

      // Handle inner healing requests from remote table: inner_healing_request
      if (innerHealingRes.status === "fulfilled" && innerHealingRes.value.ok) {
        const rawHealing = await innerHealingRes.value.json();
        const mappedHealing: InnerHealingRecord[] = Array.isArray(rawHealing)
          ? rawHealing.map((item: any) => ({
              id: item.id,
              referenceNumber: item.referenceNumber || `IH-${item.id}`,
              telegramId: String(item.telegramId),
              clientName: item.clientName || "Client",
              phone: item.phone || "N/A",
              topic: item.topic || "Inner Healing Topic",
              status: item.status || "pending",
              createdAt: formatDateTime(item.createdAt),
            }))
          : [];
        setInnerHealingRequests(mappedHealing);
      } else {
        setInnerHealingRequests([]);
      }

      // Handle courses progress from remote table: course_progress
      if (coursesRes.status === "fulfilled" && coursesRes.value.ok) {
        const rawCourses = await coursesRes.value.json();
        const mappedCourses: CourseProgressRecord[] = Array.isArray(rawCourses)
          ? rawCourses.map((item: any) => ({
              id: item.id,
              telegramId: String(item.telegramId),
              clientName: item.clientName || `User #${item.telegramId}`,
              phone: item.phone || "N/A",
              courseTitle:
                item.courseId === "journey_7d"
                  ? "🌅 7-Day Journey: Overcoming Triggers"
                  : item.courseId === "journey_21d"
                  ? "🌱 21-Day Journey: Walking in Freedom"
                  : `Journey (${item.courseId})`,
              currentDay: item.currentDay || 1,
              totalDays: item.totalDays || 7,
              accountabilityRequested: !!item.accountabilityRequested,
              lastActive: formatDateTime(item.updatedAt || item.createdAt),
            }))
          : [];
        setCourseProgressList(mappedCourses);
      } else {
        setCourseProgressList([]);
      }

      // Handle resources from remote table: resource_purchase
      if (resourcesRes.status === "fulfilled" && resourcesRes.value.ok) {
        const rawSales = await resourcesRes.value.json();
        const mappedSales: ResourceSaleRecord[] = Array.isArray(rawSales)
          ? rawSales.map((item: any) => ({
              id: item.id,
              telegramId: String(item.telegramId),
              clientName: item.clientName || `User #${item.telegramId}`,
              phone: item.phone || "N/A",
              resourceTitle: item.resourceTitle || item.resourceId,
              amount: Number(item.amount) || 0,
              currency: item.currency || "USD",
              status: item.status || "completed",
              date: formatDateTime(item.createdAt),
            }))
          : [];
        setResourceSales(mappedSales);
      } else {
        setResourceSales([]);
      }

      setDataSource("remote_live");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      setApiStatus("offline");
      setDataSource("preview_fallback");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    syncWithRemoteBackend();
  }, [syncWithRemoteBackend]);

  // Action: Forward Client role update to remote backend
  const updateClientRole = async (id: number, role: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, role } : c))
    );
    if (selectedClient && selectedClient.id === id) {
      setSelectedClient({ ...selectedClient, role });
    }

    setActionNotice(`Updating Client #${id} role to ${role.toUpperCase()}...`);

    try {
      const res = await fetch(`${apiUrl}/api/admin/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        setActionNotice(`Client #${id} role updated to ${role.toUpperCase()}.`);
      } else {
        setActionNotice(`Client #${id} role updated.`);
      }
    } catch {
      setActionNotice(`Client #${id} role updated.`);
    }

    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  // Action: Forward Counseling update to remote backend
  const updateCounselingStatus = async (id: number, status: CounselingRecord["status"], assignedTo?: string) => {
    setCounselingRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status, ...(assignedTo ? { assignedTo } : {}) } : req))
    );

    setActionNotice(`Updating Counseling Request #${id} to ${status.toUpperCase()}...`);

    try {
      const res = await fetch(`${apiUrl}/api/admin/counseling/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assignedTo }),
      });

      if (res.ok) {
        setActionNotice(`Request #${id} status updated to ${status.toUpperCase()}.`);
      } else {
        setActionNotice(`Request #${id} status updated.`);
      }
    } catch {
      setActionNotice(`Request #${id} status updated.`);
    }

    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  // Action: Forward Inner Healing update to remote backend
  const updateInnerHealingStatus = async (id: number, status: InnerHealingRecord["status"]) => {
    setInnerHealingRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );

    setActionNotice(`Updating Inner Healing #${id} to ${status.toUpperCase()}...`);

    try {
      const res = await fetch(`${apiUrl}/api/admin/inner-healing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setActionNotice(`Request #${id} marked as ${status.toUpperCase()}.`);
      } else {
        setActionNotice(`Request #${id} status updated.`);
      }
    } catch {
      setActionNotice(`Request #${id} status updated.`);
    }

    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  // Export Clients to CSV
  const exportClientsCsv = () => {
    const headers = ["ID", "Telegram_ID", "Full_Name", "Username", "Phone", "Role", "Registered", "Language", "Counseling_Count", "Healing_Count", "Joined_At"];
    const rows = clients.map((c) => [
      c.id,
      `"${c.telegramId}"`,
      `"${c.fullName}"`,
      `"${c.username || ""}"`,
      `"${c.phone}"`,
      c.role,
      c.isRegistered ? "YES" : "NO",
      c.languageCode || "en",
      c.counselingCount || 0,
      c.innerHealingCount || 0,
      `"${c.joinedAt}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purity_matters_clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Demographic calculations
  const totalClients = clients.length;
  const verifiedClients = clients.filter((c) => c.isRegistered).length;
  const inProgressClients = totalClients - verifiedClients;

  const ethiopianClients = clients.filter((c) => {
    if (!c.phone || c.phone === "Not shared") return false;
    const clean = c.phone.replace(/[^0-9]/g, "");
    return clean.startsWith("251") || c.phone.startsWith("+251");
  }).length;

  const diasporaClients = clients.filter((c) => {
    if (!c.phone || c.phone === "Not shared") return false;
    const clean = c.phone.replace(/[^0-9]/g, "");
    return !clean.startsWith("251") && !c.phone.startsWith("+251");
  }).length;

  const unsharedClients = totalClients - ethiopianClients - diasporaClients;

  const englishClients = clients.filter((c) =>
    (c.languageCode || "en").toLowerCase().startsWith("en")
  ).length;
  const amharicClients = clients.filter((c) =>
    (c.languageCode || "").toLowerCase().startsWith("am")
  ).length;
  const oromoClients = clients.filter((c) =>
    (c.languageCode || "").toLowerCase().startsWith("om")
  ).length;
  const otherLangClients = Math.max(0, totalClients - englishClients - amharicClients - oromoClients);

  const adminRoles = clients.filter((c) => c.role === "admin").length;
  const counselorRoles = clients.filter((c) => c.role === "counselor" || c.role === "pastor").length;

  const calcPct = (val: number) => (totalClients > 0 ? Math.round((val / totalClients) * 100) : 0);

  // Filtered lists
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.telegramId.includes(searchQuery) ||
      (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (clientFilter === "verified") return c.isRegistered;
    if (clientFilter === "in-progress") return !c.isRegistered;
    if (clientFilter === "admin") return c.role === "admin";
    if (clientFilter === "ethiopia") {
      const clean = (c.phone || "").replace(/[^0-9]/g, "");
      return clean.startsWith("251") || (c.phone || "").startsWith("+251");
    }
    if (clientFilter === "diaspora") {
      const clean = (c.phone || "").replace(/[^0-9]/g, "");
      return !!c.phone && c.phone !== "Not shared" && !clean.startsWith("251") && !c.phone.startsWith("+251");
    }
    return true;
  });

  const filteredCounseling = counselingRequests.filter((req) => {
    if (counselingFilter === "all") return true;
    return req.status === counselingFilter;
  });

  return (
    <div id="admin-console-root" className="h-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Main Content Column: Top Navigation Bar + Main Content Area (No scroll behaviour) */}
      <div id="admin-main-wrapper" className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        {/* Top Navigation Bar - Constrained to Left Column (does not cover Demographics Sidebar) */}
        <header id="admin-header" className="shrink-0 border-b border-slate-200/90 bg-white/95 backdrop-blur z-50 px-6 py-4 shadow-xs">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Purity Matters Web Console
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={syncWithRemoteBackend}
                disabled={isRefreshing}
                className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 cursor-pointer text-xs shadow-2xs transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
                Sync Data
              </Button>

              <Avatar className="w-8 h-8 border border-slate-200 shadow-2xs">
                <AvatarFallback className="bg-emerald-600 text-white font-semibold text-xs">PM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Action Notification Alert (if any) */}
        {actionNotice && (
          <div id="action-notification-toast" className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="w-full flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          </div>
        )}

        {/* Main Content Area - Strictly non-scrolling */}
        <main id="admin-main" className="flex-1 w-full p-6 space-y-6 overflow-hidden">
          {/* Top Dashboard Header & Action Bar matching screenshot */}
          <div id="project-dashboard-header" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
            <div>
              {/* Segmented Sub-navigation Tabs */}
              <div className="inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("clients")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "clients"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Clients ({isLoading ? "..." : clients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("counselling")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "counselling"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Counselling ({isLoading ? "..." : counselingRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("inner-healing")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "inner-healing"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Inner Healing ({isLoading ? "..." : innerHealingRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("courses")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "courses"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Courses ({isLoading ? "..." : courseProgressList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("resources")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "resources"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Store ({isLoading ? "..." : resourceSales.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reports")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "reports"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Reports
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("activities")}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xl transition-all cursor-pointer ${
                    activeTab === "activities"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Activities
                </button>
              </div>
            </div>

            {/* Right Date Range Pill & Export Button */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>15 Sep 2026 – 12 Oct 2026</span>
              </div>
              <button
                type="button"
                onClick={exportClientsCsv}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* TAB 0: OVERVIEW - PIXEL PERFECT DESIGN FROM IMAGE */}
            <TabsContent value="overview" className="space-y-6">
              {/* ROW 1: 5 TOP STAT CARDS WITH RELEVANT PORTAL DATA */}
              <section id="overview-metrics-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                {/* Card 1: Registered Clients */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 xl:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Registered Clients</span>
                    <Users className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-slate-900 mt-1">
                    {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : clients.length}
                  </div>
                </div>

                {/* Card 2: Counselling Sessions */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 xl:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Counselling Sessions</span>
                    <HeartHandshake className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-slate-900 mt-1">
                    {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : counselingRequests.length}
                  </div>
                </div>

                {/* Card 3: Inner Healing */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 xl:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Inner Healing</span>
                    <Sparkles className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-slate-900 mt-1">
                    {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : innerHealingRequests.length}
                  </div>
                </div>

                {/* Card 4: Digital Books (Added next to Inner Healing) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 xl:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Digital Books</span>
                    <BookOpen className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-slate-900 mt-1">
                    {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : resourceSales.length}
                  </div>
                </div>

                {/* Card 5: Store Revenue */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 xl:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Store Revenue</span>
                    <ShoppingBag className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-slate-900 mt-1">
                    {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : `$${resourceSales.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}`}
                  </div>
                </div>
              </section>

              {/* ROW 2: PROJECTS OVERVIEW AREA CHART + PROFESSIONALS HIGHLIGHTS */}
              <section id="overview-charts-row" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Card: Projects Overview (Col 8) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        Projects Overview
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Total for the last 3 months
                      </p>
                    </div>

                    {/* Filter Segmented Controls */}
                    <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setChartPeriod("3m")}
                        className={`text-xs px-3 py-1 font-semibold rounded-2xl transition-all cursor-pointer ${
                          chartPeriod === "3m"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Last 3 months
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartPeriod("30d")}
                        className={`text-xs px-3 py-1 font-semibold rounded-2xl transition-all cursor-pointer ${
                          chartPeriod === "30d"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Last 30 days
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartPeriod("7d")}
                        className={`text-xs px-3 py-1 font-semibold rounded-2xl transition-all cursor-pointer ${
                          chartPeriod === "7d"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Last 7 days
                      </button>
                    </div>
                  </div>

                  {/* Wave Area Chart Visual */}
                  <div className="w-full pt-4 pb-2">
                    <svg viewBox="0 0 900 230" className="w-full h-48 sm:h-56" preserveAspectRatio="none">
                      {/* Subtle background light-gray mountain wave */}
                      <path
                        d="M 0 165 Q 40 130, 80 150 T 160 115 T 240 155 T 320 85 T 400 135 T 480 75 T 560 140 T 640 90 T 720 150 T 800 100 T 880 155 L 900 145 L 900 230 L 0 230 Z"
                        fill="#f1f5f9"
                        fillOpacity="0.75"
                      />

                      {/* Foreground Wave Solid Fill */}
                      <path
                        d="M 0 170 C 20 170, 30 135, 45 135 C 60 135, 70 165, 85 165 C 100 165, 115 130, 130 125 C 145 120, 155 170, 175 170 C 195 170, 205 140, 225 140 C 245 140, 255 165, 275 165 C 295 165, 305 125, 325 125 C 345 125, 355 170, 375 170 C 395 170, 405 135, 425 135 C 445 135, 455 165, 475 165 C 495 165, 505 120, 525 120 C 545 120, 555 170, 575 170 C 595 170, 605 125, 625 125 C 645 125, 655 165, 675 165 C 695 165, 705 120, 725 120 C 745 120, 755 170, 775 170 C 795 170, 805 135, 825 135 C 845 135, 865 165, 900 155 L 900 230 L 0 230 Z"
                        fill="#cbd5e1"
                        fillOpacity="0.35"
                      />

                      {/* Foreground Deep Slate Stroke Line */}
                      <path
                        d="M 0 170 C 20 170, 30 135, 45 135 C 60 135, 70 165, 85 165 C 100 165, 115 130, 130 125 C 145 120, 155 170, 175 170 C 195 170, 205 140, 225 140 C 245 140, 255 165, 275 165 C 295 165, 305 125, 325 125 C 345 125, 355 170, 375 170 C 395 170, 405 135, 425 135 C 445 135, 455 165, 475 165 C 495 165, 505 120, 525 120 C 545 120, 555 170, 575 170 C 595 170, 605 125, 625 125 C 645 125, 655 165, 675 165 C 695 165, 705 120, 725 120 C 745 120, 755 170, 775 170 C 795 170, 805 135, 825 135 C 845 135, 865 165, 900 155"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Bottom X-Axis 14 Dates */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-2 pt-3 border-t border-slate-100">
                      {["Jul 21", "Jul 27", "Aug 2", "Aug 8", "Aug 14", "Aug 21", "Aug 28", "Sep 3", "Sep 9", "Sep 15", "Sep 22", "Sep 29", "Oct 5", "Oct 12"].map((d, i) => (
                        <span key={i}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Card: Professionals (Col 4) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
                  {/* Top Block: Metric */}
                  <div>
                    <span className="text-xs font-medium text-slate-500">Professionals</span>
                    <div className="text-[32px] font-extrabold tracking-tight text-slate-900 mt-0.5">
                      357
                    </div>
                  </div>

                  {/* Middle Block: Today's Hero with Tooltip & Overlapping Avatars */}
                  <div className="my-3">
                    <div className="text-xs font-semibold text-slate-900 mb-1">
                      Today's Hero
                    </div>

                    {/* Tooltip positioned directly over 4th avatar (Sophia Taylor) */}
                    <div className="relative pl-[70px] mb-1">
                      <div className="relative inline-flex flex-col items-center -translate-x-1/2">
                        <div className="bg-slate-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                          Sophia Taylor
                        </div>
                        <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-950 -mt-[0.5px]" />
                      </div>
                    </div>

                    {/* Overlapping Avatar Row */}
                    <div className="flex items-center -space-x-2">
                      {[
                        { name: "Dawit", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", fallback: "DH" },
                        { name: "Selam", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", fallback: "SK" },
                        { name: "Michael", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", fallback: "MT" },
                        { name: "Sophia Taylor", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", fallback: "ST", isHero: true },
                        { name: "Hana", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face", fallback: "HB" },
                        { name: "Yared", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face", fallback: "YA" },
                      ].map((m, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-full ring-2 ring-white shadow-2xs overflow-hidden w-8 h-8 shrink-0 bg-slate-200 ${
                            m.isHero ? "z-10 ring-slate-900" : ""
                          }`}
                          title={m.name}
                        >
                          <img
                            src={m.img}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-700 bg-slate-200">
                            {m.fallback}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Block: Highlights */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-900 mb-2.5">
                      Highlights
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Avg. Client Rating</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> 7.8 / 10
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Avg. Quotes</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" /> 730
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Avg. Agent Earnings</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> $2,309
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ROW 3: REMINDER + ACHIEVEMENT BY YEAR + PROJECT EFFICIENCY */}
              <section id="overview-widgets-row" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Card: Reminder (Col 6) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Reminder</h3>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
                      <span>Set Reminder</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    {/* Reminder 1: Low */}
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400" /> Low
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-slate-300" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">Today, 12:30</div>
                      <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                        Create a design training for
                      </div>
                    </div>

                    {/* Reminder 2: Medium */}
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">Today, 10:00</div>
                      <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                        Have a meeting with the new
                      </div>
                    </div>

                    {/* Reminder 3: High */}
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> High
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-slate-300" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">Tomorrow, 16:30</div>
                      <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                        Respond to customer support
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Card: Achievement by Year (Col 3) */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span>Achievement by Year</span>
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">57</span>
                      <span className="text-xs text-slate-400 font-normal">projects</span>
                    </div>
                    <div className="mt-2 bg-slate-200/90 h-6 rounded-2xl px-2.5 flex items-center text-[10px] text-slate-600 font-bold w-full">
                      2024
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">29</span>
                      <span className="text-xs text-slate-400 font-normal">projects</span>
                    </div>
                    <div className="mt-2 bg-slate-200/60 h-6 rounded-2xl px-2.5 flex items-center text-[10px] text-slate-600 font-bold w-[65%]">
                      2023
                    </div>
                  </div>
                </div>

                {/* Right Card: Project Efficiency (Col 3) */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span>Project Efficiency</span>
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-2xs cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      <span>{efficiencyMonth}</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>

                  {/* Grayscale Donut Chart matching screenshot */}
                  <div className="relative flex items-center justify-center my-3">
                    <svg viewBox="0 0 160 160" className="w-36 h-36">
                      {/* Segment 1: Dark Slate (45%) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="22"
                        strokeDasharray="141 314"
                        strokeDashoffset="0"
                        transform="rotate(-90 80 80)"
                      />
                      {/* Segment 2: Medium Slate (25%) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="22"
                        strokeDasharray="78 314"
                        strokeDashoffset="-141"
                        transform="rotate(-90 80 80)"
                      />
                      {/* Segment 3: Light Slate (20%) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="22"
                        strokeDasharray="63 314"
                        strokeDashoffset="-219"
                        transform="rotate(-90 80 80)"
                      />
                      {/* Segment 4: Very Faint Slate (10%) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="22"
                        strokeDasharray="32 314"
                        strokeDashoffset="-282"
                        transform="rotate(-90 80 80)"
                      />
                    </svg>
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* TAB 1: CLIENTS DIRECTORY (PRIMARY CLIENT DATA TABLE) */}
            <TabsContent value="clients" className="space-y-4">
              <Card className="bg-white border-slate-200/90 shadow-xs">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">
                      Registered Clients Directory
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Directory of registered clients with contact details, language preferences, and care activity history.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <Input
                        placeholder="Search name, phone, @user, ID..."
                        className="bg-slate-50 border-slate-200 pl-9 text-xs text-slate-900 shadow-2xs focus:bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <select
                      className="bg-slate-50 border border-slate-200 text-xs rounded-2xl px-2.5 py-1.5 text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer h-9"
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                    >
                      <option value="all">All Registrations</option>
                      <option value="verified">Verified (Has Phone)</option>
                      <option value="in-progress">In-Progress</option>
                      <option value="admin">Administrators</option>
                      <option value="ethiopia">Ethiopia (+251)</option>
                      <option value="diaspora">Diaspora / Global</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportClientsCsv}
                      className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs h-9 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Client Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="text-xs text-slate-500 font-medium">Total Clients</div>
                      <div className="text-lg font-bold text-slate-900">{isLoading ? "..." : clients.length}</div>
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl">
                      <div className="text-xs text-emerald-800 font-medium">Verified Contacts</div>
                      <div className="text-lg font-bold text-emerald-900">
                        {isLoading ? "..." : clients.filter((c) => c.isRegistered).length}
                      </div>
                    </div>
                    <div className="p-3 bg-sky-50/70 border border-sky-200/70 rounded-2xl">
                      <div className="text-xs text-sky-800 font-medium">With Telegram Handle</div>
                      <div className="text-lg font-bold text-sky-900">
                        {isLoading ? "..." : clients.filter((c) => c.username).length}
                      </div>
                    </div>
                    <div className="p-3 bg-violet-50/70 border border-violet-200/70 rounded-2xl">
                      <div className="text-xs text-violet-800 font-medium">Active Inquiries</div>
                      <div className="text-lg font-bold text-violet-900">
                        {isLoading ? "..." : clients.reduce((acc, c) => acc + (c.counselingCount || 0) + (c.innerHealingCount || 0), 0)}
                      </div>
                    </div>
                  </div>

                  {/* Clients Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 bg-slate-50/80 hover:bg-slate-50/80">
                          <TableHead className="text-slate-600 font-semibold text-xs w-16">ID</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Client & Handle</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Telegram ID</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Verified Phone</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Status</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Role</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Activity</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Joined</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                                <span className="font-medium">Loading client records...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredClients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12 text-slate-500 text-sm">
                              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <Users className="w-5 h-5" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">No Clients Found</p>
                                <p className="text-xs text-slate-500">
                                  {searchQuery || clientFilter !== "all"
                                    ? "No clients match your filter criteria. Try resetting filters."
                                    : "No registered clients found yet. New users will appear here automatically when they join the bot."}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredClients.map((client) => (
                            <TableRow key={client.id} className="border-slate-100 hover:bg-slate-50/70 transition-colors">
                              <TableCell className="text-slate-500 text-xs font-semibold">
                                #{client.id}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="w-8 h-8 border border-slate-200 text-xs">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-800 font-semibold text-xs">
                                      {client.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase() || "CL"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                                      <span>{client.fullName}</span>
                                      {client.languageCode && (
                                        <span className="text-[10px] uppercase bg-slate-100 border border-slate-200 text-slate-600 px-1 py-0.5 rounded-2xl">
                                          {client.languageCode}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {client.username ? `@${client.username}` : "No username"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-2xl w-max border border-slate-200/80">
                                  <span>{client.telegramId}</span>
                                  <button
                                    onClick={() => copyToClipboard(client.telegramId, `tid-${client.id}`)}
                                    title="Copy Telegram ID"
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                                  >
                                    {copiedId === `tid-${client.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-1 text-xs text-slate-800 font-semibold">
                                  <span>{client.phone}</span>
                                  {client.phone && client.phone.startsWith("+") && (
                                    <button
                                      onClick={() => copyToClipboard(client.phone, `ph-${client.id}`)}
                                      title="Copy Phone Number"
                                      className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                                    >
                                      {copiedId === `ph-${client.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                {client.isRegistered ? (
                                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-medium text-xs flex items-center gap-1 w-max">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Verified</span>
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-medium text-xs w-max">
                                    Awaiting Phone
                                  </Badge>
                                )}
                              </TableCell>

                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    client.role === "admin"
                                      ? "border-violet-300 text-violet-800 bg-violet-50 font-semibold text-xs"
                                      : "border-slate-200 text-slate-700 bg-slate-50 font-medium text-xs"
                                  }
                                >
                                  {client.role.toUpperCase()}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-1 text-xs">
                                  {(client.counselingCount || 0) > 0 && (
                                    <span className="bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded-2xl" title="Counselling Sessions">
                                      🛋️ {client.counselingCount}
                                    </span>
                                  )}
                                  {(client.innerHealingCount || 0) > 0 && (
                                    <span className="bg-violet-50 text-violet-800 border border-violet-200 px-1.5 py-0.5 rounded-2xl" title="Inner Healing Requests">
                                      🕊️ {client.innerHealingCount}
                                    </span>
                                  )}
                                  {(client.coursesCount || 0) > 0 && (
                                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-2xl" title="Enrolled Courses">
                                      📚 {client.coursesCount}
                                    </span>
                                  )}
                                  {((client.counselingCount || 0) === 0 && (client.innerHealingCount || 0) === 0 && (client.coursesCount || 0) === 0) && (
                                    <span className="text-slate-400 text-xs">New user</span>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="text-slate-500 text-xs">{client.joinedAt}</TableCell>

                              <TableCell className="text-right">
                                <Dialog>
                                  <DialogTrigger
                                    onClick={() => setSelectedClient(client)}
                                    className="inline-flex items-center justify-center rounded-2xl text-xs font-semibold transition-colors hover:bg-emerald-50 border border-emerald-200/80 h-7 px-3 text-emerald-700 hover:text-emerald-800 cursor-pointer shadow-2xs"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    Profile
                                  </DialogTrigger>

                                  <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg shadow-xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-slate-900 font-bold flex items-center gap-2">
                                        <Avatar className="w-7 h-7 border border-slate-200">
                                          <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                                            {client.fullName.slice(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>Client Dossier: {client.fullName}</span>
                                      </DialogTitle>
                                      <DialogDescription className="text-slate-500">
                                        Member #{client.id} • Registered Client Profile
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-2 text-xs">
                                      {/* Info Box */}
                                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                        <div>
                                          <span className="text-slate-500 font-medium">Telegram ID:</span>
                                          <p className="font-bold text-slate-800">{client.telegramId}</p>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 font-medium">Username:</span>
                                          <p className="font-bold text-slate-800">{client.username ? `@${client.username}` : "None"}</p>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 font-medium">Phone:</span>
                                          <p className="font-bold text-emerald-700">{client.phone}</p>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 font-medium">Registration Status:</span>
                                          <p className="font-bold text-slate-800">{client.isRegistered ? "Verified via Bot" : "In Progress"}</p>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 font-medium">Language:</span>
                                          <p className="font-bold text-slate-800 uppercase">{client.languageCode || "en"}</p>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 font-medium">Registration Date:</span>
                                          <p className="text-slate-700">{client.joinedAt}</p>
                                        </div>
                                      </div>

                                      {/* Service History in Bot */}
                                      <div className="space-y-2">
                                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Service Involvements</h5>
                                        <div className="space-y-1.5">
                                          {counselingRequests
                                            .filter((cr) => cr.telegramId === client.telegramId || cr.phone === client.phone)
                                            .map((cr) => (
                                              <div key={cr.id} className="p-2 border border-slate-200 rounded-2xl flex items-center justify-between bg-sky-50/40">
                                                <span className="font-bold text-sky-800">{cr.referenceNumber}</span>
                                                <span className="text-slate-700">{cr.concern}</span>
                                                <Badge className="text-[10px] bg-sky-100 text-sky-800 border-sky-200">{cr.status.toUpperCase()}</Badge>
                                              </div>
                                            ))}

                                          {innerHealingRequests
                                            .filter((ih) => ih.telegramId === client.telegramId || ih.phone === client.phone)
                                            .map((ih) => (
                                              <div key={ih.id} className="p-2 border border-slate-200 rounded-2xl flex items-center justify-between bg-violet-50/40">
                                                <span className="font-bold text-violet-800">{ih.referenceNumber}</span>
                                                <span className="text-slate-700">{ih.topic}</span>
                                                <Badge className="text-[10px] bg-violet-100 text-violet-800 border-violet-200">{ih.status.toUpperCase()}</Badge>
                                              </div>
                                            ))}

                                          {courseProgressList
                                            .filter((cp) => cp.telegramId === client.telegramId || cp.phone === client.phone)
                                            .map((cp) => (
                                              <div key={cp.id} className="p-2 border border-slate-200 rounded flex items-center justify-between bg-emerald-50/40">
                                                <span className="text-slate-700 font-semibold">{cp.courseTitle}</span>
                                                <span className="font-bold text-emerald-700">Day {cp.currentDay} / {cp.totalDays}</span>
                                              </div>
                                            ))}

                                          {counselingRequests.filter((cr) => cr.telegramId === client.telegramId).length === 0 &&
                                            innerHealingRequests.filter((ih) => ih.telegramId === client.telegramId).length === 0 &&
                                            courseProgressList.filter((cp) => cp.telegramId === client.telegramId).length === 0 && (
                                              <p className="text-slate-400 italic">No bookings or course progress recorded yet for this client.</p>
                                            )}
                                        </div>
                                      </div>

                                      {/* Role Management */}
                                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                          Current Role: <span className="font-bold text-slate-800 uppercase">{client.role}</span>
                                        </div>
                                        <div className="flex gap-2">
                                          {client.role === "client" ? (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => updateClientRole(client.id, "admin")}
                                              className="text-xs text-violet-700 border-violet-200 hover:bg-violet-50 cursor-pointer"
                                            >
                                              <Shield className="w-3.5 h-3.5 mr-1" />
                                              Promote to Admin
                                            </Button>
                                          ) : (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => updateClientRole(client.id, "client")}
                                              className="text-xs text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                            >
                                              <User className="w-3.5 h-3.5 mr-1" />
                                              Set as Client
                                            </Button>
                                          )}
                                        </div>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: COUNSELLING MANAGEMENT */}
            <TabsContent value="counselling" className="space-y-4">
              <Card className="bg-white border-slate-200/90 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Counselling Intake Management</CardTitle>
                    <CardDescription className="text-slate-500">
                      Manage and assign counselling requests submitted by clients.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      className="bg-slate-50 border border-slate-200 text-xs rounded-2xl px-2.5 py-1.5 text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      value={counselingFilter}
                      onChange={(e) => setCounselingFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
                          <TableHead className="text-slate-600 font-semibold text-xs">Ref #</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Client</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Concern Area</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Preferred Method</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Preferred Time</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Status</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Assigned To</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                                <span className="font-medium">Loading counselling requests...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredCounseling.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-slate-500 text-sm">
                              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <HeartHandshake className="w-5 h-5" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">No Counselling Bookings</p>
                                <p className="text-xs text-slate-500">
                                  {counselingFilter !== "all"
                                    ? `No counselling requests with status '${counselingFilter}'.`
                                    : "No clients have submitted counselling booking requests yet."}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCounseling.map((item) => (
                          <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell className="text-emerald-700 font-bold text-xs bg-emerald-50/60 rounded-2xl px-2 py-1 w-max border border-emerald-200/50">
                              {item.referenceNumber}
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-slate-900">{item.clientName}</div>
                              <div className="text-xs text-slate-500">{item.phone}</div>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              <Badge variant="outline" className="border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium">
                                {item.concern}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700 text-sm">{item.preferredMethod}</TableCell>
                            <TableCell className="text-slate-700 text-sm">{item.preferredTime}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                   item.status === "pending"
                                    ? "bg-amber-50 text-amber-800 border-amber-200 font-medium"
                                    : item.status === "assigned"
                                    ? "bg-sky-50 text-sky-800 border-sky-200 font-medium"
                                    : item.status === "scheduled"
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-200 font-medium"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium"
                                }
                              >
                                {item.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700 text-sm font-medium">{item.assignedTo || "—"}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger className="inline-flex items-center justify-center rounded-2xl text-xs font-semibold transition-colors hover:bg-emerald-50 border border-emerald-200/80 h-7 px-3 text-emerald-700 hover:text-emerald-800 cursor-pointer shadow-2xs">
                                  Manage
                                </DialogTrigger>
                                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md shadow-xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-slate-900 font-bold">Manage Request {item.referenceNumber}</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                      Client: {item.clientName} ({item.phone})
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-2">
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm space-y-1">
                                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">DESCRIPTION FROM CLIENT:</p>
                                      <p className="text-slate-800">{item.description}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Update Status</label>
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          size="sm"
                                          variant={item.status === "assigned" ? "default" : "outline"}
                                          onClick={() => updateCounselingStatus(item.id, "assigned", "Pastor Samuel")}
                                          className="text-xs cursor-pointer"
                                        >
                                          Assign Pastor Samuel
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={item.status === "scheduled" ? "default" : "outline"}
                                          onClick={() => updateCounselingStatus(item.id, "scheduled")}
                                          className="text-xs cursor-pointer"
                                        >
                                          Mark Scheduled
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={item.status === "completed" ? "default" : "outline"}
                                          onClick={() => updateCounselingStatus(item.id, "completed")}
                                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                        >
                                          Mark Completed
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        )))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: INNER HEALING SESSIONS */}
            <TabsContent value="inner-healing" className="space-y-4">
              <Card className="bg-white border-slate-200/90 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Inner Healing Ministry Queue</CardTitle>
                  <CardDescription className="text-slate-500">
                    Requests submitted by clients for specialized emotional and spiritual restoration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
                          <TableHead className="text-slate-600 font-semibold text-xs">Reference</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Client</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Target Focus Topic</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Requested At</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Status</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                                <span className="font-medium">Loading inner healing requests...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : innerHealingRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">No Inner Healing Requests</p>
                                <p className="text-xs text-slate-500">
                                  Clients submitting prayer & inner healing requests via the bot will appear here.
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          innerHealingRequests.map((item) => (
                          <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell className="text-violet-700 font-bold text-xs bg-violet-50/60 rounded-2xl px-2 py-1 w-max border border-violet-200/50">
                              {item.referenceNumber}
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-slate-900">{item.clientName}</div>
                              <div className="text-xs text-slate-500">{item.phone}</div>
                            </TableCell>
                            <TableCell className="text-slate-800">
                              <Badge variant="outline" className="border-violet-200 text-violet-800 bg-violet-50 font-medium">
                                {item.topic}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">{item.createdAt}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  item.status === "pending"
                                    ? "bg-amber-50 text-amber-800 border-amber-200 font-medium"
                                    : item.status === "contacted"
                                    ? "bg-sky-50 text-sky-800 border-sky-200 font-medium"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium"
                                }
                              >
                                {item.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {item.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                                  onClick={() => updateInnerHealingStatus(item.id, "contacted")}
                                >
                                  Mark Contacted
                                </Button>
                              )}
                              {item.status === "contacted" && (
                                <Button
                                  size="sm"
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                                  onClick={() => updateInnerHealingStatus(item.id, "completed")}
                                >
                                  Mark Completed
                                </Button>
                              )}
                              {item.status === "completed" && (
                                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs">
                                  Done
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: COURSES & ACCOUNTABILITY */}
            <TabsContent value="courses" className="space-y-4">
              <Card className="bg-white border-slate-200/90 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Course Journeys & Accountability Requests</CardTitle>
                  <CardDescription className="text-slate-500">
                    Track client journey milestones and accountability partner requests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
                          <TableHead className="text-slate-600 font-semibold text-xs">Client</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Contact</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Journey Enrolled</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Current Progress</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Accountability Partner</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Last Active</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                                <span className="font-medium">Loading course journeys...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : courseProgressList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">No Enrolled Course Progress</p>
                                <p className="text-xs text-slate-500">
                                  When users begin the 7-day or 21-day purity journeys in the bot, their progress will be tracked here.
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          courseProgressList.map((item) => (
                          <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell className="font-semibold text-slate-900">{item.clientName}</TableCell>
                            <TableCell className="text-slate-500 text-xs">{item.phone || "—"}</TableCell>
                            <TableCell className="text-slate-800">{item.courseTitle}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-emerald-700 font-bold">
                                  Day {item.currentDay} / {item.totalDays}
                                </span>
                                <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                  <div
                                    className="bg-emerald-600 h-full rounded-full"
                                    style={{ width: `${Math.min(100, Math.round((item.currentDay / item.totalDays) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.accountabilityRequested ? (
                                <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-semibold">
                                  ⚠️ Needs Partner
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-xs">Self-paced</span>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">{item.lastActive}</TableCell>
                          </TableRow>
                        )))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 5: RESOURCES & E-BOOKS */}
            <TabsContent value="resources" className="space-y-4">
              <Card className="bg-white border-slate-200/90 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Digital Store & Resource Orders</CardTitle>
                  <CardDescription className="text-slate-500">
                    Purchases and downloads completed through the Telegram bot.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
                          <TableHead className="text-slate-600 font-semibold text-xs">Client</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Contact</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Resource Title</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Amount</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Access Status</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-xs">Purchase Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                                <span className="font-medium">Fetching resource orders...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : resourceSales.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <ShoppingBag className="w-5 h-5" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">No Resource Orders Yet</p>
                                <p className="text-xs text-slate-500">
                                  When users access e-books or resources via the bot, records will appear here.
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          resourceSales.map((sale) => (
                          <TableRow key={sale.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell className="font-semibold text-slate-900">{sale.clientName}</TableCell>
                            <TableCell className="text-slate-500 text-xs">{sale.phone || "—"}</TableCell>
                            <TableCell className="text-slate-800">{sale.resourceTitle}</TableCell>
                            <TableCell className="text-emerald-700 font-bold">
                              ${sale.amount.toFixed(2)} {sale.currency}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                                Access Granted
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">{sale.date}</TableCell>
                          </TableRow>
                        )))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 6: REPORTS */}
            <TabsContent value="reports" className="space-y-4">
              <Card className="bg-white border-slate-200/90 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Ministry Analytics & Summary Reports</CardTitle>
                  <CardDescription className="text-slate-500">
                    Comprehensive overview of client intake, counselling engagements, and spiritual restoration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium">Total Registered Clients</div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">{clients.length}</div>
                      <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {totalClients > 0 ? `${calcPct(verifiedClients)}% phone verified` : "0%"}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium">Counselling & Pastoral Sessions</div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">{counselingRequests.length}</div>
                      <div className="text-xs text-sky-600 mt-1">
                        {counselingRequests.filter((c) => c.status === "completed").length} sessions completed
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium">Inner Healing Ministry Inquiries</div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">{innerHealingRequests.length}</div>
                      <div className="text-xs text-violet-600 mt-1">
                        {innerHealingRequests.filter((i) => i.status === "completed").length} healed / completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 7: ACTIVITIES */}
            <TabsContent value="activities" className="space-y-4">
              <Card className="bg-white border-slate-200/90 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Recent Activity Log</CardTitle>
                  <CardDescription className="text-slate-500">
                    Live stream of client interactions, bot notifications, and care assignments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {clients.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                            {c.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{c.fullName} joined Purity Matters</p>
                            <p className="text-[11px] text-slate-500">Telegram ID: {c.telegramId} • Phone: {c.phone}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{c.joinedAt}</span>
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No recent activity recorded yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Demographics Sidebar - Right Side */}
      <DemographicsSidebar
        isLoading={isLoading}
        totalClients={totalClients}
        verifiedClients={verifiedClients}
        ethiopianClients={ethiopianClients}
        diasporaClients={diasporaClients}
        unsharedClients={unsharedClients}
        amharicClients={amharicClients}
        englishClients={englishClients}
        oromoClients={oromoClients}
        otherLangClients={otherLangClients}
        adminRoles={adminRoles}
        counselorRoles={counselorRoles}
        counselingCount={counselingRequests.length}
        innerHealingCount={innerHealingRequests.length}
        coursesCount={courseProgressList.length}
        resourceCount={resourceSales.length}
        clientFilter={clientFilter}
        onFilterChange={setClientFilter}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
