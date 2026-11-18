import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ErrorBoundary from "../components/ErrorBoundary";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(true);

  const location = useLocation();

  const pageTitles = {
    "/inicial": "Página Inicial",
    "/alunos": "Estudantes",
    "/estudantes": "Estudantes",
    "/disciplinas": "Disciplinas Gargalo",
    "/importacao": "Importação de Dados",
    "/usuarios": "Gestão de Usuários",
  };

  const currentTitle = location.pathname.startsWith("/alunos/")
    ? "Dossiê do Estudante"
    : pageTitles[location.pathname] || "SARA - Sistema";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F1F5F9]">
      <Header title={currentTitle} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}