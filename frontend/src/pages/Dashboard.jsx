import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import PageHeader from "../components/PageHeader";
import { exportarDashboard } from "../utils/exportUtils";
import ExportGroup from "../components/ExportGroup";
import CourseFilter from "../components/CourseFilter";
import { useCursos } from "../hooks/useCursos";
import ChartContainer from "../components/ChartContainer";
import { SkeletonCard, SkeletonChart } from "../components/Skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.nome || "Usuário SARA";
  const [filtroCurso, setFiltroCurso] = useState("");
  const { cursos } = useCursos();

  const [dados, setDados] = useState({
    total_alunos: 0,
    total_retidos: 0,
    grafico: []
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDashboard = async () => {
      setCarregando(true);
      try {
        const url = filtroCurso ? `/api/alunos/dashboard?curso_id=${filtroCurso}` : "/api/alunos/dashboard";
        const response = await api.get(url);
        setDados(response.data);
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);
      } finally {
        setCarregando(false);
      }
    };
    carregarDashboard();
  }, [filtroCurso]);

  const taxaRetencao = dados.total_alunos > 0
    ? ((dados.total_retidos / dados.total_alunos) * 100).toFixed(1)
    : "0.0";

  const gerarRelatorioDashboard = (tipo) => {
    const nomeCurso = filtroCurso ? cursos.find(c => String(c.id) === String(filtroCurso))?.nome : "Todos os Cursos (Visão Geral)";
    exportarDashboard(tipo, dados, nomeCurso, taxaRetencao);
  };

  const cards = [
    { title: "Total de alunos", value: dados.total_alunos, cor: "text-[#005386]" },
    { title: "Retidos (Em Risco)", value: dados.total_retidos, cor: "text-red-600" },
    { title: "Taxa de Retenção", value: `${taxaRetencao}%`, cor: taxaRetencao > 30 ? "text-red-600" : "text-green-600" },
    { title: "Turmas Analisadas", value: dados.grafico.length, cor: "text-[#005386]" }
  ];

  return (
    <div className="font-figtree">
      <PageHeader
        tag="Painel Central"
        title={`Olá, ${userName}.`}
        description="Bem-vindo ao Sistema de Análise e Monitoramento da Retenção Acadêmica."
      />

      <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6 -mt-2">
        <ExportGroup onExport={gerarRelatorioDashboard} />
        <CourseFilter value={filtroCurso} onChange={setFiltroCurso} cursos={cursos} label="Filtrar Curso" />
      </div>

  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {carregando ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          cards.map((card, idx) => (
            <div key={idx} className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6 text-left hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">{card.title}</span>
              <span className={`text-4xl font-black ${card.cor}`}>{card.value}</span>
            </div>
          ))
        )}
      </div>

      <div className="mb-8">
        {carregando ? (
          <SkeletonChart />
        ) : !filtroCurso ? (
          <ChartContainer 
             title="Ranking de Retenção por Curso" 
             subtitle="Comparativo global da universidade para identificar quais departamentos precisam de intervenção."
             height={320}
          >
            <BarChart data={dados.grafico_cursos} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
              <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 12 }} />
              <YAxis dataKey="curso" type="category" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} width={200} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F8FAFC' }} />
              <Bar name="Alunos Retidos" dataKey="retidos" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={28} />
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer 
             title="Top 5 Matérias Gargalo do Curso" 
             subtitle="Disciplinas com maior índice de reprovações bloqueando o fluxo dos alunos."
             height={320}
          >
            <BarChart data={dados.grafico_materias} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
              <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 12 }} />
              <YAxis dataKey="materia" type="category" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 800, fill: '#475569' }} width={220} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#FEE2E2' }} />
              <Bar name="Total de Reprovações" dataKey="reprovacoes" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={28} />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {carregando ? <SkeletonChart /> : (
            <ChartContainer 
                title="Retenção por Ano de Ingresso" 
                subtitle="Comparativo histórico de ingressantes vs retidos."
            >
              <LineChart data={dados.grafico} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="ano" stroke="#94A3B8" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                <Line name="Ingressantes" type="monotone" dataKey="total" stroke="#94A3B8" strokeWidth={3} dot={{ r: 3 }} />
                <Line name="Retidos" type="monotone" dataKey="retidos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
        )}

        {carregando ? <SkeletonChart /> : (
            <ChartContainer 
                title="Onde os alunos estão travando?" 
                subtitle="Volume de alunos em risco agrupados por semestre atual."
            >
              <BarChart data={dados.grafico_semestres} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="semestre" stroke="#94A3B8" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F1F5F9' }} />
                <Bar name="Alunos Retidos" dataKey="retidos" fill="#005386" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ChartContainer>
        )}
      </div>
    </div>
  );
}