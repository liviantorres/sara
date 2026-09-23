// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BarChart2, Users, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "Página Inicial", path: "/inicial", icon: Home },
    { label: "Análises", path: "/analises", icon: BarChart2 },
    { label: "Estudantes", path: "/estudantes", icon: Users },
    { label: "Relatórios", path: "/relatorios", icon: FileText },
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative select-none shrink-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex justify-end p-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>


      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center relative py-3 px-4 rounded-none text-sm font-medium transition-colors ${
                active 
                  ? "text-[#005386] bg-blue-50/60 font-semibold border-r-6 border-[#005386]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} className={active ? "text-[#005386]" : "text-gray-500"} />
              
              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}

            </Link>
          );
        })}
      </nav>
    </aside>
  );
}