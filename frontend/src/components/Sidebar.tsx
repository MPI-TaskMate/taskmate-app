import { useState } from "react";
import type { Subject } from "../services/subjectsService";
import { NavLink } from "react-router-dom";
import styles from "../styles/sidebar.module.css";

type Props = {
  subjects: Subject[];
  onAdd: (name: string, color: string) => void;
  onDelete: (id: string) => void;
  subjectError?: string;
};

export default function Sidebar({
  subjects,
  onAdd,
  onDelete,
  subjectError,
}: Props) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#4f9fd1");
  const [showAdd, setShowAdd] = useState(false);

  function handleAddClick() {
    onAdd(newName, newColor);
    setNewName("");
    setShowAdd(false);
  }

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Navigation</h3>

      <div className={styles.navSection}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/tasks"
          end
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          Tasks
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          Calendar
        </NavLink>
      </div>

      <div className={styles.divider} />

      <h3 className={styles.sidebarTitle}>Subjects</h3>
      <div className={styles.subjectList}>
        <div className={styles.subjectRow}>All</div>
        {subjects.map((s) => (
          <div key={s.id} className={styles.subjectRow}>
            <div className={styles.subjectLeft}>
              <span
                className={styles.tagIcon}
                style={{ backgroundColor: s.color || "#94a3b8" }}
              />
              <span>{s.name}</span>
            </div>

            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        className={styles.addTagButton}
        onClick={() => setShowAdd((prev) => !prev)}
      >
        + Add tag
      </button>

      {showAdd && (
        <div className={styles.quickAdd}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Subject name"
          />

          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />

          <button className={styles.quickAddAdd} onClick={handleAddClick}>
            +
          </button>
        </div>
      )}
      {subjectError && <p className={styles.errorText}>{subjectError}</p>}
    </aside>
  );
}
