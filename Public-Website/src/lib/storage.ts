import { AnonymousQuestion, MyQuestionEntry } from "@/types";

const STORAGE_KEY = "purity_my_anonymous_questions_v1";

export function getCachedMyQuestions(): MyQuestionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse cached questions from localStorage:", e);
    return [];
  }
}

export function saveQuestionToLocalStorage(q: AnonymousQuestion): MyQuestionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getCachedMyQuestions();
    // Prepend if not already present
    const filtered = existing.filter((item) => item.id !== q.id);
    const newEntry: MyQuestionEntry = {
      id: q.id,
      referenceNumber: q.referenceNumber,
      category: q.category,
      question: q.question,
      submittedAt: q.createdAt,
      status: (q.status as MyQuestionEntry["status"]) || "pending",
      answer: q.answer,
      answeredAt: q.answeredAt,
      assignedCounselor: q.assignedCounselor,
    };
    const updated = [newEntry, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save question to localStorage:", e);
    return [];
  }
}

export function syncCachedQuestionsWithServer(serverQuestions: AnonymousQuestion[]): MyQuestionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getCachedMyQuestions();
    const serverMap = new Map(serverQuestions.map((q) => [q.id, q]));

    const merged: MyQuestionEntry[] = existing.map((local) => {
      const live = serverMap.get(local.id);
      if (!live) return local;
      return {
        ...local,
        status: (live.status as MyQuestionEntry["status"]) || local.status,
        answer: live.answer !== undefined ? live.answer : local.answer,
        answeredAt: live.answeredAt !== undefined ? live.answeredAt : local.answeredAt,
        assignedCounselor:
          live.assignedCounselor !== undefined ? live.assignedCounselor : local.assignedCounselor,
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error("Failed to sync questions with server:", e);
    return [];
  }
}

export function removeCachedQuestion(id: number): MyQuestionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getCachedMyQuestions();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to remove question from localStorage:", e);
    return [];
  }
}
