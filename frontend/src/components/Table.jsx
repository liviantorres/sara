import React from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Table({ data }) {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-white rounded-lg border border-gray-300 overflow-hidden font-figtree">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-blue-50/50 text-[#00427A] text-[13px] uppercase tracking-wider border-b border-blue-100/50">
                            <th className="px-6 py-4 font-semibold">Matrícula</th>
                            <th className="px-6 py-4 font-semibold">IRA</th>
                            <th className="px-6 py-4 font-semibold">Semestre</th>
                            <th className="px-6 py-4 font-semibold">Situação</th>
                            <th className="px-6 py-4 font-semibold text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                        {data.map((aluno) => (
                            <tr key={aluno.matricula} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-[#005386]">{aluno.matricula}</td>
                                
                                <td className="px-6 py-4 font-medium">
                                    <span className={aluno.ira < 7 ? "text-red-600" : "text-green-600"}>
                                        {aluno.ira}
                                    </span>
                                </td>
                                
                                <td className="px-6 py-4">{aluno.semestre_atual}º</td>
                                                                <td className="px-6 py-4">
                                    {/* Lógica Rápida (Self-Invoking Function) para definir a badge da linha */}
                                    {(() => {
                                        const isRetido = !aluno.formado && (aluno.semestre_atual >= 12  || aluno.ira < 5.0);
                                        
                                        if (aluno.formado) {
                                            return (
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                                                    Formado
                                                </span>
                                            );
                                        }
                                        if (isRetido) {
                                            return (
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 flex items-center gap-1 w-max shadow-sm">
                                                    <span className="text-[10px]">⚠️</span> Risco / Retido
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#005386] border border-blue-200">
                                                Fluxo Regular
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-6 py-4 flex justify-center">
                                    <button 
                                        onClick={() => navigate(`/alunos/${aluno.matricula}`)}
                                        className="cursor-pointer p-1.5 text-gray-500 hover:text-[#005386] hover:bg-gray-100 rounded transition-colors"
                                        title="Ver Perfil"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-figtree">
                    Nenhum aluno encontrado com estes filtros.
                </div>
            )}
        </div>
    );
}