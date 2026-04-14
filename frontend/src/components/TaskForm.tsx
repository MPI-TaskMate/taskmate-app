import { useEffect, useState } from "react";
import styles from "../styles/taskForm.module.css";
import {
  TASK_PRIORITY,
  type CreateTaskRequest,
  type TaskItem,
  type TaskPriority,
} from "../services/tasksService";

type TaskFormValues = CreateTaskRequest;

type Props = {
  initialTask?: TaskItem | null;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
};

export default function TaskForm({
  initialTask = null,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TASK_PRIORITY.Medium);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? "");
      setDeadline(
        initialTask.deadline ? initialTask.deadline.slice(0, 10) : "",
      );
      setPriority(initialTask.priority);
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
      setPriority(TASK_PRIORITY.Medium);
    }
  }, [initialTask]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || "",
        deadline: deadline || null,
        priority,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.header}>
            <h2>{initialTask ? "Edit task" : "Create task"}</h2>
          </div>

          <div className={styles.field}>
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details"
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="task-deadline">Deadline</label>
            <input
              id="task-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) =>
                setPriority(Number(e.target.value) as TaskPriority)
              }
            >
              <option value={TASK_PRIORITY.Low}>Low</option>
              <option value={TASK_PRIORITY.Medium}>Medium</option>
              <option value={TASK_PRIORITY.High}>High</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.secondaryButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={styles.primaryButton}
            >
              {submitting
                ? "Saving..."
                : initialTask
                  ? "Save changes"
                  : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
