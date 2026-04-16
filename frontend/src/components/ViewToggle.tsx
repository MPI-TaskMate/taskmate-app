import styles from "../styles/dashboard.module.css";

type ViewMode = "list" | "kanban" | "calendar";

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
            viewMode === "list"
              ? "translateX(0%)"
              : viewMode === "kanban"
                ? "translateX(100%)"
                : "translateX(200%)",
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

      <button
        className={`${styles.toggleButton} ${
          viewMode === "calendar" ? styles.activeToggle : ""
        }`}
        onClick={() => onChange("calendar")}
      >
        Calendar
      </button>
    </div>
  );
}
