import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/LoginPage";
import CoursesPage from "../pages/CoursesPage";
import AttendancePage from "../pages/AttendancePage";
import FeedbackPage from "../pages/FeedbackPage";
import ExportPage from "../pages/ExportPage";
import type { JSX } from "react";

function hasToken() {
  const token = localStorage.getItem("access_token");
  return Boolean(token);
}

function RequireAuth(props: { children: JSX.Element }) {
  if (!hasToken()) {
    return <Navigate to="/login" replace />;
  }
  return props.children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/courses" replace />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="export" element={<ExportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
}
