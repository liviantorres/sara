
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Users,
    TrendingUp,
} from "lucide-react";

import { api } from "../services/api";
import PageHeader from "../components/PageHeader";
import ExportGroup from "../components/ExportGroup";
import StudentFilters from "../components/StudentFilters";
import DataTable from "../components/DataTable";
import { useCursos } from "../hooks/useCursos";
import { exportarAlunos } from "../utils/exportUtils";

const LIMITE_PAGINA = 20;

const FILTROS_INICIAIS = {
    matricula: "",
    situacao: "",
    ira: "",
    semestre: "",
    curso: "",
};

export default function Students() {
    const navigate = useNavigate();
    const { cursos } = useCursos();

    const [alunos, setAlunos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [pagina, setPagina] = useState(0);
    const [versaoBusca, setVersaoBusca] = useState(0);
    const [itensPorPagina, setItensPorPagina] = useState(25);

    const [filtros, setFiltros] = useState(FILTROS_INICIAIS);

    const [estatisticas, setEstatisticas] = useState({
        total: 0,
        ira_medio: 0,
    });

    // Parâmetros compartilhados entre consulta e exportação
    const criarParametros = (paginaAtual, limite) => {
        const params = new URLSearchParams({
            pular: String(paginaAtual * limite),
            limite: String(limite),
        });

        if (filtros.matricula.trim()) {
            params.set("matricula", filtros.matricula.trim());
        }

        if (filtros.situacao !== "") {
            params.set("formado", filtros.situacao);
        }

        if (filtros.ira !== "") {
            params.set("ira_max", filtros.ira);
        }

        if (filtros.semestre !== "") {
            params.set("semestre", filtros.semestre);
        }

        if (filtros.curso !== "") {
            params.set("curso_id", filtros.curso);
        }

        return params;
    };

    // Carregamento dos estudantes
    useEffect(() => {
        let ativo = true;

        const buscarAlunos = async () => {
            setCarregando(true);

            try {
                const params = criarParametros(
                    pagina,
                    itensPorPagina
                );

                const paramsStats = criarParametros(0, 1);
                paramsStats.delete("pular");
                paramsStats.delete("limite");

                const [response, responseStats] =
                    await Promise.all([
                        api.get(
                            `/api/alunos?${params.toString()}`
                        ),
                        api.get(
                            `/api/alunos/estatisticas?${paramsStats.toString()}`
                        ),
                    ]);

                if (!ativo) return;

                setAlunos(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

                setEstatisticas({
                    total: Number(
                        responseStats.data?.total || 0
                    ),
                    ira_medio: Number(
                        responseStats.data?.ira_medio || 0
                    ),
                });
            } catch (error) {
                if (!ativo) return;

                console.error(
                    "Erro ao buscar estudantes:",
                    error
                );

                setAlunos([]);
                setEstatisticas({
                    total: 0,
                    ira_medio: 0,
                });
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        };

        const timeout = setTimeout(buscarAlunos, 500);

        return () => {
            ativo = false;
            clearTimeout(timeout);
        };
    }, [pagina, filtros, versaoBusca, itensPorPagina]);

    // Filtros
    const atualizarFiltros = (novoFiltro) => {
        setFiltros(novoFiltro);
        setPagina(0);
    };

    const limparFiltros = () => {
        setFiltros({ ...FILTROS_INICIAIS });
        setPagina(0);
    };

    const pesquisar = () => {
        setPagina(0);
        setVersaoBusca((anterior) => anterior + 1);
    };

    // Exportação
    const gerarRelatorio = async (tipo) => {
        try {
            const params = criarParametros(0, 999999);

            const response = await api.get(
                `/api/alunos?${params.toString()}`
            );

            exportarAlunos(
                tipo,
                response.data,
                cursos
            );
        } catch (error) {
            console.error(
                "Erro ao gerar relatório:",
                error
            );

            alert(
                "Ocorreu um erro ao gerar o relatório."
            );
        }
    };

    // Colunas da tabela
    const colunasAlunos = [
        {
            header: "Matrícula",
            accessor: "matricula",
            cellClassName:
                "font-medium text-[#005386]",
        },
        {
            header: "IRA",
            render: (aluno) => {
                const ira = Number(aluno.ira);

                return (
                    <span
                        className={`font-medium ${ira < 7
                            ? "text-[#C2413B]"
                            : "text-[#2F7D5A]"
                            }`}
                    >
                        {Number.isFinite(ira)
                            ? ira.toFixed(2)
                            : "—"}
                    </span>
                );
            },
        },
        {
            header: "Semestre",
            render: (aluno) => (
                <span className="text-gray-700">
                    {aluno.semestre_atual != null
                        ? `${aluno.semestre_atual}º`
                        : "—"}
                </span>
            ),
        },
        {
            header: "Situação",
            render: (aluno) => {
                const cursoId = Number(aluno.curso_id);
                const semestre = Number(
                    aluno.semestre_atual
                );

                const limiteSemestres =
                    [2, 4, 5].includes(cursoId)
                        ? 10
                        : 8;

                const isRetido =
                    !aluno.formado &&
                    semestre > limiteSemestres;

                if (aluno.formado) {
                    return (
                        <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-[#2F7D5A]">
                            Formado
                        </span>
                    );
                }

                if (isRetido) {
                    return (
                        <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-[#C2413B]">
                            Retido
                        </span>
                    );
                }

                return (
                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#005386]">
                        Fluxo regular
                    </span>
                );
            },
        },
        {
            header: "Ações",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (aluno) => (
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/alunos/${aluno.matricula}`
                        )
                    }
                    className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#005386]"
                    title="Visualizar perfil acadêmico"
                    aria-label={`Visualizar aluno ${aluno.matricula}`}
                >
                    <Eye size={17} />
                </button>
            ),
        },
    ];

    const totalAlunos = Number(estatisticas.total) || 0;

    const totalPaginas = Math.max(
        1,
        Math.ceil(totalAlunos / itensPorPagina)
    );

    const podeVoltar = pagina > 0 && !carregando;

    const podeAvancar =
        !carregando &&
        (pagina + 1) * itensPorPagina < totalAlunos;

    return (
        <div className="font-figtree">
            {/* Cabeçalho */}
            <PageHeader
                tag="Base de Dados"
                title="Estudantes"
                description="Consulte os registros acadêmicos e acompanhe a situação dos estudantes."
                stats={[
                    {
                        label: "Total de estudantes",
                        value: totalAlunos,
                        icon: <Users size={16} />,
                    },
                    {
                        label: "IRA médio",
                        value: Number(
                            estatisticas.ira_medio
                        ).toFixed(2),
                        icon: <TrendingUp size={16} />,
                    },
                ]}
            />

            {/* Exportação */}
            <div className="mb-5 flex justify-end">
                <ExportGroup
                    onExport={gerarRelatorio}
                />
            </div>

            {/* Filtros */}
            <StudentFilters
                filtros={filtros}
                setFiltros={atualizarFiltros}
                cursos={cursos}
                onSearch={pesquisar}
                onClear={limparFiltros}
            />

            {/* Histórico de estudantes */}
            <section className="mb-8">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                            Lista de Estudantes
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Relação de estudantes e suas
                            informações acadêmicas.
                        </p>
                    </div>

                    <span className="text-xs font-medium text-gray-500">
                        {totalAlunos}{" "}
                        {totalAlunos === 1
                            ? "estudante encontrado"
                            : "estudantes encontrados"}
                    </span>
                </div>

                <DataTable
                    columns={colunasAlunos}
                    data={alunos}
                    isLoading={carregando}
                    emptyMessage="Nenhum estudante encontrado com os filtros selecionados."
                />

                {/* Paginação */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                    {/* Paginação */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    Exibir
                                </span>

                                <select
                                    value={itensPorPagina}
                                    onChange={(e) => {
                                        setItensPorPagina(Number(e.target.value));
                                        setPagina(0);
                                    }}
                                    className="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#005386]"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>

                                <span className="text-sm text-gray-500">
                                    por página
                                </span>
                            </div>

                            <span className="text-sm text-gray-500">
                                {totalAlunos === 0
                                    ? "Nenhum registro"
                                    : `${pagina * itensPorPagina + 1}–${Math.min(
                                        (pagina + 1) * itensPorPagina,
                                        totalAlunos
                                    )} de ${totalAlunos} estudantes`}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                Página {pagina + 1} de {totalPaginas}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPagina((anterior) =>
                                        Math.max(0, anterior - 1)
                                    )
                                }
                                disabled={!podeVoltar}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                                Anterior
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPagina((anterior) => anterior + 1)
                                }
                                disabled={!podeAvancar}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#005386] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#004a78] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Próxima
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
