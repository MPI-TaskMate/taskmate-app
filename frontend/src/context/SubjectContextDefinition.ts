import { createContext } from "react";
import type { Subject } from "../services/subjectsService";

type SubjectContextType = {
  subjects: Subject[];
  subjectError: string;
  addSubject: (name: string, color: string) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
};

export const SubjectContext = createContext<SubjectContextType>({
  subjects: [],
  subjectError: "",
  addSubject: async () => {},
  removeSubject: async () => {},
});