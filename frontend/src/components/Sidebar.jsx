import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, BookOpen, Database, UserCog, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const isDae = user?.papel === "dae";

  const navItems = [
    { label: "Dashboard", path: "/inicial", icon: Home },
    { label: "Alunos", path: "/alunos", icon: Users },
    { label: "Disciplinas", path: "/disciplinas", icon: BookOpen },
    ...(isDae
      ? [
        { label: "Importar Dados", path: "/importacao", icon: Database },
        { label: "Usuários", path: "/usuarios", icon: UserCog },
      ]
      : []),
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative select-none shrink-0 ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex justify-end p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer text-gray-400 hover:text-[#1D4ED8] p-1 rounded-md hover:bg-[#F1F5F9] transition-colors"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            currentPath === item.path ||
            currentPath.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center relative py-3 px-4 rounded-none text-sm font-medium transition-colors ${active
                  ? "text-[#1D4ED8] bg-[#F1F5F9] font-semibold border-r-6 border-[#1D4ED8]"
                  : "text-gray-600 hover:bg-[#F1F5F9]/60 hover:text-[#0B1B3F]"
                }`}
            >
              <Icon size={20} className={active ? "text-[#1D4ED8]" : "text-gray-500"} />

              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
      {/*
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={signOut}
          title="Sair do sistema"
          className={`w-full flex items-center py-3 px-4 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="ml-3 truncate">Sair do sistema</span>}
        </button>
      </div>
      */}
    </aside>
  );
}