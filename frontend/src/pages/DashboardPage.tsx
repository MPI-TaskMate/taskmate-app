import styles from "../styles/tasks.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className="container">

            <div className={styles.header}>
              <div>
                <h1>Dashboard</h1>
                <p>Overview of your tasks and activity.</p>
              </div>
            </div>

            <div>
              <p>Welcome to your dashboard</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}