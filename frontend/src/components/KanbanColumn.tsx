import { useDroppable } from "@dnd-kit/core";
import styles from "../styles/dashboard.module.css";
import {
  type TaskItem,
  type CreateTaskRequest,
} from "../services/tasksService";
import TaskCard from "./TaskCard";
import QuickAddTask from "./QuickAddTask";

type KanbanColumnProps = {
  title: string;
  status: TaskItem["status"];
  tasks: TaskItem[];
  onPinToggle?: (taskId: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  showQuickAdd?: boolean;
  onTaskCreated?: (values: CreateTaskRequest) => Promise<void>;
};

export default function KanbanColumn({
  title,
  status,
  tasks,
  onPinToggle,
  onEdit,
  onDelete,
  showQuickAdd = false,
  onTaskCreated,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const columnClass = getColumnClass(title);

  return (
    <section ref={setNodeRef} className={`${styles.column} ${columnClass}`}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitleGroup}>
          <span className={styles.columnCount}>{tasks.length}</span>
          <h3>{title}</h3>
        </div>
      </div>

      <div className={styles.columnContent}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPinToggle={onPinToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {showQuickAdd && onTaskCreated && (
          <QuickAddTask status={status} onTaskCreated={onTaskCreated} />
        )}
      </div>
    </section>
  );
}

function getColumnClass(title: string) {
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
