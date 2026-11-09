import { createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "../layouts/AdminLayout";
import ClassesPage from "../pages/admin/ClassesPage";
import NotFoundPage from "../pages/NotFoundPage";


export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin/classes" replace /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="classes" replace /> },
      { path: "classes", element: <ClassesPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);