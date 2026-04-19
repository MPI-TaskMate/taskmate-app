import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import KanbanColumn from "../components/KanbanColumn";
import ViewToggle from "../components/ViewToggle";
import TaskListItem from "../components/TaskListItem";
import DeleteTaskModal from "../components/DeleteTaskModal";
import TaskForm from "../components/TaskForm";
import {
  getTasks,
  updateTaskStatus,
  updateTaskPin,
  updateTask,
  createTask,
  deleteTask,
  type TaskItem,
  TASK_STATUS,
  type CreateTaskRequest,
} from "../services/tasksService";
import {
  getSubjects,
  createSubject,
  deleteSubject,
  type Subject,
} from "../services/subjectsService";
import styles from "../styles/tasks.module.css";
import Sidebar from "../components/Sidebar";

type ViewMode = "list" | "kanban";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectError, setSubjectError] = useState("");

  function handleOpenCreateForm() {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  }

  function handleOpenEditForm(task: TaskItem) {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  }

  function handleCloseTaskForm() {
    setEditingTask(null);
    setIsTaskFormOpen(false);
  }

  function handleDeleteTask(task: TaskItem) {
    setTaskToDelete(task);
  }

  function handleCloseDeleteModal() {
    setTaskToDelete(null);
  }

  async function handleTaskSubmit(values: CreateTaskRequest) {
    if (editingTask) {
      const updatedTask = await updateTask(editingTask.id, {
        ...values,
        status: editingTask.status,
        subjectId:
          values.subjectId !== undefined
            ? values.subjectId
            : editingTask.subjectId,
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? updatedTask : task)),
      );
    } else {
      const newTask = await createTask(values);
      setTasks((prev) => [newTask, ...prev]);
    }

    handleCloseTaskForm();
  }

  async function handleConfirmDelete() {
    if (!taskToDelete) return;

    setActionError("");

    try {
      await deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((item) => item.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to delete task.");
      }
      setTaskToDelete(null);
    }
  }

  async function handlePinToggle(taskId: string) {
    let oldPinnedState: boolean | undefined;

    setTasks((prev) => {
      const updated = prev.map((task) => {
        if (task.id === taskId) {
          oldPinnedState = task.isPinned;
          return { ...task, isPinned: !task.isPinned };
        }
        return task;
      });

      return updated;
    });

    try {
      await updateTaskPin(taskId, !oldPinnedState);
    } catch {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, isPinned: oldPinnedState } : task,
        ),
      );
    }
  }

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

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => setSubjectError("Failed to load subjects."));
  }, []);

  async function handleAddSubject(name: string, color: string) {
    if (!name.trim()) {
      setSubjectError("Name is required");
      return;
    }

    try {
      const subject = await createSubject({
        name: name.trim(),
        color,
      });

      setSubjects((prev) => [...prev, subject]);
      setSubjectError("");
    } catch (err) {
      if (err instanceof Error) {
        setSubjectError(err.message);
      } else {
        setSubjectError("Failed to create subject.");
      }
    }
  }

  async function handleDeleteSubject(id: string) {
    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setSubjectError("");
    } catch (err) {
      if (err instanceof Error) {
        setSubjectError(err.message);
      } else {
        setSubjectError("Failed to delete subject.");
      }
    }
  }

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

    return [...result].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });
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
    <div className={styles.layout}>
      <Sidebar
        subjects={subjects}
        onAdd={handleAddSubject}
        onDelete={handleDeleteSubject}
        subjectError={subjectError}
      />

      <div className={styles.content}>
        <div className="container">
          <div className={styles.header}>
            {actionError && (
              <div className={styles.errorBanner}>{actionError}</div>
            )}

            <div>
              <h1>Tasks</h1>
              <p>Manage your tasks efficiently.</p>
            </div>

            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>

          <div className={styles.actionsRow}>
            <button
              onClick={handleOpenCreateForm}
              className={styles.addTaskButton}
            >
              + Create Task
            </button>

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
                    <button onClick={() => setFocusMode(true)}>
                      Focus Mode
                    </button>
                  ) : (
                    <button onClick={() => setFocusMode(false)}>
                      Show all
                    </button>
                  )}
                </div>

                {focusMode && (
                  <p className={styles.focusIndicator}>
                    Showing today's tasks
                  </p>
                )}
              </div>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No tasks yet</h3>
              <p>Start by adding your first task.</p>
            </div>
          ) : viewMode === "kanban" ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <section className={styles.kanbanBoard}>
                <KanbanColumn
                  title="Todo"
                  status={TASK_STATUS.Todo}
                  tasks={todoTasks}
                  subjects={subjects}
                  onPinToggle={handlePinToggle}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteTask}
                />
                <KanbanColumn
                  title="In Progress"
                  status={TASK_STATUS.InProgress}
                  tasks={inProgressTasks}
                  subjects={subjects}
                  onPinToggle={handlePinToggle}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteTask}
                />
                <KanbanColumn
                  title="Done"
                  status={TASK_STATUS.Done}
                  tasks={doneTasks}
                  subjects={subjects}
                  onPinToggle={handlePinToggle}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteTask}
                />
              </section>
            </DndContext>
          ) : (
            <section className={styles.listView}>
              <div className={styles.listHeader}>
                <span>Task</span>
                <span>Subject</span>
                <span>Priority</span>
                <span>Deadline</span>
                <span>Status</span>
                <span></span>
              </div>

              {filteredTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  subjects={subjects}
                  onPinToggle={handlePinToggle}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteTask}
                />
              ))}
            </section>
          )}
        </div>
      </div>
    </div>

{isTaskFormOpen && (
  <TaskForm
  initialTask={editingTask}
  subjects={subjects}
  onSubmit={handleTaskSubmit}
  onCancel={handleCloseTaskForm}
/>
)}

{taskToDelete && (
  <DeleteTaskModal
  taskTitle={taskToDelete.title}
  onConfirm={handleConfirmDelete}
  onCancel={handleCloseDeleteModal}
/>
)}
  </main>
);}