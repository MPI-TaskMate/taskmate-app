import { Routes, Route, Navigate } from "react-router-dom";
import TasksPage from "../pages/TasksPage";
import CalendarPage from "../pages/CalendarPage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AppLayout from "../components/AppLayout";
import { SubjectProvider } from "../context/SubjectContext";

export default function AppRoutes() {
  return (
    <SubjectProvider>
      <Routes>
        <Route path="*" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </SubjectProvider>
  );
}