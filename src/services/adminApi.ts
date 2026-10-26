import {
  ClientRecord,
  CounselingRecord,
  InnerHealingRecord,
  CourseProgressRecord,
  ResourceSaleRecord,
  ResourceCatalogItem,
  PhysicalBookOrderItem,
  AnonymousQuestionRecord,
  NewResourcePayload,
  NewCounselingPayload,
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

export interface NewClientPayload {
  fullName: string;
  telegramId?: string;
  username?: string | null;
  phone?: string | null;
  languageCode?: string;
  role?: string;
  isRegistered?: boolean;
}

export const getApiUrl = () =>
  (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

export const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("purity_console_token")
    : null;

export const getAuthHeaders = (isFormData: boolean = false): HeadersInit => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Universal cache-busting fetch wrapper for all Web Console admin requests.
 * Ensures zero caching from browser, proxy, or PWA service worker so newly
 * submitted bot records, anonymous questions, and orders appear instantly.
 */
export async function adminFetch(
  endpointOrUrl: string,
  options: RequestInit = {}
): Promise<Response> {
  const base = getApiUrl();
  const rawUrl = endpointOrUrl.startsWith("http")
    ? endpointOrUrl
    : `${base}${endpointOrUrl.startsWith("/") ? endpointOrUrl : `/${endpointOrUrl}`}`;

  let finalUrl = rawUrl;
  const method = (options.method || "GET").toUpperCase();
  if (method === "GET") {
    const separator = finalUrl.includes("?") ? "&" : "?";
    finalUrl = `${finalUrl}${separator}_t=${Date.now()}`;
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const authHeaders = getAuthHeaders(isFormData);

  return fetch(finalUrl, {
    ...options,
    cache: "no-store",
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });
}

export const formatDateTime = (dateVal: string | Date | undefined) => {
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

// =================== FETCHERS ===================

export async function fetchClientsApi(): Promise<ClientRecord[]> {
  const res = await adminFetch("/api/admin/clients");
  if (!res.ok) throw new Error(`Failed to fetch clients: ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
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
}

export async function fetchCounselingApi(): Promise<CounselingRecord[]> {
  const res = await adminFetch("/api/admin/counseling");
  if (!res.ok) throw new Error(`Failed to fetch counseling: ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
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
    scheduledAt: item.scheduledAt ? formatDateTime(item.scheduledAt) : undefined,
    createdAt: formatDateTime(item.createdAt),
  }));
}

export async function fetchInnerHealingApi(): Promise<InnerHealingRecord[]> {
  const res = await adminFetch("/api/admin/inner-healing");
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    id: item.id,
    referenceNumber: item.referenceNumber || `IH-${item.id}`,
    telegramId: String(item.telegramId),
    clientName: item.clientName || "Client",
    phone: item.phone || "N/A",
    topic: item.topic || "Inner Healing Topic",
    status: item.status || "pending",
    createdAt: formatDateTime(item.createdAt),
  }));
}

export async function fetchCoursesApi(): Promise<CourseProgressRecord[]> {
  const res = await adminFetch("/api/admin/courses");
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
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
  }));
}

export async function fetchResourceSalesApi(): Promise<ResourceSaleRecord[]> {
  const res = await adminFetch("/api/admin/resources");
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    id: item.id,
    telegramId: String(item.telegramId),
    clientName: item.clientName || `User #${item.telegramId}`,
    phone: item.phone || "N/A",
    resourceTitle: item.resourceTitle || item.resourceId,
    amount: Number(item.amount) || 0,
    currency: item.currency || "USD",
    status: item.status || "completed",
    date: formatDateTime(item.createdAt),
  }));
}

export async function fetchResourceCatalogApi(): Promise<ResourceCatalogItem[]> {
  const res = await adminFetch("/api/admin/resources/catalog");
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((r: any) => ({
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
    stockQuantity: r.stockQuantity !== undefined ? Number(r.stockQuantity) : null,
    coverImageUrl: r.coverImageUrl || null,
    isActive: r.isActive !== false,
    createdAt: formatDateTime(r.createdAt),
    updatedAt: formatDateTime(r.updatedAt || r.createdAt),
  }));
}

export async function fetchPhysicalBookOrdersApi(): Promise<PhysicalBookOrderItem[]> {
  const res = await adminFetch("/api/admin/resources/orders");
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((o: any) => ({
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
  }));
}

export async function fetchSystemUsersApi(): Promise<ConsoleUser[]> {
  const res = await adminFetch("/api/users");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchAnonymousQuestionsApi(): Promise<AnonymousQuestionRecord[]> {
  const res = await adminFetch("/api/admin/questions");
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((q: any) => ({
    id: q.id,
    referenceNumber: q.referenceNumber || `AQ-${q.id}`,
    category: q.category || "General",
    question: q.question,
    status: q.status || "pending",
    submittedAt: formatDateTime(q.createdAt),
    answer: q.answer || undefined,
    answeredAt: q.answeredAt ? formatDateTime(q.answeredAt) : undefined,
    assignedCounselor: q.assignedCounselor || undefined,
  }));
}

// =================== MUTATIONS ===================

export async function createClientApi(payload: NewClientPayload): Promise<ClientRecord> {
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

  const res = await adminFetch("/api/admin/clients", {
    method: "POST",
    body: JSON.stringify(formattedPayload),
  });

  if (!res.ok) {
    throw new Error(`Failed to add client: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    id: data.id || Date.now(),
    telegramId: String(data.telegramId),
    fullName: data.fullName || formattedPayload.fullName,
    username: data.username || formattedPayload.username,
    firstName: data.firstName || formattedPayload.fullName.split(" ")[0] || null,
    lastName: data.lastName || formattedPayload.fullName.split(" ").slice(1).join(" ") || null,
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

export async function updateClientApi(id: number, data: Partial<ClientRecord>): Promise<void> {
  const res = await adminFetch(`/api/admin/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update client #${id}`);
}

export async function deleteClientApi(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/clients/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete client #${id}`);
}

export async function createCounselingApi(payload: NewCounselingPayload): Promise<CounselingRecord> {
  const res = await adminFetch("/api/admin/counseling", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let errMessage = "Failed to create counseling request";
    try {
      const errData = await res.json();
      errMessage = errData.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }
  const created = await res.json();
  return {
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
}

export async function updateCounselingStatusApi(
  id: number,
  status: CounselingRecord["status"],
  assignedTo?: string
): Promise<void> {
  const res = await adminFetch(`/api/admin/counseling/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, assignedTo }),
  });
  if (!res.ok) throw new Error(`Failed to update counseling request #${id}`);
}

export async function deleteCounselingApi(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/counseling/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete counseling request #${id}`);
}

export async function updateInnerHealingStatusApi(
  id: number,
  status: InnerHealingRecord["status"]
): Promise<void> {
  const res = await adminFetch(`/api/admin/inner-healing/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update inner healing #${id}`);
}

export async function createResourceApi(payload: NewResourcePayload): Promise<ResourceCatalogItem> {
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

  const res = await adminFetch("/api/admin/resources", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errMessage = "Failed to upload resource";
    try {
      const errData = await res.json();
      errMessage = errData.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  const created = await res.json();
  return {
    id: created.id,
    title: created.title,
    author: created.author || null,
    description: created.description || null,
    type: created.type || "ebook",
    pricingType: created.pricingType || (Number(created.price) > 0 ? "paid" : "free"),
    price: Number(created.price) || 0,
    currency: created.currency || "ETB",
    filePath: created.filePath || null,
    fileName: created.fileName || null,
    fileSizeBytes: created.fileSizeBytes || null,
    fileMimeType: created.fileMimeType || null,
    stockQuantity: created.stockQuantity !== undefined ? Number(created.stockQuantity) : null,
    coverImageUrl: created.coverImageUrl || null,
    isActive: created.isActive !== false,
    createdAt: formatDateTime(created.createdAt),
    updatedAt: formatDateTime(updatedAtDateTime(created.updatedAt || created.createdAt)),
  };
}

function updatedAtDateTime(val: any) {
  return val;
}

export async function updateResourceApi(
  id: number,
  payload: Partial<ResourceCatalogItem> & { file?: File | null }
): Promise<ResourceCatalogItem> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.author !== undefined) formData.append("author", payload.author || "");
  if (payload.description !== undefined) formData.append("description", payload.description || "");
  if (payload.type !== undefined) formData.append("type", payload.type);
  if (payload.pricingType !== undefined) formData.append("pricingType", payload.pricingType);
  if (payload.price !== undefined) formData.append("price", String(payload.price));
  if (payload.currency !== undefined) formData.append("currency", payload.currency);
  if (payload.stockQuantity !== undefined && payload.stockQuantity !== null) {
    formData.append("stockQuantity", String(payload.stockQuantity));
  }
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await adminFetch(`/api/admin/resources/${id}`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    let errMessage = "Failed to update resource";
    try {
      const errData = await res.json();
      errMessage = errData.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  const updated = await res.json();
  return {
    id: updated.id,
    title: updated.title,
    author: updated.author || null,
    description: updated.description || null,
    type: updated.type || "ebook",
    pricingType: updated.pricingType || (Number(updated.price) > 0 ? "paid" : "free"),
    price: Number(updated.price) || 0,
    currency: updated.currency || "ETB",
    filePath: updated.filePath || null,
    fileName: updated.fileName || null,
    fileSizeBytes: updated.fileSizeBytes || null,
    fileMimeType: updated.fileMimeType || null,
    stockQuantity: updated.stockQuantity !== undefined ? Number(updated.stockQuantity) : null,
    coverImageUrl: updated.coverImageUrl || null,
    isActive: updated.isActive !== false,
    createdAt: formatDateTime(updated.createdAt),
    updatedAt: formatDateTime(updated.updatedAt || updated.createdAt),
  };
}

export async function deleteResourceApi(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/resources/${id}`, {
    method: "DELETE",
  });
  // If the resource is already gone or does not exist on server (404), treat as successfully removed from UI
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete resource #${id}`);
  }
}

export async function updatePhysicalOrderStatusApi(
  id: number,
  status: PhysicalBookOrderItem["status"],
  dispatchNotes?: string
): Promise<void> {
  const res = await adminFetch(`/api/admin/resources/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, dispatchNotes }),
  });
  if (!res.ok) throw new Error(`Failed to update order #${id}`);
}

export async function answerAnonymousQuestionApi(
  id: number,
  answer: string,
  assignedCounselor?: string,
  isPublic: boolean = true,
  postToChannel: boolean = false
): Promise<AnonymousQuestionRecord & { channelBroadcast?: { success: boolean; messageId?: number; error?: string } | null }> {
  const res = await adminFetch(`/api/admin/questions/${id}/answer`, {
    method: "PATCH",
    body: JSON.stringify({ answer, assignedCounselor, isPublic, postToChannel }),
  });
  if (!res.ok) {
    let errMessage = `Failed to answer question #${id}`;
    try {
      const errData = await res.json();
      errMessage = errData.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }
  const q = await res.json();
  return {
    id: q.id,
    referenceNumber: q.referenceNumber || `AQ-${q.id}`,
    category: q.category || "General",
    question: q.question,
    status: q.status || "answered",
    submittedAt: formatDateTime(q.createdAt),
    answer: q.answer,
    answeredAt: formatDateTime(q.answeredAt),
    assignedCounselor: q.assignedCounselor,
    postedToChannel: q.postedToChannel,
    telegramMessageId: q.telegramMessageId,
    postedToChannelAt: q.postedToChannelAt ? formatDateTime(q.postedToChannelAt) : undefined,
    channelBroadcast: q.channelBroadcast,
  };
}

export async function deleteAnonymousQuestionApi(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/questions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete question #${id}`);
}

// =================== PAYMENT SETTINGS (Telebirr & CBE) ===================

export async function fetchPaymentSettingsApi(): Promise<PaymentSettingsResponse> {
  const res = await adminFetch("/api/admin/payment-settings");
  if (!res.ok) throw new Error("Failed to load payment account settings");
  return res.json();
}

export async function updatePaymentSettingsApi(payload: {
  telebirr?: any;
  cbe?: any;
}): Promise<PaymentSettingsResponse> {
  const res = await adminFetch("/api/admin/payment-settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update payment account settings");
  return res.json();
}

// =================== RESOURCE ORDERS & TELEGRAM DISPATCH ===================

export async function fetchResourceOrdersApi(
  status?: string,
  search?: string
): Promise<ResourceOrderRecord[]> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await adminFetch(`/api/admin/resource-orders${query}`);
  if (!res.ok) throw new Error("Failed to load resource orders");
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((o: any) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    resourceId: o.resourceId,
    resourceTitle: o.resourceTitle,
    resourceType: o.resourceType || "ebook",
    telegramId: String(o.telegramId),
    clientName: o.clientName || "Telegram Client",
    username: o.username || null,
    phone: o.phone || null,
    amount: Number(o.amount) || 0,
    currency: o.currency || "ETB",
    paymentMethod: o.paymentMethod || "telebirr",
    paymentReference: o.paymentReference || null,
    paymentStatus: o.paymentStatus || "pending",
    fulfillmentStatus: o.fulfillmentStatus || "pending",
    adminNotes: o.adminNotes || null,
    paymentSubmittedAt: o.paymentSubmittedAt ? formatDateTime(o.paymentSubmittedAt) : null,
    verifiedAt: o.verifiedAt ? formatDateTime(o.verifiedAt) : null,
    createdAt: formatDateTime(o.createdAt),
  }));
}

export async function confirmResourceOrderPaymentApi(
  id: number,
  adminNotes?: string
): Promise<{ success: boolean; order: ResourceOrderRecord; dispatched?: boolean; dispatchError?: string }> {
  const res = await adminFetch(`/api/admin/resource-orders/${id}/confirm-payment`, {
    method: "POST",
    body: JSON.stringify({ adminNotes }),
  });
  if (!res.ok) {
    let msg = `Failed to confirm payment for order #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function rejectResourceOrderPaymentApi(
  id: number,
  reason?: string
): Promise<{ success: boolean; order: ResourceOrderRecord }> {
  const res = await adminFetch(`/api/admin/resource-orders/${id}/reject-payment`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    let msg = `Failed to reject payment for order #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deletePhysicalOrderApi(id: number): Promise<boolean> {
  const res = await adminFetch(`/api/admin/resources/orders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete shipping order #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export async function deleteResourceOrderApi(id: number): Promise<boolean> {
  const res = await adminFetch(`/api/admin/resource-orders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete resource order #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

// ==========================================
// DONATIONS API
// ==========================================

export async function fetchDonationsApi(
  status?: string,
  search?: string
): Promise<DonationRecord[]> {
  const query = new URLSearchParams();
  if (status && status !== "all") query.set("status", status);
  if (search) query.set("search", search);

  const qs = query.toString();
  const res = await adminFetch(`/api/admin/donations${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    throw new Error("Failed to fetch donations");
  }
  const data = await res.json();
  return (data || []).map((d: any) => ({
    ...d,
    createdAt: formatDateTime(d.createdAt),
    updatedAt: formatDateTime(d.updatedAt),
    verifiedAt: d.verifiedAt ? formatDateTime(d.verifiedAt) : null,
  }));
}

export async function verifyDonationApi(
  id: number,
  adminNotes?: string
): Promise<{ success: boolean; donation: DonationRecord }> {
  const res = await adminFetch(`/api/admin/donations/${id}/verify`, {
    method: "POST",
    body: JSON.stringify({ adminNotes }),
  });
  if (!res.ok) {
    let msg = `Failed to verify donation #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function rejectDonationApi(
  id: number,
  reason?: string
): Promise<{ success: boolean; donation: DonationRecord }> {
  const res = await adminFetch(`/api/admin/donations/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    let msg = `Failed to reject donation #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteDonationApi(id: number): Promise<boolean> {
  const res = await adminFetch(`/api/admin/donations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete donation #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

// ==========================================
// COURSES MANAGEMENT API
// ==========================================

export async function fetchCourseCatalogApi(options?: {
  type?: string;
  theme?: string;
  search?: string;
}): Promise<CourseCatalogItem[]> {
  const params = new URLSearchParams();
  if (options?.type && options.type !== "all") params.append("type", options.type);
  if (options?.theme && options.theme !== "all") params.append("theme", options.theme);
  if (options?.search) params.append("search", options.search);

  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await adminFetch(`/api/admin/courses/catalog${qs}`);
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    bannerImage: c.bannerImage || null,
    type: c.type || "free",
    price: Number(c.price) || 0,
    currency: c.currency || "ETB",
    theme: c.theme || "General",
    description: c.description || null,
    generalObjective: c.generalObjective || null,
    learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes : [],
    orderIndex: Number(c.orderIndex) || 0,
    isActive: c.isActive !== false,
    moduleCount: c.moduleCount || 0,
    sectionCount: c.sectionCount || 0,
    materialCount: c.materialCount || 0,
    modules: Array.isArray(c.modules) ? c.modules : [],
    createdAt: formatDateTime(c.createdAt),
    updatedAt: formatDateTime(c.updatedAt || c.createdAt),
  }));
}

export async function fetchCourseDetailsApi(id: number): Promise<CourseCatalogItem | null> {
  const res = await adminFetch(`/api/admin/courses/catalog/${id}`);
  if (!res.ok) return null;
  const c = await res.json();
  if (!c || !c.id) return null;

  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    bannerImage: c.bannerImage || null,
    type: c.type || "free",
    price: Number(c.price) || 0,
    currency: c.currency || "ETB",
    theme: c.theme || "General",
    description: c.description || null,
    generalObjective: c.generalObjective || null,
    learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes : [],
    orderIndex: Number(c.orderIndex) || 0,
    isActive: c.isActive !== false,
    modules: (c.modules || []).map((m: any) => ({
      id: m.id,
      courseId: m.courseId,
      title: m.title,
      slug: m.slug,
      description: m.description || null,
      bannerImage: m.bannerImage || null,
      orderIndex: Number(m.orderIndex) || 0,
      createdAt: formatDateTime(m.createdAt),
      sections: (m.sections || []).map((s: any) => ({
        id: s.id,
        moduleId: s.moduleId,
        title: s.title,
        additionalContent: s.additionalContent || null,
        orderIndex: Number(s.orderIndex) || 0,
        createdAt: formatDateTime(s.createdAt),
        materials: (s.materials || []).map((mat: any) => ({
          id: mat.id,
          sectionId: mat.sectionId,
          title: mat.title,
          fileName: mat.fileName,
          filePath: mat.filePath,
          fileSizeBytes: mat.fileSizeBytes ? Number(mat.fileSizeBytes) : null,
          fileMimeType: mat.fileMimeType || null,
          fileType: mat.fileType || "document",
          createdAt: formatDateTime(mat.createdAt),
        })),
      })),
    })),
    createdAt: formatDateTime(c.createdAt),
    updatedAt: formatDateTime(c.updatedAt || c.createdAt),
  };
}

export async function createCourseApi(payload: CreateCoursePayload): Promise<CourseCatalogItem> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("theme", payload.theme);
  formData.append("type", payload.type || "free");
  formData.append("price", String(payload.price || 0));
  formData.append("currency", payload.currency || "ETB");
  if (payload.description) formData.append("description", payload.description);
  if (payload.generalObjective) formData.append("generalObjective", payload.generalObjective);
  if (payload.learningOutcomes) {
    formData.append("learningOutcomes", JSON.stringify(payload.learningOutcomes));
  }
  if (payload.orderIndex !== undefined) {
    formData.append("orderIndex", String(payload.orderIndex));
  }
  if (payload.bannerFile) {
    formData.append("banner", payload.bannerFile);
  }

  const res = await adminFetch("/api/admin/courses/catalog", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let msg = "Failed to create course";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateCourseApi(
  id: number,
  payload: UpdateCoursePayload
): Promise<CourseCatalogItem> {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.theme) formData.append("theme", payload.theme);
  if (payload.type) formData.append("type", payload.type);
  if (payload.price !== undefined) formData.append("price", String(payload.price));
  if (payload.currency) formData.append("currency", payload.currency);
  if (payload.description !== undefined) formData.append("description", payload.description || "");
  if (payload.generalObjective !== undefined) formData.append("generalObjective", payload.generalObjective || "");
  if (payload.learningOutcomes) {
    formData.append("learningOutcomes", JSON.stringify(payload.learningOutcomes));
  }
  if (payload.orderIndex !== undefined) {
    formData.append("orderIndex", String(payload.orderIndex));
  }
  if (payload.isActive !== undefined) {
    formData.append("isActive", String(payload.isActive));
  }
  if (payload.bannerFile) {
    formData.append("banner", payload.bannerFile);
  }

  const res = await adminFetch(`/api/admin/courses/catalog/${id}`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    let msg = `Failed to update course #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteCourseApi(id: number): Promise<boolean> {
  const res = await adminFetch(`/api/admin/courses/catalog/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete course #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export async function createCourseModuleApi(
  courseId: number,
  payload: CreateModulePayload
): Promise<CourseModuleItem> {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.orderIndex !== undefined) formData.append("orderIndex", String(payload.orderIndex));
  if (payload.bannerFile) formData.append("banner", payload.bannerFile);

  const res = await adminFetch(`/api/admin/courses/catalog/${courseId}/modules`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let msg = "Failed to create course module";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateCourseModuleApi(
  courseId: number,
  moduleId: number,
  payload: Partial<CreateModulePayload>
): Promise<CourseModuleItem> {
  const formData = new FormData();
  if (payload.title) formData.append("title", payload.title);
  if (payload.description !== undefined) formData.append("description", payload.description || "");
  if (payload.orderIndex !== undefined) formData.append("orderIndex", String(payload.orderIndex));
  if (payload.bannerFile) formData.append("banner", payload.bannerFile);

  const res = await adminFetch(`/api/admin/courses/catalog/${courseId}/modules/${moduleId}`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    let msg = `Failed to update module #${moduleId}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteCourseModuleApi(
  courseId: number,
  moduleId: number
): Promise<boolean> {
  const res = await adminFetch(`/api/admin/courses/catalog/${courseId}/modules/${moduleId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete module #${moduleId}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export async function createCourseSectionApi(
  courseId: number,
  moduleId: number,
  payload: CreateSectionPayload
): Promise<CourseSectionItem> {
  const res = await adminFetch(
    `/api/admin/courses/catalog/${courseId}/modules/${moduleId}/sections`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    let msg = "Failed to create section";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateCourseSectionApi(
  sectionId: number,
  payload: Partial<CreateSectionPayload>
): Promise<CourseSectionItem> {
  const res = await adminFetch(`/api/admin/courses/catalog/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Failed to update section #${sectionId}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteCourseSectionApi(sectionId: number): Promise<boolean> {
  const res = await adminFetch(`/api/admin/courses/catalog/sections/${sectionId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete section #${sectionId}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export async function uploadSectionMaterialApi(
  courseId: number,
  moduleId: number,
  sectionId: number,
  file: File,
  title?: string
): Promise<CourseMaterialItem> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await adminFetch(
    `/api/admin/courses/catalog/${courseId}/modules/${moduleId}/sections/${sectionId}/materials`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    let msg = "Failed to upload learning material";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteCourseMaterialApi(materialId: number): Promise<boolean> {
  const res = await adminFetch(`/api/admin/courses/catalog/materials/${materialId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete material #${materialId}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

// ==========================================
// COURSE ENROLMENTS & PROGRESS API
// ==========================================

export async function fetchCourseEnrollmentsApi(params?: {
  courseId?: number;
  paymentStatus?: string;
  status?: string;
  search?: string;
}): Promise<CourseEnrollmentRecord[]> {
  const query = new URLSearchParams();
  if (params?.courseId) query.set("courseId", String(params.courseId));
  if (params?.paymentStatus && params.paymentStatus !== "all") query.set("paymentStatus", params.paymentStatus);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search?.trim()) query.set("search", params.search.trim());

  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await adminFetch(`/api/admin/courses/enrollments${qs}`);
  if (!res.ok) {
    throw new Error("Failed to load course enrollments");
  }
  return res.json();
}

export async function fetchCourseEnrollmentDetailsApi(id: number): Promise<CourseEnrollmentRecord> {
  const res = await adminFetch(`/api/admin/courses/enrollments/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load details for enrollment #${id}`);
  }
  return res.json();
}

export async function verifyCourseEnrollmentPaymentApi(
  id: number,
  adminNotes?: string,
): Promise<{ success: boolean; enrollment: CourseEnrollmentRecord }> {
  const res = await adminFetch(`/api/admin/courses/enrollments/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminNotes }),
  });
  if (!res.ok) {
    let msg = "Failed to verify payment";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function rejectCourseEnrollmentPaymentApi(
  id: number,
  reason?: string,
): Promise<{ success: boolean; enrollment: CourseEnrollmentRecord }> {
  const res = await adminFetch(`/api/admin/courses/enrollments/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    let msg = "Failed to reject payment";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteCourseEnrollmentApi(id: number): Promise<boolean> {
  const res = await adminFetch(`/api/admin/courses/enrollments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    let msg = `Failed to delete enrollment #${id}`;
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export async function broadcastBotUpdateApi(
  version: string,
  releaseNotes?: string,
): Promise<{ success: boolean; sent: number; failed: number; message: string }> {
  const res = await adminFetch("/api/admin/bot/broadcast-update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version, releaseNotes }),
  });
  if (!res.ok) {
    let msg = "Failed to broadcast bot update";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}




