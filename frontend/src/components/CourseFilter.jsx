import React from "react";

export default function CourseFilter({ value, onChange, cursos, label = "Filtrar Curso" }) {
    return (
        <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[42px]">
            <div className="px-4 bg-gray-50 border-r border-gray-200 text-[#005386] font-bold text-[11px] uppercase tracking-widest flex items-center">
                {label}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white px-3 text-sm text-gray-800 focus:outline-none cursor-pointer font-semibold min-w-[200px]"
            >
                <option value="">Visão Geral (Todos)</option>
                {cursos && cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nome}</option>
                ))}
            </select>
        </div>
    );
}