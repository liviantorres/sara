
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    AlertTriangle,
    AlertCircle,
    Clock,
    CheckCircle2,
    BookOpen,
    Activity,
    GraduationCap,
    MapPin,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import { api } from "../services/api";
import PageHeader from "../components/PageHeader";
import KPICard from "../components/KPICard";
import ChartContainer from "../components/ChartContainer";
import DataTable from "../components/DataTable";
import { SkeletonCard, SkeletonChart } from "../components/Skeleton";
import { useCursos } from "../hooks/useCursos";

const CORES = {
    azul: "#1D4ED8",
    vermelho: "#EF4444",
    verde: "#10B981",
    
    texto: "#0B1B3F",
    borda: "#E2E8F0",
};

const tooltipStyle = {
    backgroundColor: "#fff",
    border: `1px solid ${CORES.borda}`,
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "12px",
};

export default function StudentProfile() {
    const { matricula } = useParams();
    const navigate = useNavigate();
    const { cursos } = useCursos();
    const [aluno, setAluno] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;

        const buscarDossie = async () => {
            setCarregando(true);
            setAluno(null);
            setHistorico([]);

            try {
                const [respAluno, respHist] = await Promise.all([
                    api.get("/api/alunos", {
                        params: { matricula },
                    }),
                    api.get("/api/historicos", {
                        params: { aluno_matricula: matricula },
                    }),
                ]);

                if (!ativo) return;

                const alunos = Array.isArray(respAluno.data)
                    ? respAluno.data
                    : [];

                const alunoEncontrado = alunos.find(
                    (item) =>
                        String(item.matricula) === String(matricula)
                );

                setAluno(alunoEncontrado || null);

                setHistorico(
                    Array.isArray(respHist.data)
                        ? respHist.data
                        : []
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar perfil acadêmico:",
                    error
                );
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        };

        buscarDossie();

        return () => {
            ativo = false;
        };
    }, [matricula]);

    if (carregando) {
        return (
            <div className="font-figtree">
                <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-gray-200" />

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <SkeletonChart />
                    <SkeletonChart />
                </div>
            </div>
        );
    }

    if (!aluno) {
        return (
            <div className="font-figtree">
                <button
                    type="button"
                    onClick={() => navigate("/alunos")}
                    className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#1D4ED8]"
                >
                    <ArrowLeft size={16} />
                    Voltar para alunos
                </button>

                <div className="rounded-md border border-gray-200 bg-white px-6 py-14 text-center">
                    <AlertCircle
                        size={30}
                        className="mx-auto mb-3 text-gray-400"
                    />

                    <h2 className="text-lg font-semibold text-gray-900">
                        Aluno não encontrado
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Não foi encontrado um aluno com a matrícula{" "}
                        {matricula}.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/alunos")}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] text-white rounded-md text-sm font-medium hover:bg-[#1E40AF] transition-colors cursor-pointer"
                    >
                        Voltar para a lista
                    </button>
                </div>
            </div>
        );
    }

    // Indicadores acadêmicos
    const cursoDoAluno = cursos.find(
        (c) => String(c.id) === String(aluno.curso_id)
    );

    const metaHoras = Number(cursoDoAluno?.carga_horaria) || 3000;
    const cargaHorariaTotal = Number(aluno.ch_total) || 0;


    const horasFaltantes = Math.max(
        0,
        metaHoras - cargaHorariaTotal
    );

    const porcentagemConclusao = Math.min(
        100,
        Math.max(
            0,
            Math.round(
                (cargaHorariaTotal / metaHoras) * 100
            )
        )
    );

    const ira = Number(aluno.ira) || 0;
    const mediaNotas = Number(aluno.media_notas) || 0;
    const varianciaNotas =
        Number(aluno.variancia_notas) || 0;

    const totalReprovacoes =
        Number(aluno.total_reprovacoes) || 0;

    const totalTrancamentos =
        Number(aluno.qtd_trancamentos) || 0;

        const aprovadas = historico.filter(
        (item) => item.status_conclusao
    ).length;

    const comReprovacao = historico.filter(
        (item) => !item.status_conclusao && Number(item.qtd_reprovado) > 0
    ).length;

    const pendentes = historico.filter(
        (item) => !item.status_conclusao && Number(item.qtd_reprovado) === 0
    ).length;

    const dadosPizza = [
        {
            name: "Aprovadas",
            value: aprovadas,
            color: CORES.verde,
        },
        {
            name: "Com reprovação",
            value: comReprovacao,
            color: CORES.vermelho,
        },
        
    ].filter((item) => item.value > 0);

    const totalDisciplinas = historico.length;

    const limiteSemestres = [2, 4, 5].includes(
        Number(aluno.curso_id)
    )
        ? 10
        : 8;

    const isRetido =
        !aluno.formado &&
        Number(aluno.semestre_atual) > limiteSemestres;

    let statusAcademico = "Fluxo regular";
    let corStatus = "text-[#1D4ED8]";

    if (aluno.formado) {
        statusAcademico = "Formado";
        corStatus = "text-[#10B981]";
    } else if (isRetido) {
        statusAcademico = "Retido";
        corStatus = "text-[#EF4444]";
    }

    const materiasCriticas = [...historico]
        .filter((item) => Number(item.qtd_reprovado) > 0)
        .sort((a, b) => Number(b.qtd_reprovado) - Number(a.qtd_reprovado))
        .slice(0, 5)
        .map((item) => ({
            name: item.disciplina_codigo,
            nomeDisciplina: item.disciplina_nome || item.disciplina_codigo,
            reprovacoes: Number(item.qtd_reprovado),
        }));

    const indicadores = [
        {
            title: "Reprovações",
            value: totalReprovacoes,
            subtitle: "Total registrado",
            icon: <AlertCircle size={17} />,
            highlightColorClass: "text-[#EF4444]",
        },
        {
            title: "Trancamentos",
            value: totalTrancamentos,
            subtitle: "Registrados",
            icon: <Clock size={17} />,
        },
        {
            title: "Média geral",
            value: mediaNotas.toFixed(2),
            subtitle: "Média das notas",
            icon: <GraduationCap size={17} />,
        },
        {
            title: "CH concluída",
            value: `${cargaHorariaTotal}h`,
            subtitle: `Meta: ${metaHoras}h`,
            icon: <CheckCircle2 size={17} />,
        },
        {
            title: "CH restante",
            value: `${horasFaltantes}h`,
            subtitle: `${porcentagemConclusao}% concluído`,
            icon: <BookOpen size={17} />,
            highlightColorClass:
                horasFaltantes > 0
                    ? "text-[#1D4ED8]"
                    : "text-[#10B981]",
        },
        {
            title: "Variação das notas",
            value: `±${varianciaNotas.toFixed(1)}`,
            subtitle: "Variância registrada",
            icon: <Activity size={17} />,
        },
    ];

        const colunasHistorico = [
        {
            header: "Disciplina",
            render: (row) => (
                <div className="py-0.5">
                    <span className="font-semibold text-[#0B1B3F] block leading-snug">
                        {row.disciplina_nome || "Nome não cadastrado"}
                    </span>
                    <span className="text-xs text-[#1D4ED8] font-mono font-semibold tracking-wide">
                        {row.disciplina_codigo}
                    </span>
                </div>
            ),
        },
        {
            header: "Situação",
            render: (row) => {
                if (row.status_conclusao) {
                    return (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                            Aprovado
                        </span>
                    );
                }
                if (Number(row.qtd_reprovado) > 0) {
                    return (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-[#EF4444] border border-red-200">
                            Reprovado
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-[#1D4ED8] border border-blue-200">
                        Pendente
                    </span>
                );
            },
        },
        {
            header: "Reprovações",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (row) => {
                const quantidade = Number(row.qtd_reprovado) || 0;

                return (
                    <span
                        className={`inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold ${
                            quantidade > 0
                                ? "bg-red-50 text-[#EF4444]"
                                : "bg-gray-50 text-gray-500"
                        }`}
                    >
                        {quantidade}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="font-figtree">
            {/* Navegação */}
            <button
                type="button"
                onClick={() => navigate("/alunos")}
                className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#1D4ED8]"
            >
                <ArrowLeft size={16} />
                Voltar para alunos
            </button>


            <PageHeader
                tag="Dossiê Acadêmico"
                title={`Matrícula: ${aluno.matricula}`}
                description={
                    <span className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 text-xs">
                            <GraduationCap size={14} />
                            {cursoDoAluno ? `${cursoDoAluno.nome} (${cursoDoAluno.sigla})` : "Curso não informado"}
                        </span>

                        <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 text-xs font-medium">
                            <MapPin size={13} className="text-gray-500" />
                            {aluno.municipio_reside || "Município N/A"}
                            {aluno.cidade_nasceu && aluno.cidade_nasceu !== aluno.municipio_reside ? ` (Nat. ${aluno.cidade_nasceu})` : ""}
                        </span>

                        <span className="text-xs text-gray-500 ml-1">
                            • Ingresso: <strong>{aluno.ano_ingresso || "N/A"}</strong> • Prazo para a conclusão: <strong>{aluno.prazo_conclusao || "N/A"}</strong>
                        </span>
                    </span>
                }
                stats={[
                    {
                        label: "Semestre",
                        value: `${aluno.semestre_atual}º`,
                    },
                    {
                        label: "IRA",
                        value: ira.toFixed(2),
                    },
                    {
                        label: "Situação",
                        value: statusAcademico,
                        color: corStatus,
                    },
                ]}
            />

            {/* Alerta de retenção */}
            {isRetido && (
                <div className="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
                    <AlertTriangle
                        size={19}
                        className="mt-0.5 shrink-0 text-[#EF4444]"
                    />

                    <div>
                        <h3 className="text-sm font-semibold text-[#EF4444]">
                            Aluno em situação de retenção
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-gray-700">
                            O aluno ultrapassou o período
                            regular previsto para conclusão
                            do curso. Seu histórico registra{" "}
                            <span className="font-medium">
                                {totalReprovacoes} reprovações
                            </span>{" "}
                            e IRA de{" "}
                            <span className="font-medium">
                                {ira.toFixed(2)}
                            </span>
                            .
                        </p>
                    </div>
                </div>
            )}

            {/* Indicadores */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {indicadores.map((indicador) => (
                    <KPICard
                        key={indicador.title}
                        title={indicador.title}
                        value={indicador.value}
                        subtitle={indicador.subtitle}
                        icon={indicador.icon}
                        highlightColorClass={
                            indicador.highlightColorClass
                        }
                    />
                ))}
            </div>

            {/* Progresso da carga horária */}
            <section className="mb-8 rounded-md border border-gray-200 bg-white p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                            Progresso da Carga Horária
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Acompanhamento da carga horária
                            cumprida em relação à prevista
                            para o curso.
                        </p>
                    </div>

                    <span className="text-lg font-bold text-[#1D4ED8]">
                        {porcentagemConclusao}%
                    </span>
                </div>

                <div
                    className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-label="Carga horária concluída"
                    aria-valuenow={porcentagemConclusao}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#06B6D4] to-[#10B981] transition-[width] duration-300"
                        style={{ width: `${porcentagemConclusao}%` }}
                    />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span>
                        {cargaHorariaTotal}h concluídas
                    </span>

                    <span>
                        {horasFaltantes}h restantes de{" "}
                        {metaHoras}h
                    </span>
                </div>
            </section>

            {/* Gráficos */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartContainer

                    title="Situação das Disciplinas"
                    subtitle="Distribuição das disciplinas conforme a situação acadêmica do aluno."
                    height={280}
                    emptyState={
                        totalDisciplinas === 0 ? (
                            <>
                                <BookOpen
                                    size={28}
                                    className="text-gray-400"
                                />
                                <p className="text-sm text-gray-500">
                                    Nenhuma disciplina registrada.
                                </p>
                            </>
                        ) : null
                    }
                >
                    <PieChart>
                        <Pie
                            data={dadosPizza}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {dadosPizza.map((item, index) => (
                                <Cell
                                    key={index}
                                    fill={item.color}
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            contentStyle={tooltipStyle}
                        />

                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: "12px",
                            }}
                        />
                    </PieChart>
                </ChartContainer>


                <ChartContainer
                    title="Disciplinas com Mais Reprovações"
                    subtitle="Disciplinas com maior número de reprovações no histórico do aluno."
                    height={280}
                    emptyState={
                        materiasCriticas.length === 0 ? (
                            <>
                                <CheckCircle2
                                    size={30}
                                    className="text-[#10B981]"
                                />

                                <p className="text-sm text-gray-500">
                                    Nenhuma reprovação registrada.
                                </p>
                            </>
                        ) : null
                    }
                >
                    <BarChart
                        data={materiasCriticas}
                        layout="vertical"
                        margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            stroke="#E5E7EB"
                        />

                        <XAxis
                            type="number"
                            allowDecimals={false}
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12 }}
                        />

                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#9CA3AF"
                            width={80}
                            tick={{
                                fontSize: 11,
                                fill: "#4B5563",
                                fontWeight: 600,
                            }}
                        />

                        <Tooltip
                            cursor={{ fill: "#F9FAFB" }}
                            contentStyle={tooltipStyle}
                            labelFormatter={(label, payload) =>
                                payload?.[0]?.payload?.nomeDisciplina
                                    ? `${payload[0].payload.nomeDisciplina} (${label})`
                                    : label
                            }
                            formatter={(valor) => [
                                `${valor} reprovações`,
                                "Total",
                            ]}
                        />

                        <Legend
                            wrapperStyle={{ paddingTop: "10px" }}
                            iconType="circle"
                        />

                        <Bar
                            name="Reprovações"
                            dataKey="reprovacoes"
                            fill={CORES.vermelho}
                            radius={[0, 4, 4, 0]}
                            barSize={24}
                        />
                    </BarChart>
                </ChartContainer>
            </div>

            {/* Histórico acadêmico */}
            <section className="mb-8">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                            Histórico de Disciplinas
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Registro das disciplinas e
                            respectivas situações acadêmicas
                            do aluno.
                        </p>
                    </div>

                    <span className="text-xs font-medium text-gray-500">
                        {totalDisciplinas}{" "}
                        {totalDisciplinas === 1
                            ? "disciplina registrada"
                            : "disciplinas registradas"}
                    </span>
                </div>

                <DataTable
                    columns={colunasHistorico}
                    data={historico}
                    isLoading={carregando}
                    emptyMessage="Nenhuma disciplina encontrada no histórico deste aluno."
                />
            </section>
        </div>
    );
}
