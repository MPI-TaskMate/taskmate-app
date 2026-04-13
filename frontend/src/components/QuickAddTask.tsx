import { useState } from "react";
import { createTask, TASK_PRIORITY } from "../services/tasksService";
import { type TaskItem } from "../services/tasksService";
import styles from "../styles/dashboard.module.css";

type Props = {
  onTaskCreated: (task: TaskItem) => void;
};

export default function QuickAddTask({ onTaskCreated }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || loading) return;

    try {
      setLoading(true);

      const newTask = await createTask({
        title,
        priority: TASK_PRIORITY.Medium,
      });

      onTaskCreated(newTask);
      setTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.quickAddForm}>
      <div className={styles.quickAddWrapper}>
        <input
          type="text"
          placeholder="+ Add task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.quickAddInput}
        />

        <button type="submit" className={styles.quickAddButton}>
          +
        </button>
      </div>
    </form>
  );
}
