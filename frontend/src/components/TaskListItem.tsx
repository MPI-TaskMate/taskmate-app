import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import styles from "../styles/tasks.module.css";
import { type Subject } from "../services/subjectsService";
import {
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
  TASK_STATUS,
} from "../services/tasksService";
import { getDeadlineStatus, formatDate } from "../utils/dateUtils";

type Props = {
  task: TaskItem;
  subjects: Subject[];
  onPinToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
};

export default function TaskListItem({
  task,
  subjects,
  onPinToggle,
  onEdit,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { changeTaskStatus } = useTasks(); 

  const deadlineStatus =
    task.status !== TASK_STATUS.Done
      ? getDeadlineStatus(task.deadline)
      : "none";

  const subject = subjects.find((s) => s.id === task.subjectId);
  const estimatedHours =
    task.estimatedMinutes != null ? task.estimatedMinutes / 60 : null;

  return (
    <div className={styles.listRow}>
      <div className={styles.colTitle}>
        <p
          className={`${styles.taskTitle} ${
            task.status === TASK_STATUS.Done ? styles.completedText : ""
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <span className={styles.taskDescription}>{task.description}</span>
        )}
        {estimatedHours != null && (
          <span className={styles.timeEstimate}>Est: {formatHours(estimatedHours)}h</span>
        )}
      </div>

      <div className={styles.colSubject}>
        {subject ? (
          <span
            className={styles.subjectLabel}
            style={{ "--subject-color": subject.color } as React.CSSProperties}
          >
            {subject.name}
          </span>
        ) : (
          "-"
        )}
      </div>

      <div className={styles.colPriority}>
        <span className={`${styles.label} ${getPriorityClass(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <div className={styles.colDeadline}>
        {task.deadline ? (
          <span
            className={`
              ${styles.deadline}
              ${deadlineStatus === "overdue" ? styles.deadlineOverdue : ""}
              ${deadlineStatus === "today" ? styles.deadlineToday : ""}
            `}
          >
            {formatDate(task.deadline)}
          </span>
        ) : (
          "-"
        )}
      </div>

      <div className={styles.colStatus}>
        <select
          value={task.status}
          onChange={(e) =>
            changeTaskStatus(task.id, Number(e.target.value) as TaskStatus)
          }
          onPointerDown={(e) => e.stopPropagation()}
          className={`${styles.statusSelect} ${getStatusClass(task.status)}`}
        >
          <option value={TASK_STATUS.Todo}>Todo</option>
          <option value={TASK_STATUS.InProgress}>In Progress</option>
          <option value={TASK_STATUS.Done}>Done</option>
        </select>
      </div>

      <div className={styles.menuWrapper}>
        <button
          type="button"
          className={styles.moreButton}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          ⋮
        </button>

        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <button
              className={styles.menuItem}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onEdit(task);
              }}
            >
              Edit
            </button>

            <button
              className={`${styles.menuItem} ${styles.deleteMenuItem}`}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(task);
              }}
            >
              Delete
            </button>
          </div>
        )}

        <div className={styles.colPin}>
          <button
            className={styles.pinButton}
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle(task.id);
            }}
          >
            <img
              src={
                task.isPinned
                  ? "/assets/icons/pin-filled.png"
                  : "/assets/icons/pin-outline.png"
              }
              alt={task.isPinned ? "Pinned" : "Unpinned"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatHours(hours: number) {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(2).replace(/\.?0+$/, "");
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
