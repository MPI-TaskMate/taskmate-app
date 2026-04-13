import { useDraggable } from "@dnd-kit/core";
import styles from "../styles/dashboard.module.css";
import {
  type TaskItem,
  type TaskStatus,
  TASK_STATUS,
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
      <div className={showStatus ? styles.cardTop : undefined}>
        <div className={styles.cardHeader}>
          <h4 className={styles.taskTitle}>{task.title}</h4>

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

        {showStatus && (
          <span
            className={`${styles.statusBadge} ${getStatusClass(task.status)}`}
          >
            {getStatusLabel(task.status)}
          </span>
        )}
      </div>

      {task.description && (
        <p className={styles.taskDescription}>{task.description}</p>
      )}
    </article>
  );
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
