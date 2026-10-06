import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import ExportGroup from "../components/ExportGroup";
import CourseFilter from "../components/CourseFilter";
import KPICard from "../components/KPICard";
import { api } from "../services/api";
import { AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { exportarRankingDisciplinas } from "../utils/exportUtils";
import { useCursos } from "../hooks/useCursos";
import DataTable from "../components/DataTable";

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
            ? cursos.find(c => String(c.id) === String(filtroCurso))?.nome
            : "Todos os Cursos";

        exportarRankingDisciplinas(tipo, materias, nomeCurso);
    };

    const dadosGraficoBarras = materias.slice(0, 10).map(m => ({
        codigo: m.codigo,
        reprovacoes: m.reprovacoes,
        nomeCompleto: m.nome
    }));

    const totalReprovacoes = materias.reduce((acc, m) => acc + m.reprovacoes, 0);
    const reprovacoesTop5 = materias.slice(0, 5).reduce((acc, m) => acc + m.reprovacoes, 0);
    const dadosGraficoPizza = [
        { name: 'Top 5 (Críticas)', value: reprovacoesTop5 },
        { name: 'Demais Disciplinas', value: totalReprovacoes - reprovacoesTop5 }
    ];
    const CORES_PIZZA = ['#dc2626', '#cbd5e1'];

    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
                    <p className="font-bold text-gray-800 text-sm mb-1">{payload[0].payload.nomeCompleto}</p>
                    <p className="text-red-600 text-sm font-semibold">Reprovações: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    const colunasTabela = [
        {
            header: "Pos",
            headerClassName: "text-center w-16",
            cellClassName: "text-center",
            render: (row, index) => (
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${index < 3 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {index + 1}º
                </span>
            )
        },
        {
            header: "Disciplina",
            cellClassName: "font-semibold text-gray-800",
            accessor: "nome"
        },
        {
            header: "Código",
            cellClassName: "text-sm text-gray-500 font-mono",
            accessor: "codigo"
        },
        {
            header: "Reprovações Históricas",
            headerClassName: "text-center",
            cellClassName: "text-center font-bold text-gray-700 text-lg",
            accessor: "reprovacoes"
        },
        {
            header: "Nível de Alerta",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (row, index) => {
                if (index < 5) return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200">
                        Crítico
                    </span>
                );
                if (index < 15) return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-orange-50 text-orange-700 border border-orange-200">
                        Atenção
                    </span>
                );
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-gray-50 text-gray-500 border border-gray-200">
                        Normal
                    </span>
                );
            }
        }
    ];

    return (
        <div className="font-figtree">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <PageHeader
                    tag="Mapeamento Acadêmico"
                    title="Disciplinas Gargalo."
                    description="Identifique as matérias com maior índice histórico de retenção."
                />

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <ExportGroup onExport={gerarRelatorioDisciplinas} />
                    <CourseFilter
                        value={filtroCurso}
                        onChange={setFiltroCurso}
                        cursos={cursos}
                        label="Análise por Curso"
                    />
                </div>
            </div>

            {/* KPI CARDS - Usando nosso novo componente limpinho! */}
            {!carregando && materias.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <KPICard
                        title="Total de Matérias Críticas"
                        value={materias.length}
                        subtitle="Com histórico de reprovação"
                    />
                    <KPICard
                        title="A Pior de Todas (Nº 1)"
                        value={materias[0]?.nome}
                        subtitle={`${materias[0]?.reprovacoes} reprovações`}
                        icon={<AlertTriangle size={12} />}
                        highlightColor="red-500"
                    />
                    <KPICard
                        title="Impacto Total"
                        value={totalReprovacoes}
                        subtitle="Reprovações acumuladas"
                    />
                </div>
            )}

            {/* AREA DE GRÁFICOS */}
            {!carregando && materias.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Gráfico de Barras - Ocupa 2 colunas */}
                    <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm lg:col-span-2">
                        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Top 10 Matérias Críticas</h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dadosGraficoBarras} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="codigo" tick={{ fontSize: 10, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="reprovacoes" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico de Concentração - Ocupa 1 coluna */}
                    <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm flex flex-col">
                        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Concentração (Top 5 vs Resto)</h3>
                        <div className="flex-1 h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dadosGraficoPizza}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {dadosGraficoPizza.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} reprovações`, 'Total']} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            <DataTable
                columns={colunasTabela}
                data={materias}
                isLoading={carregando}
                emptyMessage="Nenhuma disciplina encontrada para este filtro."
            />
        </div>
    );
}