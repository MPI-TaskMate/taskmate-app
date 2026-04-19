import { createContext, useContext, useEffect, useState } from "react";
import {
  getSubjects,
  createSubject,
  deleteSubject,
  type Subject,
} from "../services/subjectsService";

type SubjectContextType = {
  subjects: Subject[];
  subjectError: string;
  addSubject: (name: string, color: string) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
};

const SubjectContext = createContext<SubjectContextType | null>(null);

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

export function useSubjects() {
  const ctx = useContext(SubjectContext);
  if (!ctx) throw new Error("useSubjects must be used inside SubjectProvider");
  return ctx;
}