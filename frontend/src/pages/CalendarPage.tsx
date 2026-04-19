import TaskCalendar from "../components/TaskCalendar";
import { useTasks } from "../hooks/useTasks";
import styles from "../styles/tasks.module.css";

export default function CalendarPage() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className="container">

            <div className={styles.header}>
              <div>
                <h1>Calendar</h1>
                <p>View your tasks by deadline.</p>
              </div>
            </div>

            <div className={styles.calendarWrapper}>
              <TaskCalendar tasks={tasks} />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}