import { useEffect, useState } from "react";
import { TaskContext } from "./TaskContextDefinition";

import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTaskPin,
  updateTask,
  deleteTask,
  type TaskItem,
  type CreateTaskRequest,
  type TaskStatus,
  type UpdateTaskRequest,
} from "../services/tasksService";

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshTasks() {
    try {
      setLoading(true);
      setError("");
      const data = await getTasks();
      setTasks(data);
    } catch {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function addTask(values: CreateTaskRequest) {
    const newTask = await createTask(values);
    setTasks((prev) => [newTask, ...prev]);
  }

  async function changeTaskStatus(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

    try {
      await updateTaskStatus(id, status);
    } catch {
      refreshTasks();
    }
  }

  async function togglePin(id: string, isPinned: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isPinned } : t)));

    try {
      await updateTaskPin(id, isPinned);
    } catch {
      refreshTasks();
    }
  }

  async function editTask(id: string, values: UpdateTaskRequest) {
    const updated = await updateTask(id, values);

    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function removeTask(id: string) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    refreshTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        refreshTasks,
        addTask,
        changeTaskStatus,
        togglePin,
        editTask,
        removeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
