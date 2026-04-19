import { useEffect, useState } from "react";
import TaskCalendar from "../components/TaskCalendar";
import { getTasks, type TaskItem } from "../services/tasksService";
import styles from "../styles/tasks.module.css";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

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