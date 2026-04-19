import styles from "../styles/tasks.module.css";
import type { CSSProperties } from "react";

type ViewMode = "list" | "kanban";

type ViewToggleProps = {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

type CSSVars = CSSProperties & {
  ["--bg-pos"]?: string;
};

export default function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  const bgPos = viewMode === "list" ? "0%" : "100%";

  const style: CSSVars = {
    transform:
      viewMode === "list" ? "translateX(0%)" : "translateX(100%)",
    "--bg-pos": bgPos,
  };

  return (
    <div className={styles.viewToggle}>
      <div className={styles.toggleIndicator} style={style} />

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