import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import ExportGroup from "../components/ExportGroup";
import CourseFilter from "../components/CourseFilter";
import KPICard from "../components/KPICard";
import { api } from "../services/api";
import { AlertTriangle, BookOpen, TrendingDown } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { exportarRankingDisciplinas } from "../utils/exportUtils";
import { useCursos } from "../hooks/useCursos";
import DataTable from "../components/DataTable";
import ChartContainer from "../components/ChartContainer";
import { SkeletonCard, SkeletonChart } from "../components/Skeleton";

const CORES_PIZZA = ["#C2413B", "#005386"];

export default function Disciplines() {
    const [materias, setMaterias] = useState([]);
    const { cursos } = useCursos();
    const [filtroCurso, setFiltroCurso] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarRanking = async () => {
            setCarregando(true);
            try {
                const url = filtroCurso
                    ? `/api/disciplinas/ranking?curso_id=${filtroCurso}`
                    : "/api/disciplinas/ranking";
                const response = await api.get(url);
                setMaterias(response.data);
            } catch (error) {
                console.error("Erro ao carregar ranking", error);
            } finally {
                setCarregando(false);
            }
        };
        carregarRanking();
    }, [filtroCurso]);

    const gerarRelatorioDisciplinas = (tipo) => {
        const nomeCurso = filtroCurso
            ? cursos.find((c) => String(c.id) === String(filtroCurso))?.nome
            : "Todos os Cursos";

        exportarRankingDisciplinas(tipo, materias, nomeCurso);
    };

    const dadosGraficoBarras = materias.slice(0, 10).map((m) => ({
        codigo: m.codigo,
        reprovacoes: m.reprovacoes,
        nomeCompleto: m.nome,
    }));

    const totalReprovacoes = materias.reduce((acc, m) => acc + m.reprovacoes, 0);
    const reprovacoesTop5 = materias
        .slice(0, 5)
        .reduce((acc, m) => acc + m.reprovacoes, 0);

    const dadosGraficoPizza = [
        { name: "Top 5 Críticas", value: reprovacoesTop5 },
        { name: "Demais Disciplinas", value: Math.max(0, totalReprovacoes - reprovacoesTop5) },
    ];

    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <p className="mb-1 text-xs font-semibold text-gray-900">
                        {payload[0].payload.nomeCompleto} ({payload[0].payload.codigo})
                    </p>
                    <p className="text-xs font-semibold text-[#C2413B]">
                        Reprovações: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const colunasTabela = [
        {
            header: "Posição",
            headerClassName: "text-center w-20",
            cellClassName: "text-center",
            render: (row, index) => (
                <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        index < 3
                            ? "border border-red-200 bg-red-50 text-[#C2413B]"
                            : "bg-gray-100 text-gray-700"
                    }`}
                >
                    {index + 1}º
                </span>
            ),
        },
        {
            header: "Disciplina",
            cellClassName: "font-medium text-gray-900",
            accessor: "nome",
        },
        {
            header: "Código",
            cellClassName: "text-xs text-[#005386] font-mono font-semibold",
            accessor: "codigo",
        },
        {
            header: "Reprovações Acumuladas",
            headerClassName: "text-center",
            cellClassName: "text-center font-semibold text-gray-900",
            accessor: "reprovacoes",
        },
        {
            header: "Nível de Criticidade",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (row, index) => {
                if (index < 5)
                    return (
                        <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-[#C2413B]">
                            Crítico
                        </span>
                    );
                if (index < 15)
                    return (
                        <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Atenção
                        </span>
                    );
                return (
                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#005386]">
                        Moderado
                    </span>
                );
            },
        },
    ];

    return (
        <div className="font-figtree">
            <PageHeader
                tag="Mapeamento Acadêmico"
                title="Disciplinas Gargalo."
                description="Identifique os componentes curriculares com maior incidência histórica de reprovações e retenção."
            />

            <div className="mb-6 -mt-2 flex flex-col items-center justify-end gap-4 md:flex-row">
                <ExportGroup onExport={gerarRelatorioDisciplinas} />
                <CourseFilter
                    value={filtroCurso}
                    onChange={setFiltroCurso}
                    cursos={cursos}
                    label="Análise por Curso"
                />
            </div>

            {/* NÍVEL 1: Indicadores Executivos (KPIs) */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {carregando ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : materias.length > 0 ? (
                    <>
                        <KPICard
                            title="Disciplinas Mapeadas"
                            value={materias.length}
                            subtitle="Com histórico de reprovação"
                            icon={<BookOpen size={17} />}
                        />
                        <KPICard
                            title="Disciplina Mais Crítica (1º)"
                            value={materias[0]?.nome}
                            subtitle={`${materias[0]?.reprovacoes} reprovações`}
                            icon={<AlertTriangle size={17} />}
                            highlightColorClass="text-[#C2413B]"
                        />
                        <KPICard
                            title="Impacto Acumulado"
                            value={totalReprovacoes}
                            subtitle="Total de reprovações"
                            icon={<TrendingDown size={17} />}
                            highlightColorClass="text-[#C2413B]"
                        />
                    </>
                ) : null}
            </div>

            {/* NÍVEL 2: Diagnóstico Visual (Top 10 + Concentração Pareto) */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col lg:col-span-2">
                    {carregando ? (
                        <SkeletonChart />
                    ) : materias.length > 0 ? (
                        <ChartContainer
                            title="Top 10 Disciplinas com Mais Reprovações"
                            subtitle="Componentes curriculares que mais impactam a retenção acadêmica."
                            height={260}
                        >
                            <BarChart
                                data={dadosGraficoBarras}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#E5E7EB"
                                />
                                <XAxis
                                    dataKey="codigo"
                                    tick={{ fontSize: 11, fill: "#6B7280" }}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#6B7280" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    content={<CustomBarTooltip />}
                                    cursor={{ fill: "#FEF2F2" }}
                                />
                                <Bar
                                    dataKey="reprovacoes"
                                    fill="#C2413B"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={42}
                                />
                            </BarChart>
                        </ChartContainer>
                    ) : null}
                </div>

                <div className="flex flex-col">
                    {carregando ? (
                        <SkeletonChart />
                    ) : materias.length > 0 ? (
                        <ChartContainer
                            title="Concentração de Reprovações"
                            subtitle="Peso das 5 matérias mais críticas frente às demais."
                            height={260}
                        >
                            <PieChart>
                                <Pie
                                    data={dadosGraficoPizza}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={58}
                                    outerRadius={82}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {dadosGraficoPizza.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CORES_PIZZA[index % CORES_PIZZA.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "6px",
                                        padding: "8px 10px",
                                        fontSize: "12px",
                                    }}
                                    formatter={(value) => [`${value} reprovações`, "Total"]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: "12px" }}
                                />
                            </PieChart>
                        </ChartContainer>
                    ) : null}
                </div>
            </div>

            {/* NÍVEL 3: Detalhamento Tabular Completo */}
            <section className="mb-8">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                            Ranking Completo de Disciplinas
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Listagem ordenada pelo volume histórico de reprovações registradas.
                        </p>
                    </div>

                    <span className="text-xs font-medium text-gray-500">
                        {materias.length} disciplinas listadas
                    </span>
                </div>

                <DataTable
                    columns={colunasTabela}
                    data={materias}
                    isLoading={carregando}
                    emptyMessage="Nenhuma disciplina encontrada para este filtro."
                />
            </section>
        </div>
    );
}