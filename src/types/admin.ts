// Shared interfaces and types for Purity Matters Admin Console

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
  scheduledAt?: string;
  createdAt: string;
}

export interface NewCounselingPayload {
  clientName: string;
  phone?: string;
  telegramId?: string;
  concern: string;
  description?: string;
  preferredMethod: string;
  preferredTime: string;
  status?: "pending" | "assigned" | "scheduled" | "completed";
  assignedTo?: string;
  scheduledAt?: string;
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

export interface AnonymousQuestionRecord {
  id: number;
  referenceNumber: string;
  category: string;
  question: string;
  status: "pending" | "answered" | "archived";
  submittedAt: string;
  answer?: string;
  answeredAt?: string;
  assignedCounselor?: string;
}

export interface ResourceCatalogItem {
  id: number;
  title: string;
  author?: string | null;
  description?: string | null;
  type: "ebook" | "physical_book";
  pricingType: "free" | "paid";
  price: number;
  currency: string;
  filePath?: string | null;
  fileName?: string | null;
  fileSizeBytes?: number | null;
  fileMimeType?: string | null;
  stockQuantity?: number | null;
  coverImageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PhysicalBookOrderItem {
  id: number;
  orderNumber: string;
  resourceId: number;
  resourceTitle: string;
  telegramId: string;
  clientName: string;
  phone: string;
  shippingAddress: string;
  city: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  paymentStatus: "pending" | "verified" | "refunded";
  paymentReference?: string | null;
  status: "pending" | "processing" | "dispatched" | "delivered" | "cancelled";
  dispatchNotes?: string | null;
  createdAt: string;
}

export interface NewResourcePayload {
  title: string;
  author?: string;
  description?: string;
  type: "ebook" | "physical_book";
  pricingType: "free" | "paid";
  price: number;
  currency: string;
  stockQuantity?: number;
  file?: File | null;
}

