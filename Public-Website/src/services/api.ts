import { AnonymousQuestion } from "@/types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export async function submitAnonymousQuestion(
  question: string,
  category: string = "General Inquiry"
): Promise<AnonymousQuestion> {
  const res = await fetch(`${API_BASE_URL}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, category }),
  });

  if (!res.ok) {
    let msg = "Could not submit question";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

export async function fetchPublicWisdomQuestions(
  category?: string,
  search?: string
): Promise<AnonymousQuestion[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  if (search && search.trim()) params.append("search", search.trim());

  const url = `${API_BASE_URL}/questions/public${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 15 },
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export async function fetchMyQuestionsStatus(
  ids: number[]
): Promise<AnonymousQuestion[]> {
  if (!ids || ids.length === 0) return [];

  const res = await fetch(`${API_BASE_URL}/questions/my-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}
