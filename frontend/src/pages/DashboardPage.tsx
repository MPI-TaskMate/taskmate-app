import { useMemo } from "react";
import { useTasks } from "../hooks/useTasks";
import styles from "../styles/dashboard.module.css";
import ProgressCard from "../components/ProgressCard";
import { TASK_STATUS } from "../services/tasksService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid, 
} from "recharts";

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
}

export default function DashboardPage() {
  const { tasks } = useTasks();
  const total = tasks.length;

  const done = tasks.filter((t) => t.status === TASK_STATUS.Done).length;
  const inProgress = tasks.filter((t) => t.status === TASK_STATUS.InProgress,).length;
  const todo = tasks.filter((t) => t.status === TASK_STATUS.Todo).length;

  const donePercent = total === 0 ? 0 : Math.round((done / total) * 100);
  const progressPercent = total === 0 ? 0 : Math.round((inProgress / total) * 100);
  const todoPercent = total === 0 ? 0 : Math.round((todo / total) * 100);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const data = days.map((day) => ({
      day,
      count: 0,
    }));

    tasks.forEach((task) => {
      if (task.status !== TASK_STATUS.Done) return;
      if (!task.updatedAt) return;

      const date = new Date(task.updatedAt);

      if (date < startOfWeek) return;

      let dayIndex = date.getDay(); 
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; 

      data[dayIndex].count++;
    });

    return data;
  }, [tasks]);

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

            <div className={styles.chartWrapper}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>Weekly Completion</h2>
                    <p className={styles.chartSubtitle}>
                      Tasks completed per day 
                    </p>
                  </div>
                </div>

                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        className={styles.bar}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
