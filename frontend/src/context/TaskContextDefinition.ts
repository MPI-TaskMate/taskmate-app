import { createContext } from "react";
import type { TaskItem, CreateTaskRequest } from "../services/tasksService";

export type TaskContextType = {
  tasks: TaskItem[];
  loading: boolean;
  error: string;

  refreshTasks: () => Promise<void>;
  addTask: (values: CreateTaskRequest) => Promise<void>;
};

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  error: "",
  refreshTasks: async () => {},
  addTask: async () => {},
});