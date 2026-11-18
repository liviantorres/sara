import React from "react";
import { Search, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoSaraEscuro from "../assets/sara-horizontal-escuro.svg";

export default function Header({ title = "Página Inicial" }) {
    const { user, signOut } = useAuth();
    const userName = user?.nome || "Usuário SARA";
    const userRole = user?.email || "Acesso Restrito";

    return (
        <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between z-20 shrink-0">

            <div className="flex items-center justify-center w-64 min-w-[16rem] shrink-0 h-full border-r border-gray-100 overflow-hidden bg-[#0B1B3F]">
                <img
                    src={logoSaraEscuro}
                    alt="SARA"
                    className="block w-full max-w-none h-full object-fill"
                />
            </div>

            <div className="pl-6 flex-1">
                <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
            </div>


            <div className="flex items-center gap-4 pr-6">
                <div className="flex items-center gap-3 select-none">
                    <div className="w-9 h-9 rounded-full bg-[#F1F5F9] border border-[#1D4ED8]/20 text-[#1D4ED8] font-bold text-sm flex items-center justify-center shrink-0">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left leading-tight hidden sm:block">
                        <p className="text-sm font-semibold text-[#0B1B3F]">{userName}</p>
                        <p className="text-xs text-gray-400">{userRole}</p>
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-200 hidden sm:block" />

                <button
                    onClick={signOut}
                    title="Sair do sistema"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#EF4444] hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </header>
    );
}
