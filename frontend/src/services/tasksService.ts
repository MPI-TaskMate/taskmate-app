const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5048/api";

import { getAuthHeaders } from "./authService";

export const TASK_STATUS = {
  Todo: 0,
  InProgress: 1,
  Done: 2,
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  Low: 0,
  Medium: 1,
  High: 2,
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number | null;
  isPinned: boolean;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export async function getTasks(): Promise<TaskItem[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let message = "Failed to load tasks.";

    try {
      const errorData = await response.json();
      if (errorData?.message) {
        message = errorData.message;
      }
    } catch (e) {
      console.error(e);
    }

    throw new Error(message);
  }

  return response.json();
}

export async function updateTaskStatus(id: string, status: number) {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
  let message = "Failed to update task status";

  try {
    const errorData = await response.json();
    if (errorData?.message) {
      message = errorData.message;
    }
  } catch (e) {
    console.error(e);
  }

  throw new Error(message);
}
}
