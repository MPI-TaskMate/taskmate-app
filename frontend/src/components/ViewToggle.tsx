import styles from "../styles/tasks.module.css";

type ViewMode = "list" | "kanban";

type ViewToggleProps = {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export default function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className={styles.viewToggle}>
      <div
        className={styles.toggleIndicator}
        style={{
          transform:
            viewMode === "list" ? "translateX(0%)" : "translateX(100%)",
          ["--bg-pos" as any]: viewMode === "list" ? "0%" : "100%",
        }}
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
