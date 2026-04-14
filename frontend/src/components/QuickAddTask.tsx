import { useState } from "react";
import styles from "../styles/dashboard.module.css";
import {
  TASK_PRIORITY,
  type CreateTaskRequest,
  type TaskItem,
} from "../services/tasksService";

type Props = {
  status: TaskItem["status"];
  onTaskCreated: (values: CreateTaskRequest) => Promise<void>;
};

export default function QuickAddTask({ onTaskCreated }: Props) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!title.trim() || submitting) return;

    try {
      setSubmitting(true);

      await onTaskCreated({
        title: title.trim(),
        description: "",
        deadline: null,
        priority: TASK_PRIORITY.Medium,
      });

      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.quickAddWrapper}>
      <span className={styles.quickAddIcon}>＋</span>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCreate();
          }
          if (e.key === "Escape") {
            setTitle("");
          }
        }}
        placeholder="Add a task..."
        className={styles.quickAddInput}
        disabled={submitting}
      />
    </div>
  );
}
