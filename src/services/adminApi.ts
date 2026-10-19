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
    "http://localhost:3001"
  ).replace(/\/+$/, "");

export const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("purity_console_token")
    : null;

export const getAuthHeaders = (isFormData: boolean = false): HeadersInit => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

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
  const res = await fetch(`${getApiUrl()}/api/admin/clients`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiUrl()}/api/admin/counseling`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiUrl()}/api/admin/inner-healing`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiUrl()}/api/admin/courses`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiUrl()}/api/admin/resources`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiUrl()}/api/admin/resources/catalog`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiUrl()}/api/admin/resources/orders`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiUrl()}/api/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchAnonymousQuestionsApi(): Promise<AnonymousQuestionRecord[]> {
  const res = await fetch(`${getApiUrl()}/api/admin/questions`, {
    headers: getAuthHeaders(),
  });
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

  const res = await fetch(`${getApiUrl()}/api/admin/clients`, {
    method: "POST",
    headers: getAuthHeaders(),
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
  const res = await fetch(`${getApiUrl()}/api/admin/clients/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update client #${id}`);
}

export async function deleteClientApi(id: number): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/admin/clients/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete client #${id}`);
}

export async function createCounselingApi(payload: NewCounselingPayload): Promise<CounselingRecord> {
  const res = await fetch(`${getApiUrl()}/api/admin/counseling`, {
    method: "POST",
    headers: getAuthHeaders(),
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
  const res = await fetch(`${getApiUrl()}/api/admin/counseling/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, assignedTo }),
  });
  if (!res.ok) throw new Error(`Failed to update counseling request #${id}`);
}

export async function deleteCounselingApi(id: number): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/admin/counseling/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete counseling request #${id}`);
}

export async function updateInnerHealingStatusApi(
  id: number,
  status: InnerHealingRecord["status"]
): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/admin/inner-healing/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
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

  const res = await fetch(`${getApiUrl()}/api/admin/resources`, {
    method: "POST",
    headers: getAuthHeaders(true),
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
    updatedAt: formatDateTime(created.updatedAt || created.createdAt),
  };
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

  const res = await fetch(`${getApiUrl()}/api/admin/resources/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
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
  const res = await fetch(`${getApiUrl()}/api/admin/resources/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete resource #${id}`);
}

export async function updatePhysicalOrderStatusApi(
  id: number,
  status: PhysicalBookOrderItem["status"],
  dispatchNotes?: string
): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/admin/resources/orders/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, dispatchNotes }),
  });
  if (!res.ok) throw new Error(`Failed to update order #${id}`);
}

export async function answerAnonymousQuestionApi(
  id: number,
  answer: string,
  assignedCounselor?: string,
  isPublic: boolean = true
): Promise<AnonymousQuestionRecord> {
  const res = await fetch(`${getApiUrl()}/api/admin/questions/${id}/answer`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ answer, assignedCounselor, isPublic }),
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
  };
}

export async function deleteAnonymousQuestionApi(id: number): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/admin/questions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete question #${id}`);
}
