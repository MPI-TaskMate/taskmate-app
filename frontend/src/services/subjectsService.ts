const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5048/api";

import { getAuthHeaders } from "./authService";

export type Subject = {
  id: string;
  name: string;
  color?: string | null;
};

export type CreateSubjectRequest = {
  name: string;
  color?: string | null;
};

export async function getSubjects(): Promise<Subject[]> {
  const res = await fetch(`${API_BASE_URL}/subjects`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to load subjects");
  return res.json();
}

export async function createSubject(
  data: CreateSubjectRequest,
): Promise<Subject> {
  const res = await fetch(`${API_BASE_URL}/subjects`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to create subject");
  }

  return res.json();
}

export async function deleteSubject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete subject");
}
