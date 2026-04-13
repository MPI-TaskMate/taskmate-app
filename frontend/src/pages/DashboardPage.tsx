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
import QuickAddTask from "../components/QuickAddTask";

type ViewMode = "list" | "kanban";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [focusMode, setFocusMode] = useState(false);

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

  function isTodayOrOverdue(deadline?: string | null) {
    if (!deadline) return false;

    const today = new Date();
    const taskDate = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    return taskDate.getTime() <= today.getTime();
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

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

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (debouncedSearch.trim()) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
      );
    }

    if (focusMode) {
      result = result.filter(
        (task) =>
          task.status !== TASK_STATUS.Done && isTodayOrOverdue(task.deadline),
      );
    }

    return result;
  }, [tasks, debouncedSearch, focusMode]);

  const todoTasks = useMemo(
    () => filteredTasks.filter((task) => task.status === TASK_STATUS.Todo),
    [filteredTasks],
  );

  const inProgressTasks = useMemo(
    () =>
      filteredTasks.filter((task) => task.status === TASK_STATUS.InProgress),
    [filteredTasks],
  );

  const doneTasks = useMemo(
    () => filteredTasks.filter((task) => task.status === TASK_STATUS.Done),
    [filteredTasks],
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

        <div className={styles.actionsRow}>
          <QuickAddTask
            onTaskCreated={(task) => setTasks((prev) => [task, ...prev])}
          />

          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <img
                src="/assets/icons/search-icon.svg"
                className={styles.iconDefault}
              />
              <img
                src="/assets/icons/search-icon-hover.svg"
                className={styles.iconHover}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.focusWrapper}>
              <div className={styles.focusButtons}>
                {!focusMode ? (
                  <button onClick={() => setFocusMode(true)}>Focus Mode</button>
                ) : (
                  <button onClick={() => setFocusMode(false)}>Show all</button>
                )}
              </div>
              {focusMode && (
                <p className={styles.focusIndicator}>Showing today's tasks</p>
              )}
            </div>
          </div>
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
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} showStatus />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
