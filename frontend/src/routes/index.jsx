import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import RecoverPassword from "../pages/RecoverPassword";


const Dashboard = lazy(() => import("../pages/Dashboard"));
const Students = lazy(() => import("../pages/Students"));
const Disciplines = lazy(() => import("../pages/Disciplines"));
const DataImport = lazy(() => import("../pages/DataImport"));
const StudentProfile = lazy(() => import("../pages/StudentProfile"))
const Users = lazy(() => import("../pages/Users"));

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center py-20 gap-2 text-sm text-gray-500 font-figtree">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#1D4ED8]" />
        Carregando módulo...
      </div>
    }
  >
    {children}
  </Suspense>
);

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem("@App:token");

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const DaeRoute = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("@App:user") || "{}");
    if (storedUser?.papel === "dae") {
      return <Outlet />;
    }
  } catch {

  }
  return <Navigate to="/inicial" replace />;
};

export const appRoutes = createBrowserRouter([

  { path: "/", element: <Login /> },
  { path: "/recoverpassword", element: <RecoverPassword /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/inicial", element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
          { path: "/alunos", element: <SuspenseWrapper><Students /></SuspenseWrapper> },
          { path: "/alunos/:matricula", element: <SuspenseWrapper><StudentProfile /></SuspenseWrapper> },
          { path: "/disciplinas", element: <SuspenseWrapper><Disciplines /></SuspenseWrapper> },
          {
            element: <DaeRoute />,
            children: [
              { path: "/importacao", element: <SuspenseWrapper><DataImport /></SuspenseWrapper> },
              { path: "/usuarios", element: <SuspenseWrapper><Users /></SuspenseWrapper> },
            ]
          }
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);