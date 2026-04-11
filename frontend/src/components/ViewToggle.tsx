import styles from "../styles/dashboard.module.css";

type ViewMode = "list" | "kanban";

type ViewToggleProps = {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export default function ViewToggle({
  viewMode,
  onChange,
}: ViewToggleProps) {
  return (
    <div className={styles.viewToggle}>
      {/* 🔥 indicator */}
      <div
        className={`${styles.toggleIndicator} ${
          viewMode === "kanban" ? styles.right : styles.left
        }`}
      />

      <button
        className={`${styles.toggleButton} ${
          viewMode === "list" ? styles.activeToggle : ""
        }`}
        onClick={() => onChange("list")}
      >
        List
      </button>

      <button
        className={`${styles.toggleButton} ${
          viewMode === "kanban" ? styles.activeToggle : ""
        }`}
        onClick={() => onChange("kanban")}
      >
        Kanban
      </button>
    </div>
  );
}