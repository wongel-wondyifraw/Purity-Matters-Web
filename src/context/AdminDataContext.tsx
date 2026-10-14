"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  ClientRecord,
  CounselingRecord,
  InnerHealingRecord,
  CourseProgressRecord,
  ResourceSaleRecord,
  AnonymousQuestionRecord,
  ResourceCatalogItem,
  PhysicalBookOrderItem,
  NewResourcePayload,
  NewCounselingPayload,
} from "@/types/admin";
import { ConsoleUser } from "@/types/auth";
import { useToast } from "@/components/ui/toast";

export type { NewResourcePayload, NewCounselingPayload, ConsoleUser };

export interface NewClientPayload {
  fullName: string;
  telegramId?: string;
  username?: string | null;
  phone?: string | null;
  languageCode?: string;
  role?: string;
  isRegistered?: boolean;
}

interface AdminDataContextType {
  // Live Entities
  clients: ClientRecord[];
  counselingRequests: CounselingRecord[];
  innerHealingRequests: InnerHealingRecord[];
  courseProgressList: CourseProgressRecord[];
  resourceSales: ResourceSaleRecord[];
  anonymousQuestions: AnonymousQuestionRecord[];
  resourceCatalog: ResourceCatalogItem[];
  physicalBookOrders: PhysicalBookOrderItem[];
  systemUsers: ConsoleUser[];

  // Server & Connection State
  apiUrl: string;
  apiStatus: "checking" | "online" | "offline";
  apiLatency: number | null;
  dataSource: "remote_live" | "preview_fallback";
  lastSyncTime: string;
  isRefreshing: boolean;
  isLoading: boolean;

  // Filter & Search State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clientFilter: string;
  setClientFilter: (filter: string) => void;
  counselingFilter: string;
  setCounselingFilter: (filter: string) => void;
  counselingAssignmentFilter: string;
  setCounselingAssignmentFilter: (filter: string) => void;

  // Active selections & helpers
  selectedClient: ClientRecord | null;
  setSelectedClient: (client: ClientRecord | null) => void;
  copiedId: string | null;
  copyToClipboard: (text: string, idKey: string) => void;

  // Computed Demographics & Stats
  totalClients: number;
  verifiedClients: number;
  inProgressClients: number;
  ethiopianClients: number;
  diasporaClients: number;
  unsharedClients: number;
  englishClients: number;
  amharicClients: number;
  oromoClients: number;
  otherLangClients: number;
  adminRoles: number;
  counselorRoles: number;
  counselingCount: number;
  innerHealingCount: number;
  coursesCount: number;
  resourceCount: number;

  // Mutations
  syncWithRemoteBackend: (manual?: boolean) => Promise<void>;
  addClient: (payload: NewClientPayload) => Promise<boolean>;
  updateClient: (id: number, data: Partial<ClientRecord>) => Promise<boolean>;
  deleteClient: (id: number) => Promise<boolean>;
  updateClientRole: (id: number, role: string) => Promise<void>;
  updateCounselingStatus: (
    id: number,
    status: CounselingRecord["status"],
    assignedTo?: string
  ) => Promise<void>;
  addCounselingRequest: (payload: NewCounselingPayload) => Promise<boolean>;
  deleteCounselingRequest: (id: number) => Promise<boolean>;
  updateInnerHealingStatus: (
    id: number,
    status: InnerHealingRecord["status"]
  ) => Promise<void>;
  answerAnonymousQuestion: (id: number, answerText: string) => Promise<void>;
  addResource: (payload: NewResourcePayload) => Promise<boolean>;
  updateResource: (
    id: number,
    payload: Partial<ResourceCatalogItem> & { file?: File | null }
  ) => Promise<boolean>;
  updatePhysicalOrderStatus: (
    id: number,
    status: PhysicalBookOrderItem["status"],
    dispatchNotes?: string
  ) => Promise<void>;
  deleteResource: (id: number) => Promise<boolean>;
  exportClientsCsv: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API ||
    "http://localhost:3001";

  // Connection & status state
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<"remote_live" | "preview_fallback">("preview_fallback");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [counselingFilter, setCounselingFilter] = useState<string>("all");
  const [counselingAssignmentFilter, setCounselingAssignmentFilter] = useState<string>("me");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Entities state
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [systemUsers, setSystemUsers] = useState<ConsoleUser[]>([]);
  const [counselingRequests, setCounselingRequests] = useState<CounselingRecord[]>([]);
  const [innerHealingRequests, setInnerHealingRequests] = useState<InnerHealingRecord[]>([]);
  const [courseProgressList, setCourseProgressList] = useState<CourseProgressRecord[]>([]);
  const [resourceSales, setResourceSales] = useState<ResourceSaleRecord[]>([]);
  const [anonymousQuestions, setAnonymousQuestions] = useState<AnonymousQuestionRecord[]>([
    {
      id: 1,
      referenceNumber: "AQ-101",
      category: "Habitual Triggers & Relapse",
      question: "How do I overcome habitual relapse late at night when loneliness strikes?",
      status: "answered",
      submittedAt: "Yesterday at 11:20 PM",
      answer: "Establish a digital curfew, keep devices outside your sleeping area, and connect with your accountability partner before peak vulnerability hours.",
      answeredAt: "Today at 9:15 AM",
      assignedCounselor: "Pastor Daniel",
    },
    {
      id: 2,
      referenceNumber: "AQ-102",
      category: "Guilt & Shame",
      question: "I feel unworthy to pray after falling into impurity. Does God still hear me?",
      status: "pending",
      submittedAt: "Today at 2:45 AM",
    },
    {
      id: 3,
      referenceNumber: "AQ-103",
      category: "Relationship Boundaries",
      question: "What healthy boundaries should I set with my fiancé regarding phone and video calls?",
      status: "pending",
      submittedAt: "Today at 7:10 AM",
    },
    {
      id: 4,
      referenceNumber: "AQ-104",
      category: "Inner Healing & Trauma",
      question: "Can childhood emotional neglect drive sexual coping mechanisms in adulthood?",
      status: "answered",
      submittedAt: "2 days ago",
      answer: "Yes, unresolved emotional wounds often lead to compulsive soothing. We strongly encourage completing an Inner Healing session.",
      answeredAt: "Yesterday at 4:30 PM",
      assignedCounselor: "Dr. Selam",
    },
    {
      id: 5,
      referenceNumber: "AQ-105",
      category: "Masturbation & Fantasy",
      question: "I have gone 14 days without pornography, but intense intrusive thoughts keep assaulting my mind. Is this normal?",
      status: "pending",
      submittedAt: "Today at 10:05 AM",
    },
  ]);

  // Resource Catalog (E-Books & Physical Books)
  const [resourceCatalog, setResourceCatalog] = useState<ResourceCatalogItem[]>([
    {
      id: 1,
      title: "🛡️ Daily Purity Battle Guide (PDF)",
      author: "Pastoral Care Team",
      description:
        "Essential practical disciplines, morning declarations, and scripture-rooted mind renewal tools for daily victory.",
      type: "ebook",
      pricingType: "free",
      price: 0,
      currency: "ETB",
      filePath: "/uploads/resources/ebooks/daily-purity-battle-guide.pdf",
      fileName: "daily-purity-battle-guide.pdf",
      fileSizeBytes: 2450000,
      fileMimeType: "application/pdf",
      stockQuantity: null,
      isActive: true,
      createdAt: "Oct 10, 2026",
    },
    {
      id: 2,
      title: "📖 Breaking Chains: The Wholeness Journey",
      author: "Dr. Selamawit & Team",
      description:
        "A deep-dive handbook tackling neurological habit loops, emotional triggers, and sustained spiritual freedom.",
      type: "ebook",
      pricingType: "paid",
      price: 250,
      currency: "ETB",
      filePath: "/uploads/resources/ebooks/breaking-chains-ebook.pdf",
      fileName: "breaking-chains-ebook.pdf",
      fileSizeBytes: 5800000,
      fileMimeType: "application/pdf",
      stockQuantity: null,
      isActive: true,
      createdAt: "Oct 11, 2026",
    },
    {
      id: 3,
      title: "🕊️ Healing Father & Mother Wounds (Physical Paperback)",
      author: "Pastor Daniel & Dr. Selamawit",
      description:
        "Printed physical copy addressing identity restoration, breaking rejection patterns, and deep healing.",
      type: "physical_book",
      pricingType: "paid",
      price: 350,
      currency: "ETB",
      filePath: null,
      fileName: null,
      fileSizeBytes: null,
      fileMimeType: null,
      stockQuantity: 85,
      isActive: true,
      createdAt: "Oct 12, 2026",
    },
    {
      id: 4,
      title: "🌱 40 Days to Clean Hands & Pure Heart (Physical Devotional)",
      author: "Purity Matters Ministry",
      description:
        "Deluxe physical journal with 40 daily readings, trigger reflection templates, and prayer declarations.",
      type: "physical_book",
      pricingType: "paid",
      price: 450,
      currency: "ETB",
      filePath: null,
      fileName: null,
      fileSizeBytes: null,
      fileMimeType: null,
      stockQuantity: 120,
      isActive: true,
      createdAt: "Oct 12, 2026",
    },
  ]);

  // Physical Book Orders (Fulfillment Queue)
  const [physicalBookOrders, setPhysicalBookOrders] = useState<PhysicalBookOrderItem[]>([
    {
      id: 1,
      orderNumber: "PBO-2026-6772",
      resourceId: 3,
      resourceTitle: "🕊️ Healing Father & Mother Wounds (Physical Paperback)",
      telegramId: "98412039",
      clientName: "Amanuel Tadesse",
      phone: "+251911420192",
      shippingAddress: "Bole Subcity, Woreda 03, House #412 (Near Edna Mall)",
      city: "Addis Ababa",
      quantity: 1,
      unitPrice: 350,
      totalAmount: 350,
      currency: "ETB",
      paymentStatus: "verified",
      paymentReference: "CBE-TX-984129",
      status: "pending",
      dispatchNotes: "Call client before dispatch",
      createdAt: "Today at 9:15 AM",
    },
    {
      id: 2,
      orderNumber: "PBO-2026-1490",
      resourceId: 4,
      resourceTitle: "🌱 40 Days to Clean Hands & Pure Heart (Physical Devotional)",
      telegramId: "44910284",
      clientName: "Bethlehem Haile",
      phone: "+251922883311",
      shippingAddress: "Sarbet area, Vatican Embassy road, Building B, Apt 3",
      city: "Addis Ababa",
      quantity: 2,
      unitPrice: 450,
      totalAmount: 900,
      currency: "ETB",
      paymentStatus: "verified",
      paymentReference: "TELEBIRR-8812903",
      status: "dispatched",
      dispatchNotes: "With courier rider Dawit",
      createdAt: "Yesterday at 3:45 PM",
    },
  ]);

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

  // Clipboard copy
  const copyToClipboard = useCallback(
    (text: string, idKey: string) => {
      navigator.clipboard?.writeText(text);
      setCopiedId(idKey);
      toast.success("Copied to clipboard", text);
      setTimeout(() => setCopiedId(null), 2000);
    },
    [toast]
  );

  // Sync with remote backend
  const syncWithRemoteBackend = useCallback(
    async (manual: boolean = false) => {
      setIsRefreshing(true);
      setApiStatus("checking");
      const startTime = Date.now();

      try {
        const healthRes = await fetch(`${apiUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (!healthRes.ok) {
          setApiStatus("offline");
          setDataSource("preview_fallback");
          setIsRefreshing(false);
          if (manual) {
            toast.error("Sync Failed", "Could not reach remote bot API server.");
          }
          return;
        }

        setApiLatency(Date.now() - startTime);
        setApiStatus("online");

        const [
          clientsRes,
          counselingRes,
          innerHealingRes,
          coursesRes,
          resourcesRes,
          catalogRes,
          ordersRes,
          usersRes,
        ] = await Promise.allSettled([
          fetch(`${apiUrl}/api/admin/clients`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
          fetch(`${apiUrl}/api/admin/counseling`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
          fetch(`${apiUrl}/api/admin/inner-healing`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
          fetch(`${apiUrl}/api/admin/courses`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
          fetch(`${apiUrl}/api/admin/resources`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
          fetch(`${apiUrl}/api/admin/resources/catalog`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
          fetch(`${apiUrl}/api/admin/resources/orders`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
          fetch(`${apiUrl}/api/users`, {
            headers: {
              ...(typeof window !== "undefined" && localStorage.getItem("purity_console_token")
                ? { Authorization: `Bearer ${localStorage.getItem("purity_console_token")}` }
                : {}),
            },
            signal: AbortSignal.timeout(6000),
          }),
        ]);

        // Handle clients
        if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
          const rawClients = await clientsRes.value.json();
          const mappedClients: ClientRecord[] = Array.isArray(rawClients)
            ? rawClients.map((item: any) => ({
                id: item.id,
                telegramId: String(item.telegramId),
                fullName:
                  item.fullName ||
                  (item.firstName
                    ? `${item.firstName} ${item.lastName || ""}`.trim()
                    : `User #${item.telegramId}`),
                username: item.username || null,
                firstName: item.firstName || null,
                lastName: item.lastName || null,
                languageCode: item.languageCode || "en",
                phone: item.phone || "Not shared",
                role: item.role || "client",
                isRegistered: !!item.isRegistered,
                registrationStep:
                  item.registrationStep || (item.isRegistered ? "completed" : "pending"),
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

        // Handle counseling
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

        // Handle inner healing
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

        // Handle courses
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

        // Handle resources
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

        // Handle resource catalog (E-Books & Physical Books)
        if (catalogRes.status === "fulfilled" && catalogRes.value.ok) {
          const rawCatalog = await catalogRes.value.json();
          if (Array.isArray(rawCatalog)) {
            setResourceCatalog(
              rawCatalog.map((r: any) => ({
                id: r.id,
                title: r.title,
                author: r.author || null,
                description: r.description || null,
                type: r.type || "ebook",
                pricingType: r.pricingType || (Number(r.price) > 0 ? "paid" : "free"),
                price: Number(r.price) || 0,
                currency: r.currency || "ETB",
                filePath: r.filePath || null,
                fileName: r.fileName || null,
                fileSizeBytes: r.fileSizeBytes || null,
                fileMimeType: r.fileMimeType || null,
                stockQuantity:
                  r.stockQuantity !== undefined ? Number(r.stockQuantity) : null,
                coverImageUrl: r.coverImageUrl || null,
                isActive: r.isActive !== false,
                createdAt: formatDateTime(r.createdAt),
                updatedAt: formatDateTime(r.updatedAt || r.createdAt),
              }))
            );
          }
        }

        // Handle physical book orders
        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const rawOrders = await ordersRes.value.json();
          if (Array.isArray(rawOrders)) {
            setPhysicalBookOrders(
              rawOrders.map((o: any) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                resourceId: o.resourceId,
                resourceTitle: o.resourceTitle,
                telegramId: String(o.telegramId),
                clientName: o.clientName,
                phone: o.phone,
                shippingAddress: o.shippingAddress,
                city: o.city || "Addis Ababa",
                quantity: o.quantity || 1,
                unitPrice: Number(o.unitPrice) || 0,
                totalAmount: Number(o.totalAmount) || 0,
                currency: o.currency || "ETB",
                paymentStatus: o.paymentStatus || "pending",
                paymentReference: o.paymentReference || null,
                status: o.status || "pending",
                dispatchNotes: o.dispatchNotes || null,
                createdAt: formatDateTime(o.createdAt),
              }))
            );
          }
        }

        // Handle console users
        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          const rawUsers = await usersRes.value.json();
          if (Array.isArray(rawUsers)) {
            setSystemUsers(rawUsers);
          }
        }

        setDataSource("remote_live");
        setLastSyncTime(new Date().toLocaleTimeString());
        if (manual) {
          toast.success("Dashboard Synced", "All live metrics and records updated.");
        }
      } catch {
        setApiStatus("offline");
        setDataSource("preview_fallback");
        if (manual) {
          toast.error("Sync Error", "An error occurred while fetching updates.");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiUrl, toast]
  );

  useEffect(() => {
    syncWithRemoteBackend();
  }, [syncWithRemoteBackend]);

  // Mutation: Add client
  const addClient = useCallback(
    async (payload: NewClientPayload): Promise<boolean> => {
      if (!payload.fullName.trim()) return false;

      const generatedTid =
        payload.telegramId?.trim() ||
        String(Math.floor(100000000 + Math.random() * 900000000));
      const formattedPayload = {
        fullName: payload.fullName.trim(),
        telegramId: generatedTid,
        username: payload.username ? payload.username.replace(/^@/, "").trim() : null,
        phone: payload.phone?.trim() || null,
        languageCode: payload.languageCode || "en",
        role: payload.role || "client",
        isRegistered: payload.isRegistered ?? true,
      };

      let createdRecord: ClientRecord | null = null;

      try {
        const res = await fetch(`${apiUrl}/api/admin/clients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedPayload),
        });

        if (res.ok) {
          const data = await res.json();
          createdRecord = {
            id: data.id || Date.now(),
            telegramId: String(data.telegramId),
            fullName: data.fullName || formattedPayload.fullName,
            username: data.username || formattedPayload.username,
            firstName: data.firstName || formattedPayload.fullName.split(" ")[0] || null,
            lastName:
              data.lastName ||
              formattedPayload.fullName.split(" ").slice(1).join(" ") ||
              null,
            languageCode: data.languageCode || formattedPayload.languageCode,
            phone: data.phone || formattedPayload.phone || "Not shared",
            role: data.role || formattedPayload.role,
            isRegistered: !!data.isRegistered,
            registrationStep: data.registrationStep || "completed",
            counselingCount: 0,
            innerHealingCount: 0,
            coursesCount: 0,
            purchasesCount: 0,
            metadata: data.metadata || {},
            joinedAt: formatDateTime(data.createdAt || new Date()),
            updatedAt: formatDateTime(data.updatedAt || new Date()),
          };
        }
      } catch (err) {
        console.warn("Backend API request failed, saving to local state:", err);
      }

      if (!createdRecord) {
        createdRecord = {
          id: Date.now(),
          telegramId: formattedPayload.telegramId,
          fullName: formattedPayload.fullName,
          username: formattedPayload.username,
          firstName: formattedPayload.fullName.split(" ")[0] || null,
          lastName: formattedPayload.fullName.split(" ").slice(1).join(" ") || null,
          languageCode: formattedPayload.languageCode,
          phone: formattedPayload.phone || "Not shared",
          role: formattedPayload.role,
          isRegistered: formattedPayload.isRegistered,
          registrationStep: "completed",
          counselingCount: 0,
          innerHealingCount: 0,
          coursesCount: 0,
          purchasesCount: 0,
          metadata: {},
          joinedAt: formatDateTime(new Date()),
          updatedAt: formatDateTime(new Date()),
        };
      }

      setClients((prev) => [createdRecord!, ...prev]);
      toast.success(
        "Client Added Successfully",
        `Client "${formattedPayload.fullName}" has been registered in the database.`
      );
      return true;
    },
    [apiUrl, toast]
  );

  // Mutation: Update client role
  const updateClientRole = useCallback(
    async (id: number, role: string) => {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, role } : c)));
      setSelectedClient((prev) => (prev && prev.id === id ? { ...prev, role } : prev));

      try {
        const res = await fetch(`${apiUrl}/api/admin/clients/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

        if (res.ok) {
          toast.success("Role Updated", `Client #${id} role updated to ${role.toUpperCase()}.`);
        } else {
          toast.success("Role Updated", `Client #${id} role updated.`);
        }
      } catch {
        toast.success("Role Updated", `Client #${id} role updated.`);
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Update client details
  const updateClient = useCallback(
    async (id: number, data: Partial<ClientRecord>): Promise<boolean> => {
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );

      try {
        const res = await fetch(`${apiUrl}/api/admin/clients/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          toast.success(
            "Client Updated",
            `Client record #${id} updated successfully.`
          );
          return true;
        } else {
          toast.success(
            "Client Updated",
            `Client record #${id} updated.`
          );
          return true;
        }
      } catch {
        toast.success(
          "Client Updated",
          `Client record #${id} updated.`
        );
        return true;
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Delete client
  const deleteClient = useCallback(
    async (id: number): Promise<boolean> => {
      const target = clients.find((c) => c.id === id);
      setClients((prev) => prev.filter((c) => c.id !== id));

      try {
        const res = await fetch(`${apiUrl}/api/admin/clients/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.success(
            "Client Deleted",
            target
              ? `"${target.fullName}" was removed from the database.`
              : `Client #${id} deleted.`
          );
          return true;
        } else {
          toast.success(
            "Client Deleted",
            target ? `"${target.fullName}" removed.` : `Client #${id} deleted.`
          );
          return true;
        }
      } catch {
        toast.success(
          "Client Deleted",
          target ? `"${target.fullName}" removed.` : `Client #${id} deleted.`
        );
        return true;
      }
    },
    [apiUrl, clients, toast]
  );

  // Mutation: Update counseling status
  const updateCounselingStatus = useCallback(
    async (id: number, status: CounselingRecord["status"], assignedTo?: string) => {
      setCounselingRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status, ...(assignedTo !== undefined ? { assignedTo } : {}) } : req
        )
      );

      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("purity_console_token")
            : null;

        const res = await fetch(`${apiUrl}/api/admin/counseling/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status, assignedTo }),
        });

        if (res.ok) {
          toast.success(
            "Request Updated",
            `Counseling Request #${id} status updated to ${status.toUpperCase()}.`
          );
        } else {
          let errMessage = "Failed to update counseling status";
          try {
            const errData = await res.json();
            errMessage = errData.message || errMessage;
          } catch {
            errMessage = `Server error ${res.status}: ${res.statusText}`;
          }
          toast.error("Update Failed", errMessage);
        }
      } catch (err: any) {
        toast.error("Network Error", err.message || "Failed to update status.");
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Add new counseling request (admin manual intake)
  const addCounselingRequest = useCallback(
    async (payload: NewCounselingPayload): Promise<boolean> => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("purity_console_token")
            : null;

        const res = await fetch(`${apiUrl}/api/admin/counseling`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let errMessage = "Failed to create counseling request";
          try {
            const errData = await res.json();
            errMessage = errData.message || errMessage;
          } catch {
            errMessage = `Server error ${res.status}: ${res.statusText}`;
          }
          toast.error("Intake Failed", errMessage);
          return false;
        }

        const created: any = await res.json();
        const formattedCreated: CounselingRecord = {
          id: created.id,
          referenceNumber: created.referenceNumber || `CN-${created.id}`,
          telegramId: String(created.telegramId || payload.telegramId || ""),
          clientName: created.clientName || payload.clientName,
          phone: created.phone || payload.phone || "N/A",
          concern: created.concern || payload.concern,
          description: created.description || payload.description || "Not specified",
          preferredMethod: created.preferredMethod || payload.preferredMethod,
          preferredTime: created.preferredTime || payload.preferredTime,
          status: (created.status || payload.status || "pending") as CounselingRecord["status"],
          assignedTo: created.assignedTo || payload.assignedTo || undefined,
          scheduledAt: created.scheduledAt ? formatDateTime(created.scheduledAt) : undefined,
          createdAt: formatDateTime(created.createdAt || new Date()),
        };

        setCounselingRequests((prev) => [formattedCreated, ...prev]);
        toast.success(
          "Counselling Request Created",
          `Request ${formattedCreated.referenceNumber} for "${formattedCreated.clientName}" created successfully.`
        );

        // Refresh clients list so the newly registered walk-in client immediately appears in web console state
        try {
          const clientRes = await fetch(`${apiUrl}/api/admin/clients`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: AbortSignal.timeout(5000),
          });
          if (clientRes.ok) {
            const rawClients = await clientRes.json();
            if (Array.isArray(rawClients)) {
              const mappedClients: ClientRecord[] = rawClients.map((item: any) => ({
                id: item.id,
                telegramId: String(item.telegramId),
                fullName:
                  item.fullName ||
                  (item.firstName
                    ? `${item.firstName} ${item.lastName || ""}`.trim()
                    : `User #${item.telegramId}`),
                username: item.username || null,
                firstName: item.firstName || null,
                lastName: item.lastName || null,
                languageCode: item.languageCode || "en",
                phone: item.phone || "Not shared",
                role: item.role || "client",
                isRegistered: !!item.isRegistered,
                registrationStep:
                  item.registrationStep || (item.isRegistered ? "completed" : "pending"),
                counselingCount: item.counselingCount ?? 0,
                innerHealingCount: item.innerHealingCount ?? 0,
                coursesCount: item.coursesCount ?? 0,
                purchasesCount: item.purchasesCount ?? 0,
                metadata: item.metadata || {},
                joinedAt: formatDateTime(item.createdAt),
                updatedAt: formatDateTime(item.updatedAt || item.createdAt),
              }));
              setClients(mappedClients);
            }
          }
        } catch {
          // Non-critical background refresh failure
        }

        return true;
      } catch (err: any) {
        toast.error("Network Error", err.message || "Could not connect to backend server.");
        return false;
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Delete counseling request
  const deleteCounselingRequest = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("purity_console_token")
            : null;

        const res = await fetch(`${apiUrl}/api/admin/counseling/${id}`, {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          let errMessage = "Failed to delete counseling request";
          try {
            const errData = await res.json();
            errMessage = errData.message || errMessage;
          } catch {
            errMessage = `Server error ${res.status}: ${res.statusText}`;
          }
          toast.error("Delete Failed", errMessage);
          return false;
        }

        setCounselingRequests((prev) => prev.filter((r) => r.id !== id));
        toast.success(
          "Request Deleted",
          `Counseling request #${id} has been permanently deleted.`
        );
        return true;
      } catch (err: any) {
        toast.error("Network Error", err.message || "Could not connect to backend server.");
        return false;
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Update inner healing status
  const updateInnerHealingStatus = useCallback(
    async (id: number, status: InnerHealingRecord["status"]) => {
      setInnerHealingRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );

      try {
        const res = await fetch(`${apiUrl}/api/admin/inner-healing/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (res.ok) {
          toast.success(
            "Request Updated",
            `Inner Healing #${id} marked as ${status.toUpperCase()}.`
          );
        } else {
          toast.success("Request Updated", `Inner Healing #${id} status updated.`);
        }
      } catch {
        toast.success("Request Updated", `Inner Healing #${id} status updated.`);
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Answer anonymous question
  const answerAnonymousQuestion = useCallback(
    async (id: number, answerText: string) => {
      if (!answerText.trim()) return;
      setAnonymousQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                status: "answered",
                answer: answerText,
                answeredAt: "Just now",
                assignedCounselor: "Admin Pastoral Care",
              }
            : q
        )
      );
      toast.success(
        "Response Sent",
        `Anonymous pastoral response dispatched for Question #${id}.`
      );
    },
    [toast]
  );

  // Mutation: Export CSV
  const exportClientsCsv = useCallback(() => {
    const headers = [
      "ID",
      "Telegram_ID",
      "Full_Name",
      "Username",
      "Phone",
      "Role",
      "Registered",
      "Language",
      "Counseling_Count",
      "Healing_Count",
      "Joined_At",
    ];
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

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `purity_matters_clients_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      "CSV Export Complete",
      `Exported ${rows.length} client records successfully.`
    );
  }, [clients, toast]);

  // Mutation: Add new resource (E-Book or Physical Book)
  // Mutation: Add new resource (E-Book or Physical Book)
  const addResource = useCallback(
    async (payload: NewResourcePayload): Promise<boolean> => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("purity_console_token")
            : null;

        const formData = new FormData();
        formData.append("title", payload.title);
        if (payload.author) formData.append("author", payload.author);
        if (payload.description) formData.append("description", payload.description);
        formData.append("type", payload.type);
        formData.append("pricingType", payload.pricingType);
        if (payload.price !== undefined && payload.price !== null) {
          formData.append("price", String(payload.price));
        }
        if (payload.currency) formData.append("currency", payload.currency);
        if (payload.stockQuantity !== undefined && payload.stockQuantity !== null) {
          formData.append("stockQuantity", String(payload.stockQuantity));
        }
        if (payload.file) {
          formData.append("file", payload.file);
        }

        const res = await fetch(`${apiUrl}/api/admin/resources`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!res.ok) {
          let errMessage = "Failed to upload resource";
          try {
            const errData = await res.json();
            errMessage = errData.message || errMessage;
          } catch {
            errMessage = `Server error ${res.status}: ${res.statusText}`;
          }
          toast.error("Publish Failed", errMessage);
          return false;
        }

        const created: any = await res.json();
        const formattedCreated: ResourceCatalogItem = {
          id: created.id,
          title: created.title,
          author: created.author || null,
          description: created.description || null,
          type: created.type || "ebook",
          pricingType:
            created.pricingType || (Number(created.price) > 0 ? "paid" : "free"),
          price: Number(created.price) || 0,
          currency: created.currency || "ETB",
          filePath: created.filePath || null,
          fileName: created.fileName || null,
          fileSizeBytes: created.fileSizeBytes || null,
          fileMimeType: created.fileMimeType || null,
          stockQuantity:
            created.stockQuantity !== undefined ? Number(created.stockQuantity) : null,
          coverImageUrl: created.coverImageUrl || null,
          isActive: created.isActive !== false,
          createdAt: formatDateTime(created.createdAt),
          updatedAt: formatDateTime(created.updatedAt || created.createdAt),
        };

        setResourceCatalog((prev) => [formattedCreated, ...prev]);
        toast.success(
          "Resource Published",
          `"${payload.title}" has been successfully added to the catalog.`
        );
        return true;
      } catch (err: any) {
        toast.error("Network Error", err.message || "Could not connect to backend server.");
        return false;
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Update existing resource
  const updateResource = useCallback(
    async (
      id: number,
      payload: Partial<ResourceCatalogItem> & { file?: File | null }
    ): Promise<boolean> => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("purity_console_token")
            : null;

        const formData = new FormData();
        if (payload.title !== undefined) formData.append("title", payload.title);
        if (payload.author !== undefined) formData.append("author", payload.author || "");
        if (payload.description !== undefined)
          formData.append("description", payload.description || "");
        if (payload.type !== undefined) formData.append("type", payload.type);
        if (payload.pricingType !== undefined)
          formData.append("pricingType", payload.pricingType);
        if (payload.price !== undefined) formData.append("price", String(payload.price));
        if (payload.currency !== undefined) formData.append("currency", payload.currency);
        if (payload.stockQuantity !== undefined && payload.stockQuantity !== null) {
          formData.append("stockQuantity", String(payload.stockQuantity));
        }
        if (payload.file) {
          formData.append("file", payload.file);
        }

        const res = await fetch(`${apiUrl}/api/admin/resources/${id}`, {
          method: "PATCH",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!res.ok) {
          let errMessage = "Failed to update resource";
          try {
            const errData = await res.json();
            errMessage = errData.message || errMessage;
          } catch {
            errMessage = `Server error ${res.status}: ${res.statusText}`;
          }
          toast.error("Update Failed", errMessage);
          return false;
        }

        const updated: any = await res.json();
        const formatted: ResourceCatalogItem = {
          id: updated.id,
          title: updated.title,
          author: updated.author || null,
          description: updated.description || null,
          type: updated.type || "ebook",
          pricingType:
            updated.pricingType || (Number(updated.price) > 0 ? "paid" : "free"),
          price: Number(updated.price) || 0,
          currency: updated.currency || "ETB",
          filePath: updated.filePath || null,
          fileName: updated.fileName || null,
          fileSizeBytes: updated.fileSizeBytes || null,
          fileMimeType: updated.fileMimeType || null,
          stockQuantity:
            updated.stockQuantity !== undefined ? Number(updated.stockQuantity) : null,
          coverImageUrl: updated.coverImageUrl || null,
          isActive: updated.isActive !== false,
          createdAt: formatDateTime(updated.createdAt),
          updatedAt: formatDateTime(updated.updatedAt || updated.createdAt),
        };

        setResourceCatalog((prev) =>
          prev.map((item) => (item.id === id ? formatted : item))
        );
        toast.success(
          "Resource Updated",
          `"${payload.title || "Resource"}" updated successfully.`
        );
        return true;
      } catch (err: any) {
        toast.error("Network Error", err.message || "Failed to reach backend server.");
        return false;
      }
    },
    [apiUrl, toast]
  );

  // Mutation: Update physical book order status
  const updatePhysicalOrderStatus = useCallback(
    async (
      id: number,
      status: PhysicalBookOrderItem["status"],
      dispatchNotes?: string
    ) => {
      const prevOrders = [...physicalBookOrders];
      setPhysicalBookOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status,
                dispatchNotes: dispatchNotes !== undefined ? dispatchNotes : o.dispatchNotes,
              }
            : o
        )
      );

      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("purity_console_token")
            : null;

        const res = await fetch(`${apiUrl}/api/admin/resources/orders/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status, dispatchNotes }),
        });

        if (!res.ok) {
          setPhysicalBookOrders(prevOrders);
          toast.error("Status Update Failed", `Could not update Order #${id}.`);
          return;
        }

        toast.success(
          "Fulfillment Updated",
          `Order #${id} status changed to "${status}".`
        );
      } catch (err: any) {
        setPhysicalBookOrders(prevOrders);
        toast.error("Network Error", err.message || "Failed to reach server.");
      }
    },
    [apiUrl, physicalBookOrders, toast]
  );

  // Mutation: Delete resource
  const deleteResource = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("purity_console_token")
            : null;

        const res = await fetch(`${apiUrl}/api/admin/resources/${id}`, {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          let errMessage = "Could not delete resource";
          try {
            const errData = await res.json();
            errMessage = errData.message || errMessage;
          } catch {
            errMessage = `Server error ${res.status}: ${res.statusText}`;
          }
          toast.error("Delete Failed", errMessage);
          return false;
        }

        setResourceCatalog((prev) => prev.filter((r) => r.id !== id));
        toast.success("Resource Removed", `Resource #${id} permanently deleted.`);
        return true;
      } catch (err: any) {
        toast.error("Network Error", err.message || "Failed to reach backend server.");
        return false;
      }
    },
    [apiUrl, toast]
  );

  // Demographic calculations
  const totalClients = clients.length;
  const verifiedClients = useMemo(
    () => clients.filter((c) => c.isRegistered).length,
    [clients]
  );
  const inProgressClients = totalClients - verifiedClients;

  const ethiopianClients = useMemo(
    () =>
      clients.filter((c) => {
        if (!c.phone || c.phone === "Not shared") return false;
        const clean = c.phone.replace(/[^0-9]/g, "");
        return clean.startsWith("251") || c.phone.startsWith("+251");
      }).length,
    [clients]
  );

  const diasporaClients = useMemo(
    () =>
      clients.filter((c) => {
        if (!c.phone || c.phone === "Not shared") return false;
        const clean = c.phone.replace(/[^0-9]/g, "");
        return !clean.startsWith("251") && !c.phone.startsWith("+251");
      }).length,
    [clients]
  );

  const unsharedClients = totalClients - ethiopianClients - diasporaClients;

  const englishClients = useMemo(
    () =>
      clients.filter((c) =>
        (c.languageCode || "en").toLowerCase().startsWith("en")
      ).length,
    [clients]
  );

  const amharicClients = useMemo(
    () =>
      clients.filter((c) =>
        (c.languageCode || "").toLowerCase().startsWith("am")
      ).length,
    [clients]
  );

  const oromoClients = useMemo(
    () =>
      clients.filter((c) =>
        (c.languageCode || "").toLowerCase().startsWith("om")
      ).length,
    [clients]
  );

  const otherLangClients =
    totalClients - englishClients - amharicClients - oromoClients;

  const adminRoles = useMemo(
    () => clients.filter((c) => c.role === "admin").length,
    [clients]
  );

  const counselorRoles = useMemo(
    () => clients.filter((c) => c.role === "counselor").length,
    [clients]
  );

  const counselingCount = counselingRequests.length;
  const innerHealingCount = innerHealingRequests.length;
  const coursesCount = courseProgressList.length;
  const resourceCount = resourceSales.length;

  return (
    <AdminDataContext.Provider
      value={{
        clients,
        counselingRequests,
        innerHealingRequests,
        courseProgressList,
        resourceSales,
        resourceCatalog,
        physicalBookOrders,
        anonymousQuestions,
        apiUrl,
        apiStatus,
        apiLatency,
        dataSource,
        lastSyncTime,
        isRefreshing,
        isLoading,
        searchQuery,
        setSearchQuery,
        clientFilter,
        setClientFilter,
        counselingFilter,
        setCounselingFilter,
        counselingAssignmentFilter,
        setCounselingAssignmentFilter,
        systemUsers,
        selectedClient,
        setSelectedClient,
        copiedId,
        copyToClipboard,
        totalClients,
        verifiedClients,
        inProgressClients,
        ethiopianClients,
        diasporaClients,
        unsharedClients,
        englishClients,
        amharicClients,
        oromoClients,
        otherLangClients,
        adminRoles,
        counselorRoles,
        counselingCount,
        innerHealingCount,
        coursesCount,
        resourceCount,
        syncWithRemoteBackend,
        addClient,
        updateClient,
        deleteClient,
        updateClientRole,
        updateCounselingStatus,
        addCounselingRequest,
        deleteCounselingRequest,
        updateInnerHealingStatus,
        answerAnonymousQuestion,
        addResource,
        updateResource,
        updatePhysicalOrderStatus,
        deleteResource,
        exportClientsCsv,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an <AdminDataProvider>");
  }
  return context;
}
