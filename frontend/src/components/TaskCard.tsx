import styles from "../styles/dashboard.module.css";
import {
  type TaskItem,
  type TaskStatus,
  TASK_STATUS,
} from "../services/tasksService";

type TaskCardProps = {
  task: TaskItem;
  showStatus?: boolean;
};

export default function TaskCard({ task, showStatus = false }: TaskCardProps) {
  return (
    <article className={showStatus ? styles.listCard : styles.taskCard}>
      <div className={showStatus ? styles.cardTop : undefined}>
        <h4 className={styles.taskTitle}>{task.title}</h4>

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
