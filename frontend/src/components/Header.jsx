// src/components/Header.jsx
import React from "react";
import { Search, ChevronDown } from "lucide-react";

export default function Header({ title = "Página Inicial", user = { name: "Zé Welligton", role: "Administrador" } }) {
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

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="pl-9 pr-4 py-1.5 w-64 bg-white border border-gray-300 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#005386] focus:ring-1 focus:ring-[#005386] transition-all"
                    />
                </div>


                <div className="flex items-center gap-3 cursor-pointer select-none px-2">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=ZeWelligton"
                        alt="Avatar do Usuário"
                        className="w-10 h-10 rounded-full bg-slate-100 border border-gray-200 object-cover"
                    />
                    <div className="text-left leading-tight hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                </div>
            </div>
        </header>
    );
}