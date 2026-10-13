
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
    azul: "#005386",
    vermelho: "#C2413B",
    verde: "#2F7D5A",
    cinza: "#9CA3AF",
    texto: "#4B5563",
    borda: "#E5E7EB",
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
                    className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#005386]"
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
                        className="mt-5 cursor-pointer rounded-md bg-[#005386] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004a78]"
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

    const naoConcluidas = historico.filter(
        (item) => !item.status_conclusao
    ).length;

    const dadosPizza = [
        {
            name: "Aprovadas",
            value: aprovadas,
            color: CORES.azul,
        },
        {
            name: "Não concluídas",
            value: naoConcluidas,
            color: CORES.cinza,
        },
    ];

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
    let corStatus = "text-[#005386]";

    if (aluno.formado) {
        statusAcademico = "Formado";
        corStatus = "text-[#2F7D5A]";
    } else if (isRetido) {
        statusAcademico = "Retido";
        corStatus = "text-[#C2413B]";
    }

    const materiasCriticas = [...historico]
        .filter(
            (item) => Number(item.qtd_reprovado) > 0
        )
        .sort(
            (a, b) =>
                Number(b.qtd_reprovado) -
                Number(a.qtd_reprovado)
        )
        .slice(0, 5)
        .map((item) => ({
            name: item.disciplina_codigo,
            reprovacoes: Number(item.qtd_reprovado),
        }));

    // Indicadores exibidos nos KPICards
    const indicadores = [
        {
            title: "Reprovações",
            value: totalReprovacoes,
            subtitle: "Total registrado",
            icon: <AlertCircle size={17} />,
            highlightColorClass: "text-[#C2413B]",
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
                    ? "text-[#005386]"
                    : "text-[#2F7D5A]",
        },
        {
            title: "Variação das notas",
            value: `±${varianciaNotas.toFixed(1)}`,
            subtitle: "Variância registrada",
            icon: <Activity size={17} />,
        },
    ];

    // Configuração da tabela de histórico
    // Configuração da tabela de histórico com Nome + Código
    const colunasHistorico = [
        {
            header: "Disciplina",
            render: (row) => (
                <div className="py-0.5">
                    <span className="font-semibold text-gray-900 block leading-snug">
                        {row.disciplina_nome || "Nome não cadastrado"}
                    </span>
                    <span className="text-xs text-gray-400 font-mono tracking-wide">
                        {row.disciplina_codigo}
                    </span>
                </div>
            )
        },
        {
            header: "Situação",
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${row.status_conclusao
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                    }`}>
                    {row.status_conclusao ? "Aprovado" : "Pendente / Reprovado"}
                </span>
            )
        },
        {
            header: "Tentativas Falhas",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (row) => (
                <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold ${row.qtd_reprovado > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                    }`}>
                    {row.qtd_reprovado}
                </span>
            )
        },
        {
            header: "Reprovações",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (row) => {
                const quantidade =
                    Number(row.qtd_reprovado) || 0;

                return (
                    <span
                        className={`inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs font-medium ${quantidade > 0
                            ? "bg-red-50 text-[#C2413B]"
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
                className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#005386]"
            >
                <ArrowLeft size={16} />
                Voltar para alunos
            </button>


            <PageHeader
                tag="Dossiê Acadêmico"
                title={`Matrícula: ${aluno.matricula}`}
                description={
                    <span className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#005386] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 text-xs">
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
                        color: ira < 7 ? "text-[#C2413B]" : "text-[#2F7D5A]",
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
                        className="mt-0.5 shrink-0 text-[#C2413B]"
                    />

                    <div>
                        <h3 className="text-sm font-semibold text-[#C2413B]">
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

                    <span className="text-lg font-semibold text-[#005386]">
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
                        className="h-full rounded-full bg-[#005386] transition-[width] duration-300"
                        style={{
                            width: `${porcentagemConclusao}%`,
                        }}
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
                                    className="text-[#2F7D5A]"
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
                        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            stroke={CORES.borda}
                        />

                        <XAxis
                            type="number"
                            allowDecimals={false}
                            stroke={CORES.cinza}
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            dataKey="name"
                            type="category"
                            width={80}
                            tick={{
                                fontSize: 11,
                                fill: CORES.texto,
                                fontWeight: 600,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            cursor={{
                                fill: "#FEF2F2",
                            }}
                            contentStyle={tooltipStyle}
                            formatter={(valor) => [
                                `${valor} reprovações`,
                                "Total",
                            ]}
                        />

                        <Bar
                            name="Reprovações"
                            dataKey="reprovacoes"
                            fill={CORES.vermelho}
                            radius={[0, 4, 4, 0]}
                            barSize={22}
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
