import { useContext } from "react";
import { TaskContext } from "../context/TaskContextDefinition"; 

export function useTasks() {
  return useContext(TaskContext);
}