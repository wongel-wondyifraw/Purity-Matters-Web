export interface AnonymousQuestion {
  id: number;
  referenceNumber: string;
  category: string;
  question: string;
  status: "pending" | "answered" | "archived";
  answer?: string | null;
  answeredAt?: string | null;
  assignedCounselor?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MyQuestionEntry {
  id: number;
  referenceNumber: string;
  category: string;
  question: string;
  submittedAt: string;
  status: "pending" | "answered" | "archived";
  answer?: string | null;
  answeredAt?: string | null;
  assignedCounselor?: string | null;
}

export type QuestionCategory =
  | "Habitual Triggers"
  | "Guilt & Shame"
  | "Relationships & Boundaries"
  | "Inner Healing & Trauma"
  | "Spiritual Warfare"
  | "General Inquiry";

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  "Habitual Triggers",
  "Guilt & Shame",
  "Relationships & Boundaries",
  "Inner Healing & Trauma",
  "Spiritual Warfare",
  "General Inquiry",
];
