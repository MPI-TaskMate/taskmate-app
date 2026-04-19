import { createContext } from "react";
import type {
  TaskItem,
  CreateTaskRequest,
  TaskStatus,
  UpdateTaskRequest,
} from "../services/tasksService";

type TaskContextType = {
  tasks: TaskItem[];
  loading: boolean;
  error: string;
  refreshTasks: () => Promise<void>;
  addTask: (values: CreateTaskRequest) => Promise<void>;
  changeTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  editTask: (id: string, values: UpdateTaskRequest) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
};

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  error: "",
  refreshTasks: async () => {},
  addTask: async () => {},
  changeTaskStatus: async () => {},
  togglePin: async () => {},
  editTask: async () => {},
  removeTask: async () => {},
});