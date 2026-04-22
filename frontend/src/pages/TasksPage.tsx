import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import KanbanColumn from "../components/KanbanColumn";
import ViewToggle from "../components/ViewToggle";
import TaskListItem from "../components/TaskListItem";
import DeleteTaskModal from "../components/DeleteTaskModal";
import TaskForm from "../components/TaskForm";
import {
  type TaskItem,
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatus,
  type TaskPriority,
  type CreateTaskRequest,
} from "../services/tasksService";
import { useSubjects } from "../hooks/useSubjects";
import { useTasks } from "../hooks/useTasks";
import styles from "../styles/tasks.module.css";

type ViewMode = "list" | "kanban";

type StatusFilter = TaskStatus | "all";
type PriorityFilter = TaskPriority | "all";
type SubjectFilter = string | "all";

type SortOption =
  | "none"
  | "deadlineAsc"
  | "deadlineDesc"
  | "priorityAsc"
  | "priorityDesc";

export default function TasksPage() {
  const { subjects } = useSubjects();

  const {
    tasks,
    loading,
    error,
    addTask,
    changeTaskStatus,
    togglePin,
    editTask,
    removeTask,
  } = useTasks();

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const [actionError, setActionError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("none");

  function handleResetFilters() {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSubjectFilter("all");
    setSortOption("none");
  }

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
      await editTask(editingTask.id, {
        ...values,
        status: editingTask.status,
        subjectId:
          values.subjectId !== undefined
            ? values.subjectId
            : editingTask.subjectId,
      });
    } else {
      await addTask(values);
    }

    handleCloseTaskForm();
  }

  async function handleConfirmDelete() {
    if (!taskToDelete) return;

    setActionError("");

    try {
      await removeTask(taskToDelete.id);
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
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await togglePin(taskId, !task.isPinned);
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

    changeTaskStatus(taskId, newStatus);
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

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

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

    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    if (subjectFilter !== "all") {
      result = result.filter((task) => task.subjectId === subjectFilter);
    }

    return result.sort((a, b) => {
      if ((a.isPinned ?? false) !== (b.isPinned ?? false)) {
        return a.isPinned ? -1 : 1;
      }

      switch (sortOption) {
        case "deadlineAsc": {
          const aTime = a.deadline
            ? new Date(a.deadline).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bTime = b.deadline
            ? new Date(b.deadline).getTime()
            : Number.MAX_SAFE_INTEGER;

          return aTime - bTime;
        }

        case "deadlineDesc": {
          const aTime = a.deadline
            ? new Date(a.deadline).getTime()
            : Number.MIN_SAFE_INTEGER;
          const bTime = b.deadline
            ? new Date(b.deadline).getTime()
            : Number.MIN_SAFE_INTEGER;

          return bTime - aTime;
        }

        case "priorityAsc":
          return a.priority - b.priority;

        case "priorityDesc":
          return b.priority - a.priority;

        default:
          return 0;
      }
    });
  }, [
    tasks,
    debouncedSearch,
    focusMode,
    statusFilter,
    priorityFilter,
    subjectFilter,
    sortOption,
  ]);

  const todoTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === TASK_STATUS.Todo),
    [filteredTasks],
  );

  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === TASK_STATUS.InProgress),
    [filteredTasks],
  );

  const doneTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === TASK_STATUS.Done),
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
    <div className={styles.content}>
      <div className={styles.header}>
        {actionError && <div className={styles.errorBanner}>{actionError}</div>}

        <div>
          <h1>Tasks</h1>
          <p>Manage your tasks efficiently.</p>
        </div>

        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      {/* 🔹 ACTIONS */}
      <div className={styles.actionsRow}>
        <button onClick={handleOpenCreateForm} className={styles.addTaskButton}>
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
        </div>
      </div>

      <div className={styles.filtersRow}>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as TaskStatus),
            )
          }
          className={styles.filterSelect}
        >
          <option value="all">All statuses</option>
          <option value={TASK_STATUS.Todo}>Todo</option>
          <option value={TASK_STATUS.InProgress}>In Progress</option>
          <option value={TASK_STATUS.Done}>Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as TaskPriority),
            )
          }
          className={styles.filterSelect}
        >
          <option value="all">All priorities</option>
          <option value={TASK_PRIORITY.Low}>Low</option>
          <option value={TASK_PRIORITY.Medium}>Medium</option>
          <option value={TASK_PRIORITY.High}>High</option>
        </select>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className={styles.filterSelect}
        >
          <option value="none">No sorting</option>
          <option value="deadlineAsc">Deadline ↑</option>
          <option value="deadlineDesc">Deadline ↓</option>
          <option value="priorityAsc">Priority ↑</option>
          <option value="priorityDesc">Priority ↓</option>
        </select>

        <button
          type="button"
          onClick={handleResetFilters}
          className={styles.resetFiltersButton}
        >
          Reset filters
        </button>
      </div>

      <div className={styles.focusWrapper}>
        {" "}
        <div className={styles.focusButtons}>
          {" "}
          {!focusMode ? (
            <button onClick={() => setFocusMode(true)}>Focus Mode</button>
          ) : (
            <button onClick={() => setFocusMode(false)}>Show all</button>
          )}{" "}
        </div>{" "}
        {focusMode && (
          <p className={styles.focusIndicator}>Showing today's tasks</p>
        )}{" "}
      </div>

      {/* 🔹 TASK LIST */}
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
    </div>
  );
}
