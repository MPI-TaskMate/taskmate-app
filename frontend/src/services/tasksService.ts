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
  estimatedMinutes?: number | null;
  isPinned?: boolean;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  deadline?: string | null;
  priority: TaskPriority;
  subjectId?: string | null;
};

export type UpdateTaskRequest = {
  title: string;
  description?: string;
  deadline?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  subjectId?: string | null;
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

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<TaskItem> {
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

  return response.json();
}

export async function updateTaskPin(
  taskId: string,
  isPinned: boolean,
): Promise<TaskItem> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isPinned }),
  });

  if (!response.ok) {
    let message = "Failed to update task pin";

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

export async function createTask(data: CreateTaskRequest): Promise<TaskItem> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let message = "Failed to create task";

    try {
      const errorData = await res.json();
      if (errorData?.message) {
        message = errorData.message;
      }
    } catch (e) {
      console.error(e);
    }

    throw new Error(message);
  }

  return res.json();
}

export async function updateTask(
  id: string,
  data: UpdateTaskRequest,
): Promise<TaskItem> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = "Failed to update task";

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