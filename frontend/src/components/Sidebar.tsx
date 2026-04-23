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
  const [subjectsOpen, setSubjectsOpen] = useState(true);

  const { logout } = useAuth();

  function handleAddClick() {
    onAdd(newName, newColor);
    setNewName("");
  }

  return (
    <>
      {isOpen && window.innerWidth <= 768 && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.logo}>TaskMate</div>

        <div className={styles.navSection}>
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <span
              className={styles.navIcon}
              style={{
                WebkitMaskImage: "url(/assets/icons/dashboard-icon.svg)",
              }}
            />
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
            <span
              className={styles.navIcon}
              style={{ WebkitMaskImage: "url(/assets/icons/tasks-icon.svg)" }}
            />
            Tasks
          </NavLink>

          <NavLink
            to="/calendar"
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <span
              className={styles.navIcon}
              style={{
                WebkitMaskImage: "url(/assets/icons/calendar-icon.svg)",
              }}
            />
            Calendar
          </NavLink>
        </div>

        <div className={styles.divider} />

        <div className={styles.subjectsContainer}>
          <div
            className={styles.subjectHeader}
            onClick={() => setSubjectsOpen((prev) => !prev)}
          >
            <span>Subjects</span>
            <span className={styles.chevron}>{subjectsOpen ? "▾" : "▸"}</span>
          </div>

          {subjectsOpen && (
            <>
              <div className={styles.subjectCard}>
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

                <div className={styles.quickAdd}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="+ Add tag"
                  />

                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />

                  <button
                    className={styles.quickAddAdd}
                    onClick={handleAddClick}
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {subjectError && <p className={styles.errorText}>{subjectError}</p>}

        <div className={styles.logoutWrapper}>
          <div className={styles.logoutItem} onClick={logout}>
            <span className={styles.logoutIcon}>↩</span>
            <span>Log out</span>
          </div>
        </div>
      </aside>
    </>
  );
}
