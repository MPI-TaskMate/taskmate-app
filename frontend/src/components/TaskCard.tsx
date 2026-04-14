import { useDraggable } from "@dnd-kit/core";
import styles from "../styles/dashboard.module.css";
import {
  type TaskItem,
  type TaskPriority,
} from "../services/tasksService";

type TaskCardProps = {
  task: TaskItem;
  showStatus?: boolean;
  onPinToggle?: (taskId: string) => void;
};

export default function TaskCard({
  task,
  showStatus = false,
  onPinToggle,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={showStatus ? styles.listCard : styles.taskCard}
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
        </div>

        <button
          type="button"
          className={styles.pinButton}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onPinToggle?.(task.id);
          }}
        >
          {task.isPinned ? (
            <img src="/assets/icons/pin-filled.png" />
          ) : (
            <img src="/assets/icons/pin-outline.png" />
          )}
        </button>
      </div>

      <h4 className={styles.taskTitle}>{task.title}</h4>

      {task.description && (
        <p className={styles.taskDescription}>{task.description}</p>
      )}

      <div className={styles.cardFooter}>
        {task.deadline && (
          <span className={styles.deadline}>
            <img
              src="/assets/icons/clock-icon.png"
              alt="deadline"
              className={styles.deadlineIcon}
            />
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
