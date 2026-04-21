import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useDraggable } from "@dnd-kit/core";
import styles from "../styles/tasks.module.css";
import { type Subject } from "../services/subjectsService";
import {
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
  TASK_STATUS,
} from "../services/tasksService";
import { getDeadlineStatus, formatDate } from "../utils/dateUtils";

type TaskCardProps = {
  task: TaskItem;
  showStatus?: boolean;
  subjects: Subject[];
  onPinToggle?: (taskId: string) => void;
  onEdit?: (task: TaskItem) => void;
  onDelete?: (task: TaskItem) => void;
};

export default function TaskCard({
  task,
  showStatus = false,
  subjects,
  onPinToggle,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { changeTaskStatus } = useTasks();

  const deadlineStatus =
    task.status !== TASK_STATUS.Done
      ? getDeadlineStatus(task.deadline)
      : "none";

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const subject = subjects.find((s) => s.id === task.subjectId);
  const estimatedHours =
    task.estimatedMinutes != null ? task.estimatedMinutes / 60 : null;

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Number(e.target.value) as TaskStatus;
    changeTaskStatus(task.id, newStatus);
  };

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${showStatus ? styles.listCard : styles.taskCard}`}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.labelsRow}>
          <span
            className={`${styles.label} ${getPriorityClass(task.priority)}`}
          >
            {getPriorityLabel(task.priority)}
          </span>

          {subject && (
            <span
              className={styles.subjectLabel}
              style={
                { "--subject-color": subject.color } as React.CSSProperties
              }
            >
              {subject.name}
            </span>
          )}
        </div>

        <div
          className={styles.cardActions}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.menuWrapper}>
            <button
              type="button"
              className={styles.moreButton}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              ⋯
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(task);
                  }}
                >
                  Edit
                </button>

                <button
                  className={`${styles.menuItem} ${styles.deleteMenuItem}`}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(task);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <button
            className={styles.pinButton}
            onClick={() => onPinToggle?.(task.id)}
          >
            <img
              src={
                task.isPinned
                  ? "/assets/icons/pin-filled.png"
                  : "/assets/icons/pin-outline.png"
              }
            />
          </button>
        </div>
      </div>

      <h4
        className={`${styles.taskTitle} ${
          task.status === TASK_STATUS.Done ? styles.completedText : ""
        }`}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className={styles.taskDescription}>{task.description}</p>
      )}

      {estimatedHours != null && (
        <p className={styles.timeEstimate}>Est: {formatHours(estimatedHours)}h</p>
      )}

      <div className={styles.cardFooter}>
        {task.deadline && (
          <span
            className={`
              ${styles.deadline}
              ${deadlineStatus === "overdue" ? styles.deadlineOverdue : ""}
              ${deadlineStatus === "today" ? styles.deadlineToday : ""}
            `}
          >
            <span className={styles.deadlineIcon} />
            {formatDate(task.deadline)}
          </span>
        )}

        <select
          value={task.status}
          onChange={handleStatusSelect}
          onPointerDown={(e) => e.stopPropagation()}
          className={`${styles.statusSelect} ${getStatusClass(task.status)} ${styles.statusRight}`}
        >
          <option value={TASK_STATUS.Todo}>Todo</option>
          <option value={TASK_STATUS.InProgress}>In Progress</option>
          <option value={TASK_STATUS.Done}>Done</option>
        </select>
      </div>
    </article>
  );
}

function formatHours(hours: number) {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(2).replace(/\.?0+$/, "");
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
