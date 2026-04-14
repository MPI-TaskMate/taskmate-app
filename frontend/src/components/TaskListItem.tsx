import styles from "../styles/dashboard.module.css";
import {
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
  TASK_STATUS,
} from "../services/tasksService";

type Props = {
  task: TaskItem;
  onPinToggle?: (taskId: string) => void;
};

export default function TaskListItem({ task, onPinToggle }: Props) {
  return (
    <div className={styles.listRow}>
      <div className={styles.colTitle}>
        <p className={styles.taskTitle}>{task.title}</p>
        {task.description && (
          <span className={styles.taskDescription}>{task.description}</span>
        )}
      </div>

      <div className={styles.colPriority}>
        <span className={`${styles.label} ${getPriorityClass(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <div className={styles.colDeadline}>
        {task.deadline ? (
          <span className={styles.deadline}>{formatDate(task.deadline)}</span>
        ) : (
          "-"
        )}
      </div>

      <div className={styles.colStatus}>
        <span
          className={`${styles.statusBadge} ${getStatusClass(task.status)}`}
        >
          {getStatusLabel(task.status)}
        </span>
      </div>

      <div className={styles.colPin}>
        <button
          className={styles.pinButton}
          onClick={(e) => {
            e.stopPropagation();
            onPinToggle?.(task.id);
          }}
        >
          <img
            src={
              task.isPinned
                ? "/assets/icons/pin-filled.png"
                : "/assets/icons/pin-outline.png"
            }
            alt="pin"
          />
        </button>
      </div>
    </div>
  );
}

function getPriorityLabel(priority: TaskPriority) {
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

function getPriorityClass(priority: TaskPriority) {
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

function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case TASK_STATUS.Todo:
      return "Todo";
    case TASK_STATUS.InProgress:
      return "In Progress";
    case TASK_STATUS.Done:
      return "Done";
    default:
      return "Unknown";
  }
}

function getStatusClass(status: TaskStatus) {
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
