import { useState } from "react";
import type { Subject } from "../services/subjectsService";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "../styles/sidebar.module.css";

type Props = {
  subjects: Subject[];
  onAdd: (name: string, color: string) => void;
  onDelete: (id: string) => void;
  subjectError?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  subjects,
  onAdd,
  onDelete,
  subjectError,
  isOpen,
  onClose,
}: Props) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#4f9fd1");
  const [showAdd, setShowAdd] = useState(false);

  const { logout } = useAuth();

  function handleAddClick() {
    onAdd(newName, newColor);
    setNewName("");
    setShowAdd(false);
  }

  return (
    <>
      {isOpen && window.innerWidth <= 768 && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        <h3 className={styles.sidebarTitle}>Navigation</h3>

        <div className={styles.navSection}>
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/tasks"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            Tasks
          </NavLink>

          <NavLink
            to="/calendar"
            onClick={onClose}
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
              type="text"
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

        <div className={styles.logoutWrapper}>
          <button className={styles.logoutButton} onClick={logout}>
            <span className={styles.logoutIcon}>↩</span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
