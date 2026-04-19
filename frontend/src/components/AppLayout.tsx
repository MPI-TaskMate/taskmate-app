import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSubjects } from "../hooks/useSubjects";

export default function AppLayout() {
  const { subjects, subjectError, addSubject, removeSubject } = useSubjects();

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        subjects={subjects}
        onAdd={addSubject}
        onDelete={removeSubject}
        subjectError={subjectError}
      />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
