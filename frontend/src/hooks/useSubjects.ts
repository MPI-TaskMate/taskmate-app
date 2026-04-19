import { useContext } from "react";
import { SubjectContext } from "../context/SubjectContextDefinition";

export function useSubjects() {
  return useContext(SubjectContext);
}