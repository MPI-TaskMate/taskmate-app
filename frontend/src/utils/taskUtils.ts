import styles from "../styles/tasks.module.css";
import { TASK_STATUS, type TaskPriority, type TaskStatus } from "../services/tasksService";

export function formatHours(hours: number) {
  return Number.isInteger(hours)
    ? String(hours)
    : hours.toFixed(2).replace(/\.?0+$/, "");
}

export function getPriorityClass(priority: TaskPriority) {
  switch (priority) {
    case 0:
      return styles.priorityLow;
    case 1:
      return styles.priorityMedium;
    case 2:
      return styles.priorityHigh;
    default:
      return "";
  }
}

export function getPriorityLabel(priority: TaskPriority) {
  switch (priority) {
    case 0:
      return "Low";
    case 1:
      return "Medium";
    case 2:
      return "High";
    default:
      return "";
  }
}

export function getStatusClass(status: TaskStatus) {
  switch (status) {
    case TASK_STATUS.Todo:
      return styles.todoBadge;
    case TASK_STATUS.InProgress:
      return styles.inProgressBadge;
    case TASK_STATUS.Done:
      return styles.doneBadge;
    default:
      return "";
  }
}

export function getColumnClass(title: string) {
  switch (title) {
    case "Todo":
      return styles.todoColumn;
    case "In Progress":
      return styles.inProgressColumn;
    case "Done":
      return styles.doneColumn;
    default:
      return "";
  }
}