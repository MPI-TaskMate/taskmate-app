import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import styles from "../styles/dashboard.module.css";
import { type Subject } from "../services/subjectsService";
import {
  type TaskItem,
  type TaskPriority,
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

  const deadlineStatus =
    task.status !== TASK_STATUS.Done
      ? getDeadlineStatus(task.deadline)
      : "none";

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const subject = subjects.find((s) => s.id === task.subjectId);

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
              aria-label="More actions"
            >
              ⋯
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(task);
                  }}
                >
                  Edit
                </button>

                <button
                  type="button"
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
            type="button"
            className={styles.pinButton}
            onClick={() => onPinToggle?.(task.id)}
          >
            {task.isPinned ? (
              <img src="/assets/icons/pin-filled.png" alt="Pinned" />
            ) : (
              <img src="/assets/icons/pin-outline.png" alt="Unpinned" />
            )}
          </button>
        </div>
      </div>

      <h4 className={styles.taskTitle}>{task.title}</h4>

      {task.description && (
        <p className={styles.taskDescription}>{task.description}</p>
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
      </div>
    </article>
  );
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
