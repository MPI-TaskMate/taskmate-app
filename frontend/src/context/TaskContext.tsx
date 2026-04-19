import { useEffect, useState } from "react";
import { TaskContext } from "./TaskContextDefinition";
import {
  getTasks,
  createTask,
  type TaskItem,
  type CreateTaskRequest,
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}