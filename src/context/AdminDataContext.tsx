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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  PaymentAccountDetail,
  PaymentSettingsResponse,
  ResourceOrderRecord,
  DonationRecord,
  CourseCatalogItem,
  CourseModuleItem,
  CourseSectionItem,
  CourseMaterialItem,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateModulePayload,
  CreateSectionPayload,
  CourseEnrollmentRecord,
} from "@/types/admin";
import { ConsoleUser } from "@/types/auth";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { triggerHaptic } from "@/lib/haptic";
import {
  getApiUrl,
  fetchClientsApi,
  fetchCounselingApi,
  fetchInnerHealingApi,
  fetchCoursesApi,
  fetchResourceSalesApi,
  fetchResourceCatalogApi,
  fetchPhysicalBookOrdersApi,
  fetchSystemUsersApi,
  fetchAnonymousQuestionsApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
  createCounselingApi,
  updateCounselingStatusApi,
  deleteCounselingApi,
  updateInnerHealingStatusApi,
  createResourceApi,
  updateResourceApi,
  deleteResourceApi,
  updatePhysicalOrderStatusApi,
  answerAnonymousQuestionApi,
  deleteAnonymousQuestionApi,
  fetchPaymentSettingsApi,
  updatePaymentSettingsApi,
  fetchResourceOrdersApi,
  confirmResourceOrderPaymentApi,
  rejectResourceOrderPaymentApi,
  deletePhysicalOrderApi,
  deleteResourceOrderApi,
  fetchDonationsApi,
  verifyDonationApi,
  rejectDonationApi,
  deleteDonationApi,
  fetchCourseCatalogApi,
  fetchCourseDetailsApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
  createCourseModuleApi,
  updateCourseModuleApi,
  deleteCourseModuleApi,
  createCourseSectionApi,
  updateCourseSectionApi,
  deleteCourseSectionApi,
  uploadSectionMaterialApi,
  deleteCourseMaterialApi,
  fetchCourseEnrollmentsApi,
  verifyCourseEnrollmentPaymentApi,
  rejectCourseEnrollmentPaymentApi,
  deleteCourseEnrollmentApi,
  NewClientPayload,
} from "@/services/adminApi";

export type {
  NewResourcePayload,
  NewCounselingPayload,
  ConsoleUser,
  NewClientPayload,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateModulePayload,
  CreateSectionPayload,
};

export interface AdminDataContextType {
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
  paymentSettings: PaymentSettingsResponse | null;
  resourceOrders: ResourceOrderRecord[];
  donations: DonationRecord[];

  // Server & Connection State
  apiUrl: string;
  isRefreshing: boolean;
  isLoading: boolean;
  isClientsLoading: boolean;
  isCounselingLoading: boolean;
  isInnerHealingLoading: boolean;
  isCoursesLoading: boolean;
  isCatalogLoading: boolean;
  isOrdersLoading: boolean;
  isQuestionsLoading: boolean;
  isPaymentSettingsLoading: boolean;
  isResourceOrdersLoading: boolean;
  isDonationsLoading: boolean;

  // Filter State
  clientFilter: string;
  setClientFilter: (filter: string) => void;
  counselingFilter: string;
  setCounselingFilter: (filter: string) => void;
  donationsFilter: string;
  setDonationsFilter: (filter: string) => void;

  // Clipboard Helper
  copiedId: string | null;
  copyToClipboard: (text: string, idKey: string) => void;

  // Computed Demographics & Stats
  totalClients: number;
  verifiedClients: number;
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
  donationCount: number;
  totalDonatedAmount: number;

  // Mutations & Actions
  syncWithRemoteBackend: (manual?: boolean) => Promise<void>;
  hardRefresh: () => Promise<void>;
  addClient: (payload: NewClientPayload) => Promise<boolean>;
  updateClient: (id: number, data: Partial<ClientRecord>) => Promise<boolean>;
  deleteClient: (id: number) => Promise<boolean>;
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
  answerAnonymousQuestion: (
    id: number,
    answerText: string,
    assignedCounselor?: string,
    postToChannel?: boolean
  ) => Promise<void>;
  deleteAnonymousQuestion: (id: number) => Promise<boolean>;
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
  deletePhysicalOrder: (id: number) => Promise<boolean>;
  deleteResourceOrder: (id: number) => Promise<boolean>;
  updatePaymentSettings: (payload: {
    telebirr?: Partial<PaymentAccountDetail>;
    cbe?: Partial<PaymentAccountDetail>;
  }) => Promise<boolean>;
  confirmResourceOrderPayment: (id: number, notes?: string) => Promise<boolean>;
  rejectResourceOrderPayment: (id: number, reason?: string) => Promise<boolean>;
  verifyDonation: (id: number, adminNotes?: string) => Promise<boolean>;
  rejectDonation: (id: number, reason?: string) => Promise<boolean>;
  deleteDonation: (id: number) => Promise<boolean>;
  courseCatalog: CourseCatalogItem[];
  isCourseCatalogLoading: boolean;
  courseFilter: string;
  setCourseFilter: (filter: string) => void;
  courseEnrollments: CourseEnrollmentRecord[];
  isCourseEnrollmentsLoading: boolean;
  courseEnrollmentFilter: { courseId?: number; paymentStatus?: string; status?: string; search?: string };
  setCourseEnrollmentFilter: React.Dispatch<React.SetStateAction<{ courseId?: number; paymentStatus?: string; status?: string; search?: string }>>;
  verifyCourseEnrollment: (id: number, adminNotes?: string) => Promise<boolean>;
  rejectCourseEnrollment: (id: number, reason?: string) => Promise<boolean>;
  deleteCourseEnrollment: (id: number) => Promise<boolean>;
  addCourse: (payload: CreateCoursePayload) => Promise<boolean>;
  updateCourse: (id: number, payload: UpdateCoursePayload) => Promise<boolean>;
  deleteCourse: (id: number) => Promise<boolean>;
  addCourseModule: (courseId: number, payload: CreateModulePayload) => Promise<boolean>;
  updateCourseModule: (courseId: number, moduleId: number, payload: Partial<CreateModulePayload>) => Promise<boolean>;
  deleteCourseModule: (courseId: number, moduleId: number) => Promise<boolean>;
  addCourseSection: (courseId: number, moduleId: number, payload: CreateSectionPayload) => Promise<boolean>;
  updateCourseSection: (sectionId: number, payload: Partial<CreateSectionPayload>) => Promise<boolean>;
  deleteCourseSection: (sectionId: number) => Promise<boolean>;
  uploadCourseMaterial: (courseId: number, moduleId: number, sectionId: number, file: File, title?: string) => Promise<boolean>;
  deleteCourseMaterial: (materialId: number) => Promise<boolean>;
  exportClientsCsv: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const apiUrl = getApiUrl();
  const { isAuthenticated } = useAuth();

  // Local UI filters & clipboard state
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [counselingFilter, setCounselingFilter] = useState<string>("all");
  const [donationsFilter, setDonationsFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Clear query cache on logout or unauthorized responses to prevent cross-account data leaks
  useEffect(() => {
    const handleClearAuthData = () => {
      queryClient.cancelQueries({ queryKey: ["admin"] });
      queryClient.removeQueries({ queryKey: ["admin"] });
      queryClient.clear();
    };

    window.addEventListener("purity:logout", handleClearAuthData);
    window.addEventListener("purity:unauthorized", handleClearAuthData);
    return () => {
      window.removeEventListener("purity:logout", handleClearAuthData);
      window.removeEventListener("purity:unauthorized", handleClearAuthData);
    };
  }, [queryClient]);

  // Active window resume & PWA visibility synchronization (debounced to avoid thread congestion)
  useEffect(() => {
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResume = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && isAuthenticated) {
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["admin"], refetchType: "active" });
        }, 350);
      }
    };
    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleResume);
    window.addEventListener("online", handleResume);
    return () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
      window.removeEventListener("online", handleResume);
    };
  }, [queryClient, isAuthenticated]);

  // =================== TANSTACK QUERIES ===================
  // Optimized polling intervals: Never poll in background; responsive when visible without CPU choke
  // All queries strictly enabled ONLY when a valid user session is authenticated.

  const clientsQuery = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: fetchClientsApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 25000,
    refetchIntervalInBackground: false,
  });

  const counselingQuery = useQuery({
    queryKey: ["admin", "counseling"],
    queryFn: fetchCounselingApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const innerHealingQuery = useQuery({
    queryKey: ["admin", "inner-healing"],
    queryFn: fetchInnerHealingApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const coursesQuery = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: fetchCoursesApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 45000,
    refetchIntervalInBackground: false,
  });

  const resourceSalesQuery = useQuery({
    queryKey: ["admin", "resource-sales"],
    queryFn: fetchResourceSalesApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 25000,
    refetchIntervalInBackground: false,
  });

  const catalogQuery = useQuery({
    queryKey: ["admin", "resource-catalog"],
    queryFn: fetchResourceCatalogApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 45000,
    refetchIntervalInBackground: false,
  });

  const ordersQuery = useQuery({
    queryKey: ["admin", "physical-orders"],
    queryFn: fetchPhysicalBookOrdersApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchSystemUsersApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const questionsQuery = useQuery({
    queryKey: ["admin", "questions"],
    queryFn: fetchAnonymousQuestionsApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const paymentSettingsQuery = useQuery({
    queryKey: ["admin", "payment-settings"],
    queryFn: fetchPaymentSettingsApi,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const resourceOrdersQuery = useQuery<ResourceOrderRecord[]>({
    queryKey: ["admin", "resource-orders"],
    queryFn: () => fetchResourceOrdersApi(),
    enabled: Boolean(isAuthenticated),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const donationsQuery = useQuery<DonationRecord[]>({
    queryKey: ["admin", "donations"],
    queryFn: () => fetchDonationsApi(),
    enabled: Boolean(isAuthenticated),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const courseCatalogQuery = useQuery<CourseCatalogItem[]>({
    queryKey: ["admin", "course-catalog"],
    queryFn: () => fetchCourseCatalogApi(),
    enabled: Boolean(isAuthenticated),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const [courseFilter, setCourseFilter] = useState<string>("all");

  const [courseEnrollmentFilter, setCourseEnrollmentFilter] = useState<{
    courseId?: number;
    paymentStatus?: string;
    status?: string;
    search?: string;
  }>({
    paymentStatus: "all",
    status: "all",
  });

  const courseEnrollmentsQuery = useQuery<CourseEnrollmentRecord[]>({
    queryKey: ["admin", "course-enrollments", courseEnrollmentFilter],
    queryFn: () => fetchCourseEnrollmentsApi(courseEnrollmentFilter),
    enabled: Boolean(isAuthenticated),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const isClientsLoading = clientsQuery.isLoading;
  const isCounselingLoading = counselingQuery.isLoading;
  const isInnerHealingLoading = innerHealingQuery.isLoading;
  const isCoursesLoading = coursesQuery.isLoading;
  const isCatalogLoading = catalogQuery.isLoading;
  const isOrdersLoading = ordersQuery.isLoading;
  const isQuestionsLoading = questionsQuery.isLoading;
  const isPaymentSettingsLoading = paymentSettingsQuery.isLoading;
  const isResourceOrdersLoading = resourceOrdersQuery.isLoading;
  const isDonationsLoading = donationsQuery.isLoading;
  const isCourseCatalogLoading = courseCatalogQuery.isLoading;
  const isCourseEnrollmentsLoading = courseEnrollmentsQuery.isLoading;

  const isLoading =
    isClientsLoading ||
    isCounselingLoading ||
    isCatalogLoading ||
    isOrdersLoading ||
    isQuestionsLoading ||
    isResourceOrdersLoading ||
    isDonationsLoading ||
    isCourseCatalogLoading;

  const clients = useMemo(() => clientsQuery.data || [], [clientsQuery.data]);
  const counselingRequests = useMemo(() => counselingQuery.data || [], [counselingQuery.data]);
  const innerHealingRequests = useMemo(() => innerHealingQuery.data || [], [innerHealingQuery.data]);
  const courseProgressList = useMemo(() => coursesQuery.data || [], [coursesQuery.data]);
  const resourceSales = useMemo(() => resourceSalesQuery.data || [], [resourceSalesQuery.data]);
  const resourceCatalog = useMemo(() => catalogQuery.data || [], [catalogQuery.data]);
  const physicalBookOrders = useMemo(() => ordersQuery.data || [], [ordersQuery.data]);
  const systemUsers = useMemo(() => usersQuery.data || [], [usersQuery.data]);
  const anonymousQuestions = useMemo(() => questionsQuery.data || [], [questionsQuery.data]);
  const paymentSettings = paymentSettingsQuery.data ?? null;
  const resourceOrders = useMemo(() => resourceOrdersQuery.data || [], [resourceOrdersQuery.data]);
  const donations = useMemo(() => donationsQuery.data || [], [donationsQuery.data]);
  const courseCatalog = useMemo(() => courseCatalogQuery.data || [], [courseCatalogQuery.data]);
  const courseEnrollments = useMemo(() => courseEnrollmentsQuery.data || [], [courseEnrollmentsQuery.data]);

  // =================== MUTATIONS ===================

  const addClientMutation = useMutation({
    mutationFn: createClientApi,
    onSuccess: (newClient) => {
      queryClient.setQueryData<ClientRecord[]>(["admin", "clients"], (old = []) => [
        newClient,
        ...old,
      ]);
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      toast.success(
        "Client Added Successfully",
        `Client "${newClient.fullName}" has been registered in the database.`
      );
    },
    onError: (err: any) => {
      toast.error("Registration Error", err.message || "Failed to register client.");
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientRecord> }) =>
      updateClientApi(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.setQueryData<ClientRecord[]>(["admin", "clients"], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      toast.success("Client Updated", `Client record #${id} updated successfully.`);
    },
    onError: (err: any) => {
      toast.error("Update Error", err.message || "Failed to update client.");
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClientApi,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<ClientRecord[]>(["admin", "clients"], (old = []) =>
        old.filter((c) => c.id !== id)
      );
      await queryClient.refetchQueries({ queryKey: ["admin", "clients"] });
      queryClient.setQueryData<ClientRecord[]>(["admin", "clients"], (latest = []) =>
        latest.filter((c) => c.id !== id)
      );
      toast.success("Client Deleted", `Client #${id} deleted.`);
    },
    onError: (err: any) => {
      toast.error("Delete Error", err.message || "Failed to delete client.");
    },
  });

  const addCounselingMutation = useMutation({
    mutationFn: createCounselingApi,
    onSuccess: (newCounseling) => {
      queryClient.setQueryData<CounselingRecord[]>(["admin", "counseling"], (old = []) => [
        newCounseling,
        ...old,
      ]);
      // Also invalidate clients so walk-in clients appear immediately
      queryClient.invalidateQueries({ queryKey: ["admin", "counseling"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      toast.success(
        "Counselling Request Created",
        `Request ${newCounseling.referenceNumber} for "${newCounseling.clientName}" created successfully.`
      );
    },
    onError: (err: any) => {
      toast.error("Intake Failed", err.message || "Failed to create counseling request.");
    },
  });

  const updateCounselingMutation = useMutation({
    mutationFn: ({
      id,
      status,
      assignedTo,
    }: {
      id: number;
      status: CounselingRecord["status"];
      assignedTo?: string;
    }) => updateCounselingStatusApi(id, status, assignedTo),
    onSuccess: (_, { id, status, assignedTo }) => {
      queryClient.setQueryData<CounselingRecord[]>(["admin", "counseling"], (old = []) =>
        old.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                ...(assignedTo !== undefined ? { assignedTo } : {}),
              }
            : r
        )
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "counseling"] });
      toast.success(
        "Request Updated",
        `Counseling Request #${id} status updated to ${status.toUpperCase()}.`
      );
    },
    onError: (err: any) => {
      toast.error("Update Failed", err.message || "Failed to update status.");
    },
  });

  const deleteCounselingMutation = useMutation({
    mutationFn: deleteCounselingApi,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<CounselingRecord[]>(["admin", "counseling"], (old = []) =>
        old.filter((r) => r.id !== id)
      );
      await queryClient.refetchQueries({ queryKey: ["admin", "counseling"] });
      queryClient.setQueryData<CounselingRecord[]>(["admin", "counseling"], (latest = []) =>
        latest.filter((r) => r.id !== id)
      );
      toast.success("Request Deleted", `Counseling request #${id} has been permanently deleted.`);
    },
    onError: (err: any) => {
      toast.error("Delete Failed", err.message || "Failed to delete request.");
    },
  });

  const updateInnerHealingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: InnerHealingRecord["status"] }) =>
      updateInnerHealingStatusApi(id, status),
    onSuccess: (_, { id, status }) => {
      queryClient.setQueryData<InnerHealingRecord[]>(["admin", "inner-healing"], (old = []) =>
        old.map((r) => (r.id === id ? { ...r, status } : r))
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "inner-healing"] });
      toast.success("Request Updated", `Inner Healing #${id} marked as ${status.toUpperCase()}.`);
    },
  });

  const addResourceMutation = useMutation({
    mutationFn: createResourceApi,
    onSuccess: (newResource) => {
      queryClient.setQueryData<ResourceCatalogItem[]>(["admin", "resource-catalog"], (old = []) => [
        newResource,
        ...old,
      ]);
      queryClient.invalidateQueries({ queryKey: ["admin", "resource-catalog"] });
      toast.success("Resource Published", `"${newResource.title}" added to the catalog.`);
    },
    onError: (err: any) => {
      toast.error("Publish Failed", err.message || "Could not publish resource.");
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ResourceCatalogItem> & { file?: File | null };
    }) => updateResourceApi(id, payload),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData<ResourceCatalogItem[]>(["admin", "resource-catalog"], (old = []) =>
        old.map((r) => (r.id === id ? updated : r))
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "resource-catalog"] });
      toast.success("Resource Updated", `"${updated.title || "Resource"}" updated successfully.`);
    },
    onError: (err: any) => {
      toast.error("Update Failed", err.message || "Failed to update resource.");
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: deleteResourceApi,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<ResourceCatalogItem[]>(["admin", "resource-catalog"], (old = []) =>
        old.filter((r) => r.id !== id)
      );
      await queryClient.refetchQueries({ queryKey: ["admin", "resource-catalog"] });
      queryClient.setQueryData<ResourceCatalogItem[]>(["admin", "resource-catalog"], (latest = []) =>
        latest.filter((r) => r.id !== id)
      );
      toast.success("Resource Removed", `Resource #${id} permanently deleted.`);
    },
    onError: (err: any) => {
      toast.error("Delete Failed", err.message || "Failed to delete resource.");
    },
  });

  const updatePhysicalOrderMutation = useMutation({
    mutationFn: ({
      id,
      status,
      dispatchNotes,
    }: {
      id: number;
      status: PhysicalBookOrderItem["status"];
      dispatchNotes?: string;
    }) => updatePhysicalOrderStatusApi(id, status, dispatchNotes),
    onSuccess: (_, { id, status, dispatchNotes }) => {
      queryClient.setQueryData<PhysicalBookOrderItem[]>(["admin", "physical-orders"], (old = []) =>
        old.map((o) =>
          o.id === id
            ? {
                ...o,
                status,
                dispatchNotes: dispatchNotes !== undefined ? dispatchNotes : o.dispatchNotes,
              }
            : o
        )
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "physical-orders"] });
      toast.success("Fulfillment Updated", `Order #${id} status changed to "${status}".`);
    },
    onError: (err: any) => {
      toast.error("Update Failed", err.message || "Failed to update order status.");
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: ({
      id,
      answer,
      assignedCounselor,
      isPublic,
      postToChannel,
    }: {
      id: number;
      answer: string;
      assignedCounselor?: string;
      isPublic?: boolean;
      postToChannel?: boolean;
    }) => answerAnonymousQuestionApi(id, answer, assignedCounselor, isPublic, postToChannel),
    onSuccess: (updated) => {
      queryClient.setQueryData<AnonymousQuestionRecord[]>(["admin", "questions"], (old = []) =>
        old.map((q) => (q.id === updated.id ? updated : q))
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });

      if (updated.channelBroadcast?.success) {
        toast.success(
          "Broadcast to Channel",
          `Response for Question #${updated.referenceNumber} published to Telegram channel.`
        );
      } else if (updated.channelBroadcast?.error) {
        toast.info(
          "Channel Notice",
          `Answer saved. Channel broadcast note: ${updated.channelBroadcast.error}`
        );
      } else {
        toast.success(
          "Response Saved",
          `Pastoral response saved for Question #${updated.referenceNumber || updated.id}.`
        );
      }
    },
    onError: (err: any) => {
      toast.error("Answer Failed", err.message || "Failed to dispatch response.");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: deleteAnonymousQuestionApi,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<AnonymousQuestionRecord[]>(["admin", "questions"], (old = []) =>
        old.filter((q) => q.id !== id)
      );
      await queryClient.refetchQueries({ queryKey: ["admin", "questions"] });
      queryClient.setQueryData<AnonymousQuestionRecord[]>(["admin", "questions"], (latest = []) =>
        latest.filter((q) => q.id !== id)
      );
      toast.success(
        "Question Deleted",
        `Anonymous question #${id} permanently deleted.`
      );
    },
    onError: (err: any) => {
      toast.error("Delete Failed", err.message || "Failed to delete question.");
    },
  });

  const updatePaymentSettingsMutation = useMutation({
    mutationFn: updatePaymentSettingsApi,
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "payment-settings"], updated);
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-settings"] });
      toast.success("Payment Settings Updated", "Account numbers saved and synced with Telegram bot.");
    },
    onError: (err: any) => {
      toast.error("Update Error", err.message || "Failed to update payment settings.");
    },
  });

  const confirmOrderMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => confirmResourceOrderPaymentApi(id, notes),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resource-orders"] });
      if (data && data.dispatched === false && data.dispatchError) {
        toast.warning(
          "Payment Confirmed",
          `Payment verified, but document dispatch had an issue: ${data.dispatchError}`
        );
      } else {
        toast.success(
          "Order Confirmed & Delivered",
          "The resource file has been dispatched to the client via Telegram Bot."
        );
      }
    },
    onError: (err: any) => {
      toast.error("Fulfillment Error", err.message || "Failed to confirm payment or dispatch file.");
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => rejectResourceOrderPaymentApi(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resource-orders"] });
      toast.success("Order Rejected", "The customer has been notified on Telegram.");
    },
    onError: (err: any) => {
      toast.error("Rejection Error", err.message || "Failed to reject order.");
    },
  });

  const verifyDonationMutation = useMutation({
    mutationFn: ({ id, adminNotes }: { id: number; adminNotes?: string }) =>
      verifyDonationApi(id, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "donations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Donation Verified", "The donation has been confirmed successfully.");
    },
    onError: (err: any) => {
      toast.error("Verification Error", err.message || "Failed to verify donation.");
    },
  });

  const rejectDonationMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      rejectDonationApi(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "donations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Donation Rejected", "Donation record updated.");
    },
    onError: (err: any) => {
      toast.error("Rejection Error", err.message || "Failed to reject donation.");
    },
  });

  const deleteDonationMutation = useMutation({
    mutationFn: deleteDonationApi,
    onSuccess: (_, id) => {
      queryClient.setQueryData<DonationRecord[]>(["admin", "donations"], (old = []) =>
        old.filter((d) => d.id !== id)
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Deleted", "Donation record removed.");
    },
    onError: (err: any) => {
      toast.error("Delete Error", err.message || "Failed to delete donation.");
    },
  });

  const deletePhysicalOrderMutation = useMutation({
    mutationFn: deletePhysicalOrderApi,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<PhysicalBookOrderItem[]>(["admin", "physical-orders"], (old = []) =>
        old.filter((o) => o.id !== id)
      );
      await queryClient.refetchQueries({ queryKey: ["admin", "physical-orders"] });
      queryClient.setQueryData<PhysicalBookOrderItem[]>(["admin", "physical-orders"], (latest = []) =>
        latest.filter((o) => o.id !== id)
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "resource-sales"] });
      toast.success("Order Deleted", `Shipping order #${id} deleted.`);
    },
    onError: (err: any) => {
      toast.error("Delete Failed", err.message || "Failed to delete shipping order.");
    },
  });

  const deleteResourceOrderMutation = useMutation({
    mutationFn: deleteResourceOrderApi,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<ResourceOrderRecord[]>(["admin", "resource-orders"], (old = []) =>
        old.filter((o) => o.id !== id)
      );
      await queryClient.refetchQueries({ queryKey: ["admin", "resource-orders"] });
      queryClient.setQueryData<ResourceOrderRecord[]>(["admin", "resource-orders"], (latest = []) =>
        latest.filter((o) => o.id !== id)
      );
      toast.success("Order Deleted", `Resource order #${id} deleted.`);
    },
    onError: (err: any) => {
      toast.error("Delete Failed", err.message || "Failed to delete resource order.");
    },
  });

  // =================== WRAPPER ACTION HANDLERS ===================

  const syncWithRemoteBackend = useCallback(
    async (manual: boolean = false) => {
      setIsRefreshing(true);
      try {
        await queryClient.refetchQueries({ queryKey: ["admin"] });
        if (manual) {
          toast.success("Dashboard Synced", "All live metrics and records updated.");
        }
      } catch {
        if (manual) {
          toast.error("Sync Error", "An error occurred while fetching updates.");
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [queryClient, toast]
  );

  /**
   * Hard Refresh: Bypasses all caches, triggers tactile haptic feedback,
   * purges in-memory queries, and fetches fresh live data from the backend.
   */
  const hardRefresh = useCallback(async () => {
    triggerHaptic("medium");
    setIsRefreshing(true);
    try {
      // 1. Purge browser CacheStorage (service worker caches) if present
      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((k) => window.caches.delete(k)));
        } catch {}
      }
      // 2. Cancel any pending in-flight queries
      await queryClient.cancelQueries({ queryKey: ["admin"] });
      // 3. Completely purge in-memory query cache entries
      queryClient.removeQueries({ queryKey: ["admin"] });
      // 4. Force fresh live refetch from network with cache-busting
      await queryClient.refetchQueries({
        queryKey: ["admin"],
        type: "all",
        exact: false,
      });
      triggerHaptic("success");
      toast.success(
        "Live Data Refreshed",
        "Loaded latest bot registrations, anonymous questions, and orders."
      );
    } catch (err: any) {
      triggerHaptic("warning");
      toast.error("Refresh Issue", err.message || "Failed to load latest records.");
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, toast]);

  const addClient = useCallback(
    async (payload: NewClientPayload): Promise<boolean> => {
      try {
        await addClientMutation.mutateAsync(payload);
        return true;
      } catch {
        return false;
      }
    },
    [addClientMutation]
  );

  const updateClient = useCallback(
    async (id: number, data: Partial<ClientRecord>): Promise<boolean> => {
      try {
        await updateClientMutation.mutateAsync({ id, data });
        return true;
      } catch {
        return false;
      }
    },
    [updateClientMutation]
  );

  const deleteClient = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteClientMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteClientMutation]
  );

  const addCounselingRequest = useCallback(
    async (payload: NewCounselingPayload): Promise<boolean> => {
      try {
        await addCounselingMutation.mutateAsync(payload);
        return true;
      } catch {
        return false;
      }
    },
    [addCounselingMutation]
  );

  const updateCounselingStatus = useCallback(
    async (id: number, status: CounselingRecord["status"], assignedTo?: string) => {
      await updateCounselingMutation.mutateAsync({ id, status, assignedTo });
    },
    [updateCounselingMutation]
  );

  const deleteCounselingRequest = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteCounselingMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteCounselingMutation]
  );

  const updateInnerHealingStatus = useCallback(
    async (id: number, status: InnerHealingRecord["status"]) => {
      await updateInnerHealingMutation.mutateAsync({ id, status });
    },
    [updateInnerHealingMutation]
  );

  const addResource = useCallback(
    async (payload: NewResourcePayload): Promise<boolean> => {
      try {
        await addResourceMutation.mutateAsync(payload);
        return true;
      } catch {
        return false;
      }
    },
    [addResourceMutation]
  );

  const updateResource = useCallback(
    async (
      id: number,
      payload: Partial<ResourceCatalogItem> & { file?: File | null }
    ): Promise<boolean> => {
      try {
        await updateResourceMutation.mutateAsync({ id, payload });
        return true;
      } catch {
        return false;
      }
    },
    [updateResourceMutation]
  );

  const deleteResource = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteResourceMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteResourceMutation]
  );

  const updatePhysicalOrderStatus = useCallback(
    async (
      id: number,
      status: PhysicalBookOrderItem["status"],
      dispatchNotes?: string
    ) => {
      await updatePhysicalOrderMutation.mutateAsync({ id, status, dispatchNotes });
    },
    [updatePhysicalOrderMutation]
  );

  const answerAnonymousQuestion = useCallback(
    async (
      id: number,
      answerText: string,
      assignedCounselor?: string,
      postToChannel: boolean = false
    ) => {
      if (!answerText.trim()) return;
      try {
        await answerQuestionMutation.mutateAsync({
          id,
          answer: answerText.trim(),
          assignedCounselor: assignedCounselor || "Admin Pastoral Care",
          postToChannel,
        });
      } catch {}
    },
    [answerQuestionMutation]
  );

  const deleteAnonymousQuestion = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteQuestionMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteQuestionMutation]
  );

  const updatePaymentSettings = useCallback(
    async (payload: {
      telebirr?: Partial<PaymentAccountDetail>;
      cbe?: Partial<PaymentAccountDetail>;
    }): Promise<boolean> => {
      try {
        await updatePaymentSettingsMutation.mutateAsync(payload);
        return true;
      } catch {
        return false;
      }
    },
    [updatePaymentSettingsMutation]
  );

  const confirmResourceOrderPayment = useCallback(
    async (id: number, notes?: string): Promise<boolean> => {
      try {
        await confirmOrderMutation.mutateAsync({ id, notes });
        return true;
      } catch {
        return false;
      }
    },
    [confirmOrderMutation]
  );

  const rejectResourceOrderPayment = useCallback(
    async (id: number, reason?: string): Promise<boolean> => {
      try {
        await rejectOrderMutation.mutateAsync({ id, reason });
        return true;
      } catch {
        return false;
      }
    },
    [rejectOrderMutation]
  );

  const deletePhysicalOrder = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deletePhysicalOrderMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deletePhysicalOrderMutation]
  );

  const deleteResourceOrder = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteResourceOrderMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteResourceOrderMutation]
  );

  const verifyDonation = useCallback(
    async (id: number, adminNotes?: string): Promise<boolean> => {
      try {
        await verifyDonationMutation.mutateAsync({ id, adminNotes });
        return true;
      } catch {
        return false;
      }
    },
    [verifyDonationMutation]
  );

  const rejectDonation = useCallback(
    async (id: number, reason?: string): Promise<boolean> => {
      try {
        await rejectDonationMutation.mutateAsync({ id, reason });
        return true;
      } catch {
        return false;
      }
    },
    [rejectDonationMutation]
  );

  const deleteDonation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteDonationMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteDonationMutation]
  );

  const copyToClipboard = useCallback(
    (text: string, idKey: string) => {
      navigator.clipboard?.writeText(text);
      setCopiedId(idKey);
      toast.success("Copied to clipboard", text);
      setTimeout(() => setCopiedId(null), 2000);
    },
    [toast]
  );

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
    toast.success("CSV Export Complete", `Exported ${rows.length} client records.`);
  }, [clients, toast]);

  // =================== DEMOGRAPHIC CALCULATIONS ===================

  const totalClients = clients.length;
  const verifiedClients = useMemo(
    () => clients.filter((c) => c.isRegistered).length,
    [clients]
  );

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

  // Course Management Callbacks
  const addCourse = useCallback(
    async (payload: CreateCoursePayload) => {
      try {
        await createCourseApi(payload);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Course Created",
          description: `"${payload.name}" has been published.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Error Creating Course",
          description: err.message || "Failed to create course.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const updateCourse = useCallback(
    async (id: number, payload: UpdateCoursePayload) => {
      try {
        await updateCourseApi(id, payload);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Course Updated",
          description: "Changes saved successfully.",
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Update Error",
          description: err.message || "Failed to update course.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const deleteCourse = useCallback(
    async (id: number) => {
      try {
        await deleteCourseApi(id);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Course Deleted",
          description: `Course #${id} removed.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Delete Error",
          description: err.message || "Failed to delete course.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const addCourseModule = useCallback(
    async (courseId: number, payload: CreateModulePayload) => {
      try {
        await createCourseModuleApi(courseId, payload);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Module Added",
          description: `"${payload.title}" created.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Error Adding Module",
          description: err.message || "Failed to add module.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const updateCourseModule = useCallback(
    async (courseId: number, moduleId: number, payload: Partial<CreateModulePayload>) => {
      try {
        await updateCourseModuleApi(courseId, moduleId, payload);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Module Updated",
          description: "Module updated successfully.",
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Update Error",
          description: err.message || "Failed to update module.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const deleteCourseModule = useCallback(
    async (courseId: number, moduleId: number) => {
      try {
        await deleteCourseModuleApi(courseId, moduleId);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Module Deleted",
          description: "Module removed.",
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Delete Error",
          description: err.message || "Failed to delete module.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const addCourseSection = useCallback(
    async (courseId: number, moduleId: number, payload: CreateSectionPayload) => {
      try {
        await createCourseSectionApi(courseId, moduleId, payload);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Section Created",
          description: `"${payload.title}" created.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Error Adding Section",
          description: err.message || "Failed to create section.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const updateCourseSection = useCallback(
    async (sectionId: number, payload: Partial<CreateSectionPayload>) => {
      try {
        await updateCourseSectionApi(sectionId, payload);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Section Updated",
          description: "Section updated.",
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Update Error",
          description: err.message || "Failed to update section.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const deleteCourseSection = useCallback(
    async (sectionId: number) => {
      try {
        await deleteCourseSectionApi(sectionId);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Section Deleted",
          description: "Section removed.",
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Delete Error",
          description: err.message || "Failed to delete section.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const uploadCourseMaterial = useCallback(
    async (courseId: number, moduleId: number, sectionId: number, file: File, title?: string) => {
      try {
        await uploadSectionMaterialApi(courseId, moduleId, sectionId, file, title);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Material Uploaded",
          description: `"${file.name}" attached successfully.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Upload Error",
          description: err.message || "Failed to upload file.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const deleteCourseMaterial = useCallback(
    async (materialId: number) => {
      try {
        await deleteCourseMaterialApi(materialId);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-catalog"] });
        triggerHaptic();
        toast({
          title: "Material Removed",
          description: "File deleted successfully.",
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Delete Error",
          description: err.message || "Failed to delete material.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const verifyCourseEnrollment = useCallback(
    async (id: number, adminNotes?: string) => {
      try {
        const res = await verifyCourseEnrollmentPaymentApi(id, adminNotes);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-enrollments"] });
        triggerHaptic();
        toast({
          title: "Payment Approved",
          description: `Access granted for ${res.enrollment.clientName} in ${res.enrollment.courseName}.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Verification Error",
          description: err.message || "Failed to verify course payment.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const rejectCourseEnrollment = useCallback(
    async (id: number, reason?: string) => {
      try {
        await rejectCourseEnrollmentPaymentApi(id, reason);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-enrollments"] });
        triggerHaptic();
        toast({
          title: "Payment Rejected",
          description: `Enrollment #${id} payment marked as rejected.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Rejection Error",
          description: err.message || "Failed to reject course payment.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  const deleteCourseEnrollment = useCallback(
    async (id: number) => {
      try {
        await deleteCourseEnrollmentApi(id);
        await queryClient.invalidateQueries({ queryKey: ["admin", "course-enrollments"] });
        triggerHaptic();
        toast({
          title: "Enrollment Deleted",
          description: `Enrollment record #${id} removed successfully.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: "Delete Error",
          description: err.message || "Failed to delete enrollment.",
          type: "error",
        });
        return false;
      }
    },
    [queryClient, toast]
  );

  // =================== FULLY MEMOIZED CONTEXT VALUE ===================

  const contextValue = useMemo<AdminDataContextType>(
    () => ({
      clients,
      counselingRequests,
      innerHealingRequests,
      courseProgressList,
      courseCatalog,
      resourceSales,
      resourceCatalog,
      physicalBookOrders,
      anonymousQuestions,
      systemUsers,
      paymentSettings,
      resourceOrders,
      donations,
      apiUrl,
      isRefreshing,
      isLoading,
      isClientsLoading,
      isCounselingLoading,
      isInnerHealingLoading,
      isCoursesLoading,
      isCourseCatalogLoading,
      isCatalogLoading,
      isOrdersLoading,
      isQuestionsLoading,
      isPaymentSettingsLoading,
      isResourceOrdersLoading,
      isDonationsLoading,
      clientFilter,
      setClientFilter,
      counselingFilter,
      setCounselingFilter,
      donationsFilter,
      setDonationsFilter,
      courseFilter,
      setCourseFilter,
      copiedId,
      copyToClipboard,
      totalClients,
      verifiedClients,
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
      donationCount: donations.length,
      totalDonatedAmount: donations
        .filter((d) => d.status === "verified")
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
      syncWithRemoteBackend,
      hardRefresh,
      addClient,
      updateClient,
      deleteClient,
      updateCounselingStatus,
      addCounselingRequest,
      deleteCounselingRequest,
      updateInnerHealingStatus,
      answerAnonymousQuestion,
      deleteAnonymousQuestion,
      addResource,
      updateResource,
      updatePhysicalOrderStatus,
      deleteResource,
      updatePaymentSettings,
      confirmResourceOrderPayment,
      rejectResourceOrderPayment,
      deletePhysicalOrder,
      deleteResourceOrder,
      verifyDonation,
      rejectDonation,
      deleteDonation,
      courseEnrollments,
      isCourseEnrollmentsLoading,
      courseEnrollmentFilter,
      setCourseEnrollmentFilter,
      verifyCourseEnrollment,
      rejectCourseEnrollment,
      deleteCourseEnrollment,
      addCourse,
      updateCourse,
      deleteCourse,
      addCourseModule,
      updateCourseModule,
      deleteCourseModule,
      addCourseSection,
      updateCourseSection,
      deleteCourseSection,
      uploadCourseMaterial,
      deleteCourseMaterial,
      exportClientsCsv,
    }),
    [
      clients,
      counselingRequests,
      innerHealingRequests,
      courseProgressList,
      courseCatalog,
      courseEnrollments,
      resourceSales,
      resourceCatalog,
      physicalBookOrders,
      anonymousQuestions,
      systemUsers,
      paymentSettings,
      resourceOrders,
      donations,
      apiUrl,
      isRefreshing,
      isLoading,
      isClientsLoading,
      isCounselingLoading,
      isInnerHealingLoading,
      isCoursesLoading,
      isCourseCatalogLoading,
      isCourseEnrollmentsLoading,
      isCatalogLoading,
      isOrdersLoading,
      isQuestionsLoading,
      isPaymentSettingsLoading,
      isResourceOrdersLoading,
      isDonationsLoading,
      clientFilter,
      counselingFilter,
      donationsFilter,
      courseFilter,
      courseEnrollmentFilter,
      copiedId,
      copyToClipboard,
      totalClients,
      verifiedClients,
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
      hardRefresh,
      addClient,
      updateClient,
      deleteClient,
      updateCounselingStatus,
      addCounselingRequest,
      deleteCounselingRequest,
      updateInnerHealingStatus,
      answerAnonymousQuestion,
      deleteAnonymousQuestion,
      addResource,
      updateResource,
      updatePhysicalOrderStatus,
      deleteResource,
      updatePaymentSettings,
      confirmResourceOrderPayment,
      rejectResourceOrderPayment,
      deletePhysicalOrder,
      deleteResourceOrder,
      verifyDonation,
      rejectDonation,
      deleteDonation,
      addCourse,
      updateCourse,
      deleteCourse,
      addCourseModule,
      updateCourseModule,
      deleteCourseModule,
      addCourseSection,
      updateCourseSection,
      deleteCourseSection,
      uploadCourseMaterial,
      deleteCourseMaterial,
      exportClientsCsv,
    ]
  );

  return (
    <AdminDataContext.Provider value={contextValue}>
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
