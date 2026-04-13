import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles/dashboard.module.css";
import {
  getTasks,
  updateTaskStatus,
  type TaskItem,
  TASK_STATUS,
} from "../services/tasksService";
import KanbanColumn from "../components/KanbanColumn";
import TaskCard from "../components/TaskCard";
import ViewToggle from "../components/ViewToggle";

type ViewMode = "list" | "kanban";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskItem["status"];

    const activeData = active.data.current as
      | { status: TaskItem["status"] }
      | undefined;

    if (!activeData) return;

    if (activeData.status === newStatus) return;

    const oldStatus = activeData.status;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    updateTaskStatus(taskId, newStatus).catch(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t)),
      );
    });
  }

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError("");
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load tasks.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const todoTasks = useMemo(
    () => tasks.filter((task) => task.status === TASK_STATUS.Todo),
    [tasks],
  );

  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === TASK_STATUS.InProgress),
    [tasks],
  );

  const doneTasks = useMemo(
    () => tasks.filter((task) => task.status === TASK_STATUS.Done),
    [tasks],
  );

  if (loading) {
    return (
      <main className={styles.page}>
        <div className="container">
          <p>Loading tasks...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className="container">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>Dashboard</h1>
            <p>Stay organized and get things done.</p>
          </div>

          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === "kanban" ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <section className={styles.kanbanBoard}>
              <KanbanColumn
                title="Todo"
                status={TASK_STATUS.Todo}
                tasks={todoTasks}
              />
              <KanbanColumn
                title="In Progress"
                status={TASK_STATUS.InProgress}
                tasks={inProgressTasks}
              />
              <KanbanColumn
                title="Done"
                status={TASK_STATUS.Done}
                tasks={doneTasks}
              />
            </section>
          </DndContext>
        ) : (
          <section className={styles.listView}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} showStatus />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
