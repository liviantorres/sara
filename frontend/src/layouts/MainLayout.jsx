import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  
  const location = useLocation();

  const pageTitles = {
    "/inicial": "Página Inicial",
    "/alunos": "Gerenciar Alunos",
    "/estudantes": "Estudantes",
    "/relatorios": "Relatórios",
    "/importacao-de-dados": "Importação de Dados",
    "/analises": "Análises Dashboard",
  };

  const currentTitle = pageTitles[location.pathname] || "SARA - Sistema";

  return (
   
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      
      <Header title={currentTitle} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>

      </div>
      
    </div>
  );
}