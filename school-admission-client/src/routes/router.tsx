import { createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "../layouts/AdminLayout";
import HomeLayout from "../layouts/HomeLayout";
import ClassesPage from "../pages/admin/ClassesPage";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="classes" replace />,
          },
          {
            path: "classes",
            element: <ClassesPage />,
          },
        ],
      },
    ],
  },
]);