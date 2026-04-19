import styles from "../styles/progressCard.module.css";

type Props = {
  title: string;
  subtitle: string;
  progress: number;
  color: string;
  count: number;
};

export default function ProgressCard({
  title,
  subtitle,
  progress,
  color,
  count,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{title}</h3>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.progressRow}>
        <span>Progress</span>
        <span>{progress}%</span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${progress}%`,
            background: color,
          }}
        />
      </div>

      <div className={styles.footer}>
        <span
          className={styles.badge}
          style={{
            background: color
          }}
        >
          {count} tasks
        </span>
      </div>
    </div>
  );
}