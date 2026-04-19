import { useEffect, useState } from "react";
import { SubjectContext } from "./SubjectContextDefinition";
import {
  getSubjects,
  createSubject,
  deleteSubject,
  type Subject,
} from "../services/subjectsService";

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectError, setSubjectError] = useState("");

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => setSubjectError("Failed to load subjects."));
  }, []);

  async function addSubject(name: string, color: string) {
    if (!name.trim()) {
      setSubjectError("Name is required");
      return;
    }

    try {
      const subject = await createSubject({ name: name.trim(), color });
      setSubjects((prev) => [...prev, subject]);
      setSubjectError("");
    } catch {
      setSubjectError("Failed to create subject.");
    }
  }

  async function removeSubject(id: string) {
    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setSubjectError("");
    } catch {
      setSubjectError("Failed to delete subject.");
    }
  }

  return (
    <SubjectContext.Provider
      value={{ subjects, subjectError, addSubject, removeSubject }}
    >
      {children}
    </SubjectContext.Provider>
  );
}