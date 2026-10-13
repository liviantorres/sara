
import React from "react";
import { Search, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Header({ title = "Página Inicial" }) {
    const { user, signOut } = useAuth();
    const userName = user?.nome || "Usuário SARA";
    const userRole = user?.email || "Acesso Restrito";

    return (
        <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between z-20 shrink-0">

            <div
                className="relative flex items-center w-64 h-full px-4 bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: "url('/src/assets/image 1.jpg')" }}
            >
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

                <div className="relative z-10 flex items-center gap-3">
                    <img
                        src="/src/assets/logo-ufc-horizontal.png"
                        alt="UFC Campus Crateús"
                        className="h-10 object-contain drop-shadow-sm"
                    />

                </div>
            </div>

            <div className="pl-6 flex-1">
                <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
            </div>


            <div className="flex items-center gap-8">

                <div className="flex items-center gap-4 select-none px-2 relative group cursor-pointer">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                        alt="Avatar do Usuário"
                        className="w-10 h-10 rounded-full bg-slate-100 border border-gray-200 object-cover"
                    />
                    <div className="text-left leading-tight hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-400">{userRole}</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />

                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <button
                            onClick={signOut}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <LogOut size={16} />
                            Sair do sistema
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}