import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSubjects } from "../hooks/useSubjects";
import { useEffect, useState } from "react";
import styles from "../styles/layout.module.css";

export default function AppLayout() {
  const { subjects, subjectError, addSubject, removeSubject } = useSubjects();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${styles.layout} ${
        isMobile ? styles.layoutMobile : styles.layoutDesktop
      }`}
    >
      {isMobile && (
        <div className={styles.mobileHeader}>
          <button onClick={() => setIsSidebarOpen((prev) => !prev)}>☰</button>
          <h2>TaskMate</h2>
        </div>
      )}

      <Sidebar
        subjects={subjects}
        onAdd={addSubject}
        onDelete={removeSubject}
        subjectError={subjectError}
        isOpen={!isMobile || isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
