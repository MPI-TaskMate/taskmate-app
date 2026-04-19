import { useTasks } from "../hooks/useTasks";
import styles from "../styles/dashboard.module.css";
import ProgressCard from "../components/ProgressCard";
import { TASK_STATUS } from "../services/tasksService";

export default function DashboardPage() {
  const { tasks } = useTasks();

  const total = tasks.length;

  const done = tasks.filter((t) => t.status === TASK_STATUS.Done).length;
  const inProgress = tasks.filter(
    (t) => t.status === TASK_STATUS.InProgress,
  ).length;
  const todo = tasks.filter((t) => t.status === TASK_STATUS.Todo).length;

  const donePercent = total === 0 ? 0 : Math.round((done / total) * 100);
  const progressPercent =
    total === 0 ? 0 : Math.round((inProgress / total) * 100);
  const todoPercent = total === 0 ? 0 : Math.round((todo / total) * 100);

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.fullWidth}>
            <div className={styles.header}>
              <div>
                <h1>Dashboard</h1>
                <p>Overview of your tasks</p>
              </div>

              <div className={styles.topBadge}>
                {done}/{total} done
              </div>
            </div>

            <div className={styles.cardsRow}>
              <ProgressCard
                title="Todo"
                subtitle="Pending"
                progress={todoPercent}
                color="var(--color-primary)"
                count={todo}
              />

              <ProgressCard
                title="In Progress"
                subtitle="Ongoing"
                progress={progressPercent}
                color="var(--color-accent)"
                count={inProgress}
              />

              <ProgressCard
                title="Completed"
                subtitle="Done"
                progress={donePercent}
                color="var(--color-secondary)"
                count={done}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
