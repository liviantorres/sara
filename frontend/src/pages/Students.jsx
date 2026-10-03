import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { api } from "../services/api";
import { ChevronLeft, ChevronRight, Search, GraduationCap  } from "lucide-react";

export default function Students() {
    const [alunos, setAlunos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [pagina, setPagina] = useState(0); 

    const [filtroMatricula, setFiltroMatricula] = useState("");
    const [filtroSituacao, setFiltroSituacao] = useState(""); 
    const [filtroIra, setFiltroIra] = useState("");
    const [filtroSemestre, setFiltroSemestre] = useState("");

    const buscarAlunos = async () => {
        setCarregando(true);
        try {
            const pular = pagina * 10;
            let url = `/api/alunos?pular=${pular}&limite=10`;
            
            if (filtroMatricula) url += `&matricula=${filtroMatricula}`;
            if (filtroSituacao !== "") url += `&formado=${filtroSituacao}`;
            if (filtroIra) url += `&ira_max=${filtroIra}`;
            if (filtroSemestre) url += `&semestre=${filtroSemestre}`;

            const response = await api.get(url);
            setAlunos(response.data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        buscarAlunos();
    }, [pagina, filtroSituacao, filtroIra, filtroSemestre]);

    return (
        <div className=" font-figtree bg-slate-50 min-h-screen">
            <div className=" font-figtree">
                              {/* CABEÇALHO HARMONIZADO COM O SISTEMA */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                            {/* Tag sutil */}
                            <span className="text-[#005386] font-bold text-[11px] uppercase tracking-widest mb-2 block">
                                Base de Dados
                            </span>
                            
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tight font-figtree">
                            Estudantes.
                            </h1>
                            
                            <p className="text-gray-500 mt-2 text-sm max-w-xl font-figtree">
                                Gerencie o histórico de matrículas, consulte índices de rendimento acadêmico (IRA) e acompanhe a situação atual dos discentes.
                            </p>
                        </div>

                        {/* Mini-Dashboard (Usando o estilo de Cards do seu projeto) */}
                        <div className="flex gap-4 w-full lg:w-auto">
                            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex-1 lg:min-w-[150px]">
                                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Total Registrado</p>
                                {/* Nota: Esse número é visual por enquanto, depois puxaremos do Back-end! */}
                                <p className="text-2xl font-bold text-[#005386] font-figtree">1.024</p>
                            </div>
                            
                            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex-1 lg:min-w-[150px]">
                                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">IRA Médio</p>
                                <p className="text-2xl font-bold text-green-600 font-figtree">6.8</p>
                            </div>
                        </div>
                    </div>

                    {/* A famosa linha de gradiente! (Dá um toque premium sem pesar a tela) */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#005386] via-[#00A3E0] to-transparent rounded-full mt-8 opacity-90"></div>
                </div>

                                {/* BARRA DE FILTROS PREMIUM */}
                <div className="bg-white rounded-xl p-6 mb-6 flex flex-wrap gap-4 items-end shadow-sm shadow-blue-900/5 border border-gray-100">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Matrícula</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Buscar matrícula..."
                                value={filtroMatricula}
                                onChange={(e) => setFiltroMatricula(e.target.value)}
                                className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 pl-4 pr-10 text-gray-700 focus:bg-white focus:border-[#005386] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                            />
                            <button onClick={() => { setPagina(0); buscarAlunos(); }} className="absolute right-3 top-2.5 text-gray-400 hover:text-[#005386] transition-colors">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="w-44">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Situação</label>
                        <select 
                            value={filtroSituacao} 
                            onChange={(e) => { setFiltroSituacao(e.target.value); setPagina(0); }}
                            className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 px-4 text-gray-700 focus:bg-white focus:border-[#005386] focus:ring-4 focus:ring-blue-50 transition-all outline-none cursor-pointer"
                        >
                            <option value="">Todas as situações</option>
                            <option value="false">Cursando</option>
                            <option value="true">Formado</option>
                        </select>
                    </div>

                    <div className="w-32">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IRA Máx.</label>
                        <input 
                            type="number" step="0.1" placeholder="Ex: 7.0"
                            value={filtroIra}
                            onChange={(e) => { setFiltroIra(e.target.value); setPagina(0); }}
                            className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 px-4 text-gray-700 focus:bg-white focus:border-[#005386] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                        />
                    </div>

                    <div className="w-32">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Semestre</label>
                        <input 
                            type="number" placeholder="Ex: 5"
                            value={filtroSemestre}
                            onChange={(e) => { setFiltroSemestre(e.target.value); setPagina(0); }}
                            className="w-full bg-slate-50 border border-transparent rounded-lg py-2.5 px-4 text-gray-700 focus:bg-white focus:border-[#005386] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                        />
                    </div>

                    {(filtroMatricula || filtroSituacao || filtroIra || filtroSemestre) && (
                        <button 
                            onClick={() => {
                                setFiltroMatricula(""); setFiltroSituacao(""); setFiltroIra(""); setFiltroSemestre(""); setPagina(0);
                            }}
                            className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {carregando && alunos.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-[#005386] font-semibold animate-pulse text-lg">Buscando estudantes...</p>
                    </div>
                ) : (
                    <div className={`transition-opacity duration-300 ${carregando ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                        <Table data={alunos} />
                       
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm font-medium text-gray-600">Página {pagina + 1}</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPagina(pagina - 1)}
                                    disabled={pagina === 0}
                                    className="cursor-pointer flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} /> Anterior
                                </button>
                                <button 
                                    onClick={() => setPagina(pagina + 1)}
                                    disabled={alunos.length < 10}
                                    className="cursor-pointer flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#005386] rounded-lg hover:bg-[#003f66] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Próxima <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}