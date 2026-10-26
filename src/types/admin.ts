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
  preferredTime?: string;
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
  preferredTime?: string;
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

export interface CourseMaterialItem {
  id: number;
  sectionId: number;
  title: string;
  fileName: string;
  filePath: string;
  fileSizeBytes?: number | null;
  fileMimeType?: string | null;
  fileType: string;
  createdAt: string;
}

export interface CourseSectionItem {
  id: number;
  moduleId: number;
  title: string;
  additionalContent?: string | null;
  orderIndex: number;
  materials?: CourseMaterialItem[];
  createdAt: string;
}

export interface CourseModuleItem {
  id: number;
  courseId: number;
  title: string;
  slug: string;
  description?: string | null;
  bannerImage?: string | null;
  orderIndex: number;
  sections?: CourseSectionItem[];
  createdAt: string;
}

export interface CourseCatalogItem {
  id: number;
  name: string;
  slug: string;
  bannerImage?: string | null;
  type: "free" | "paid";
  price: number;
  currency: string;
  theme: string;
  description?: string | null;
  generalObjective?: string | null;
  learningOutcomes: string[];
  orderIndex: number;
  isActive: boolean;
  moduleCount?: number;
  sectionCount?: number;
  materialCount?: number;
  modules?: CourseModuleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  name: string;
  theme: string;
  type?: "free" | "paid";
  price?: number;
  currency?: string;
  description?: string;
  generalObjective?: string;
  learningOutcomes?: string[];
  orderIndex?: number;
  bannerFile?: File;
}

export interface UpdateCoursePayload {
  name?: string;
  theme?: string;
  type?: "free" | "paid";
  price?: number;
  currency?: string;
  description?: string;
  generalObjective?: string;
  learningOutcomes?: string[];
  orderIndex?: number;
  bannerFile?: File;
  isActive?: boolean;
}

export interface CreateModulePayload {
  title: string;
  description?: string;
  bannerFile?: File;
  orderIndex?: number;
}

export interface CreateSectionPayload {
  title: string;
  additionalContent?: string;
  orderIndex?: number;
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
  postedToChannel?: boolean;
  telegramMessageId?: number | null;
  postedToChannelAt?: string;
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

export interface PaymentAccountDetail {
  id?: number;
  accountName: string;
  accountNumber: string;
  branchOrShortcode?: string | null;
  instructions: string;
  isActive: boolean;
}

export interface PaymentSettingsResponse {
  telebirr: PaymentAccountDetail;
  cbe: PaymentAccountDetail;
}

export interface ResourceOrderRecord {
  id: number;
  orderNumber: string;
  resourceId: number;
  resourceTitle: string;
  resourceType: string;
  telegramId: string;
  clientName?: string | null;
  username?: string | null;
  phone?: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference?: string | null;
  paymentStatus: "pending" | "payment_submitted" | "verified" | "rejected" | "cancelled";
  fulfillmentStatus: "pending" | "delivered" | "failed_delivery";
  adminNotes?: string | null;
  paymentSubmittedAt?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface DonationRecord {
  id: number;
  referenceNumber: string;
  telegramId: string;
  clientName: string;
  clientUsername?: string | null;
  clientPhone?: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "pending" | "payment_submitted" | "verified" | "rejected";
  transactionReference?: string | null;
  notes?: string | null;
  adminNotes?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleProgressItem {
  id: number;
  title: string;
  description?: string | null;
  orderIndex: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
  sectionsCount: number;
  materialsCount: number;
}

export interface CourseEnrollmentRecord {
  id: number;
  telegramId: string;
  clientName: string;
  clientUsername?: string | null;
  clientPhone?: string | null;
  courseId: number;
  courseName: string;
  courseType: "free" | "paid";
  amount: number;
  currency: string;
  paymentStatus: "free" | "pending_verification" | "confirmed" | "rejected";
  paymentMethod?: string | null;
  paymentReference?: string | null;
  adminNotes?: string | null;
  verifiedAt?: string | null;
  status: "not_started" | "in_progress" | "completed";
  currentModuleId?: number | null;
  currentModuleTitle?: string;
  completedModuleIds: number[];
  completedCount: number;
  totalModules: number;
  progressPercent: number;
  completedAt?: string | null;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  moduleProgress?: ModuleProgressItem[];
}



