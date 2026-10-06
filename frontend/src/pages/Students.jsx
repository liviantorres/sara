import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { exportarAlunos } from "../utils/exportUtils";
import ExportGroup from "../components/ExportGroup";
import { useCursos } from "../hooks/useCursos";
import StudentFilters from "../components/StudentFilters";
import DataTable from "../components/DataTable";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Students() {
    const [alunos, setAlunos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [pagina, setPagina] = useState(0);

    const [filtros, setFiltros] = useState({ matricula: "", situacao: "", ira: "", semestre: "", curso: "" });
    const { cursos } = useCursos();

    const [estatisticas, setEstatisticas] = useState({ total: 0, ira_medio: 0 })

    const navigate = useNavigate();

    const colunasAlunos = [
        {
            header: "Matrícula",
            cellClassName: "font-medium text-[#005386]",
            accessor: "matricula"
        },
        {
            header: "IRA",
            render: (aluno) => (
                <span className={aluno.ira < 7 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                    {aluno.ira}
                </span>
            )
        },
        {
            header: "Semestre",
            render: (aluno) => `${aluno.semestre_atual}º`
        },
        {
            header: "Situação",
            render: (aluno) => {
                const limiteSemestres = [2, 4, 5].includes(aluno.curso_id) ? 10 : 8;
                const isRetido = !aluno.formado && (aluno.semestre_atual > limiteSemestres);

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
            }
        },
        {
            header: "Ações",
            headerClassName: "text-center",
            cellClassName: "flex justify-center",
            render: (aluno) => (
                <button
                    onClick={() => navigate(`/alunos/${aluno.matricula}`)}
                    className="cursor-pointer p-1.5 text-gray-500 hover:text-[#005386] hover:bg-gray-100 rounded transition-colors"
                    title="Ver Perfil"
                >
                    <Eye size={18} />
                </button>
            )
        }
    ];

    const buscarAlunos = async () => {
        setCarregando(true);
        try {
            const pular = pagina * 10;
            let url = `/api/alunos?pular=${pular}&limite=10`;

            if (filtros.matricula) url += `&matricula=${filtros.matricula}`;
            if (filtros.situacao !== "") url += `&formado=${filtros.situacao}`;
            if (filtros.ira) url += `&ira_max=${filtros.ira}`;
            if (filtros.semestre) url += `&semestre=${filtros.semestre}`;
            if (filtros.curso) url += `&curso_id=${filtros.curso}`;

            const response = await api.get(url);

            let urlStats = `/api/alunos/estatisticas?`;
            if (filtros.matricula) urlStats += `&matricula=${filtros.matricula}`;
            if (filtros.situacao !== "") urlStats += `&formado=${filtros.situacao}`;
            if (filtros.ira) urlStats += `&ira_max=${filtros.ira}`;
            if (filtros.semestre) urlStats += `&semestre=${filtros.semestre}`;
            if (filtros.curso) urlStats += `&curso_id=${filtros.curso}`;

            const responseStats = await api.get(urlStats);

            setEstatisticas(responseStats.data);

            setAlunos(response.data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        } finally {
            setCarregando(false);
        }
    };

    const limparFiltros = () => {
        setFiltros({ matricula: "", situacao: "", ira: "", semestre: "", curso: "" });
        setPagina(0);
    };

    const gerarRelatorio = async (tipo) => {

        try {
            let url = `/api/alunos?pular=0&limite=999999`;
            if (filtros.matricula) url += `&matricula=${filtros.matricula}`;
            if (filtros.situacao !== "") url += `&formado=${filtros.situacao}`;
            if (filtros.ira) url += `&ira_max=${filtros.ira}`;
            if (filtros.semestre) url += `&semestre=${filtros.semestre}`;
            if (filtros.curso) url += `&curso_id=${filtros.curso}`;

            const response = await api.get(url);
            exportarAlunos(tipo, response.data, cursos);
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            alert("Ocorreu um erro ao gerar o relatório.");
        }
    };

    useEffect(() => {
        const carregarCursos = async () => {
            try {
                const response = await api.get("/api/cursos");
                setCursos(response.data);
            } catch (error) {
                console.error("Erro ao carregar os cursos do Back-end:", error);
            }
        };
        carregarCursos();
    }, []);

    useEffect(() => {
        buscarAlunos();
    }, [pagina, filtros.situacao, filtros.ira, filtros.semestre, filtros.curso]);

    return (
        <div className=" font-figtree bg-slate-50 min-h-screen">
            <div className=" font-figtree">

                <PageHeader
                    tag="Base de Dados"
                    title="Estudantes."
                    description="Gerencie o histórico de matrículas, consulte índices de rendimento (IRA) e acompanhe a situação atual dos discentes."
                    stats={[
                        { label: "Total Registrado", value: estatisticas.total },
                        { label: "IRA Médio", value: estatisticas.ira_medio, color: "text-green-600" }
                    ]}
                />

                <div className="flex justify-end mb-4">
                    <ExportGroup onExport={gerarRelatorio} />
                </div>

                <StudentFilters
                    filtros={filtros}
                    setFiltros={(novoFiltro) => {
                        setFiltros(novoFiltro);
                        setPagina(0);
                    }}
                    cursos={cursos}
                    onSearch={() => { setPagina(0); buscarAlunos(); }}
                    onClear={limparFiltros}
                />

                {carregando && alunos.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-[#005386] font-semibold animate-pulse text-lg">Buscando estudantes...</p>
                    </div>
                ) : (
                    <div className={`transition-opacity duration-300 ${carregando ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                        <DataTable
                            columns={colunasAlunos}
                            data={alunos}
                            isLoading={carregando && alunos.length === 0}
                            emptyMessage="Nenhum aluno encontrado com estes filtros."
                        />

                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm font-medium text-gray-600">Página {pagina + 1}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagina(pagina - 1)}
                                    disabled={pagina === 0}
                                    className="cursor-pointer flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    title="Voltar a página"
                                >
                                    <ChevronLeft size={16} /> Anterior
                                </button>
                                <button
                                    onClick={() => setPagina(pagina + 1)}
                                    disabled={alunos.length < 10}
                                    className="cursor-pointer flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#005386] rounded-lg hover:bg-[#003f66] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    title="Passar a página"
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