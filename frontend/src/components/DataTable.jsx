import React from "react";

export default function DataTable({ columns, data, isLoading, emptyMessage = "Nenhum dado encontrado." }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm shadow-blue-900/5 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm">
                        <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-600 font-bold">
                            {/* Renderiza os cabeçalhos dinamicamente */}
                            {columns.map((col, index) => (
                                <th key={index} className={`p-4 ${col.headerClassName || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500 font-semibold">
                                    <div className="flex justify-center items-center">
                                        <span className="animate-pulse text-[#005386]">Carregando dados...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500 font-semibold">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            /* Renderiza as linhas dinamicamente */
                            data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={`p-4 ${col.cellClassName || ''}`}>
                                            {/* Se a coluna tiver uma função de render customizada, usa ela, senão pega a propriedade direto do dado (accessor) */}
                                            {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}