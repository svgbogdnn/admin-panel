// import { Navigate, Route, Routes } from "react-router-dom";
// import type { JSX } from "react";
// import AppLayout from "../components/layout/AppLayout";
// import LoginPage from "../pages/LoginPage";
// import RegisterPage from "../pages/RegisterPage";
// import CoursesPage from "../pages/CoursesPage";
// import AttendancePage from "../pages/AttendancePage";
// import FeedbackPage from "../pages/FeedbackPage";
// import ExportPage from "../pages/ExportPage";

// function hasToken() {
//   const token = localStorage.getItem("access_token");
//   return Boolean(token);
// }

// function RequireAuth(props: { children: JSX.Element }) {
//   if (!hasToken()) {
//     return <Navigate to="/login" replace />;
//   }
//   return props.children;
// }

// export default function AppRouter() {
//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />

//       <Route
//         path="/"
//         element={
//           <RequireAuth>
//             <AppLayout />
//           </RequireAuth>
//         }
//       >
//         <Route index element={<Navigate to="/courses" replace />} />
//         <Route path="courses" element={<CoursesPage />} />
//         <Route path="attendance" element={<AttendancePage />} />
//         <Route path="feedback" element={<FeedbackPage />} />
//         <Route path="export" element={<ExportPage />} />
//       </Route>

//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// frontend/src/router/index.tsx

import { Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CoursesPage from "../pages/CoursesPage";
import CourseDetailPage from "../pages/CourseDetailPage";
import CourseEditPage from "../pages/CourseEditPage";
import CourseCreatePage from "../pages/CourseCreatePage";
import AttendancePage from "../pages/AttendancePage";
import FeedbackPage from "../pages/FeedbackPage";
import ExportPage from "../pages/ExportPage";

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
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/courses" replace />} />

        {/* Курсы */}
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/new" element={<CourseCreatePage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="courses/:id/edit" element={<CourseEditPage />} />

        {/* Остальные страницы */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="export" element={<ExportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
