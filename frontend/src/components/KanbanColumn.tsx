import { useDroppable } from "@dnd-kit/core";
import styles from "../styles/dashboard.module.css";
import { type TaskItem, type TaskStatus } from "../services/tasksService";
import TaskCard from "./TaskCard";

type KanbanColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: TaskItem[];
};

export default function KanbanColumn({
  title,
  status,
  tasks,
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
          <TaskCard key={task.id} task={task} />
        ))}
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
