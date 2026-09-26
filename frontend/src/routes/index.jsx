import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout"; 
import Login from "../pages/Login";
import Register from "../pages/Register";
import RecoverPassword from "../pages/RecoverPassword";


const Dashboard = lazy(() => import("../pages/Dashboard"));
const Students = lazy(() => import("../pages/Students"));
const Disciplines = lazy(() => import("../pages/Disciplines"));
const Reports = lazy(() => import("../pages/Reports"));
const DataImport = lazy(() => import("../pages/DataImport"));
const Analysis = lazy(() => import("../pages/Analysis"));


const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<div>Carregando módulo...</div>}>
    {children}
  </Suspense>
);

const ProtectedRoute = () => {
  // const isAuthenticated = !!localStorage.getItem("@App:token");
  const isAuthenticated = true;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const appRoutes = createBrowserRouter([

  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/recoverpassword", element: <RecoverPassword /> },

  {
    element: <ProtectedRoute />, 
    children: [
      {
        element: <MainLayout />, 
        children: [
          { path: "/inicial", element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
          { path: "/alunos", element: <SuspenseWrapper><Students /></SuspenseWrapper> },
          { path: "/estudantes", element: <SuspenseWrapper><Disciplines /></SuspenseWrapper> },
          { path: "/relatorios", element: <SuspenseWrapper><Reports /></SuspenseWrapper> },
          { path: "/importacao-de-dados", element: <SuspenseWrapper><DataImport /></SuspenseWrapper> },
          { path: "/analises", element: <SuspenseWrapper><Analysis /></SuspenseWrapper> },
        ],
      },
    ],
  },

  { path: "*", element: <div>Página não encontrada (Criar componente 404)</div> },
]);