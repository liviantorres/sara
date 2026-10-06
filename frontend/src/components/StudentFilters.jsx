import React from "react";
import { Search } from "lucide-react";

export default function StudentFilters({ filtros, setFiltros, cursos, onSearch, onClear }) {
    const { matricula, situacao, ira, semestre, curso } = filtros;
    const temFiltroAtivo = matricula || situacao || ira || semestre || curso;

    const handleChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    return (
        <div className="bg-white rounded-xl p-6 mb-6 flex flex-wrap gap-4 items-end shadow-sm shadow-blue-900/5 border border-gray-100">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Matrícula</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar matrícula..."
                        value={matricula}
                        onChange={(e) => handleChange('matricula', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter'}
                        className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 pl-4 pr-10 text-gray-700 focus:bg-white focus:border-[#005386] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                    <button onClick={onSearch} className="absolute right-3 top-2.5 text-gray-400 hover:text-[#005386]">
                        <Search size={20} />
                    </button>
                </div>
            </div>

            <div className="w-44">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Situação</label>
                <select
                    value={situacao}
                    onChange={(e) => { handleChange('situacao', e.target.value);}}
                    className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 px-4 text-gray-700 focus:bg-white focus:border-[#005386] transition-all outline-none cursor-pointer"
                >
                    <option value="">Todas as situações</option>
                    <option value="false">Cursando</option>
                    <option value="true">Formado</option>
                </select>
            </div>

            <div className="w-56">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Curso</label>
                <select
                    value={curso}
                    onChange={(e) => { handleChange('curso', e.target.value);}}
                    className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 px-4 text-gray-700 focus:bg-white focus:border-[#005386] transition-all outline-none cursor-pointer"
                >
                    <option value="">Todos os Cursos</option>
                    {cursos.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </div>

            <div className="w-32">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IRA Máx.</label>
                <input
                    type="number" step="0.1" placeholder="Ex: 7.0"
                    value={ira}
                    onChange={(e) => { handleChange('ira', e.target.value);}}
                    className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 px-4 text-gray-700 focus:bg-white focus:border-[#005386] transition-all outline-none"
                />
            </div>

            <div className="w-32">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Semestre</label>
                <input
                    type="number" placeholder="Ex: 5"
                    value={semestre}
                    onChange={(e) => { handleChange('semestre', e.target.value);}}
                    className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 px-4 text-gray-700 focus:bg-white focus:border-[#005386] transition-all outline-none"
                />
            </div>

            {temFiltroAtivo && (
                <button
                    onClick={onClear}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    Limpar
                </button>
            )}
        </div>
    );
}