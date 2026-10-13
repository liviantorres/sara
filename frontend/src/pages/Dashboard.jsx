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
import KPICard from "../components/KPICard";
import { Users, AlertTriangle, TrendingDown, GraduationCap  } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.nome || "Usuário SARA";
  const [filtroCurso, setFiltroCurso] = useState("");
  const { cursos } = useCursos();

  const [dados, setDados] = useState({
    total_alunos: 0,
    total_cursando: 0,
    total_retidos: 0,
    grafico: [],
    grafico_semestres: [],
    grafico_cursos: [],
    grafico_materias: [],
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

  const taxaRetencao = dados.total_cursando > 0
    ? (
      (dados.total_retidos / dados.total_cursando) * 100
    ).toFixed(1)
    : "0.0";

  const gerarRelatorioDashboard = (tipo) => {
    const nomeCurso = filtroCurso ? cursos.find(c => String(c.id) === String(filtroCurso))?.nome : "Todos os Cursos (Visão Geral)";
    exportarDashboard(tipo, dados, nomeCurso, taxaRetencao);
  };


  const cards = [
    {
      title: "Total de alunos",
      value: dados.total_alunos,
      icon: <Users size={18} />,
    },
    {
      title: "Alunos não formados",
      value: dados.total_cursando,
      icon: <GraduationCap size={18} />,
    },
    {
      title: "Alunos retidos",
      value: dados.total_retidos,
      icon: <AlertTriangle size={18} />,
      subtitle: "Fora do tempo regular",
      highlightColorClass: "text-[#C2413B]",
    },
    {
      title: "Taxa de retenção",
      value: `${taxaRetencao}%`,
      icon: <TrendingDown size={18} />,
      subtitle: "Entre os não formados",
      highlightColorClass: "text-[#C2413B]",
    },
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
            <KPICard
              key={idx}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              highlightColorClass={card.highlightColorClass}
            />
          ))
        )}
      </div>

      <div className="mb-8">
        {carregando ? (
          <SkeletonChart />
        ) : !filtroCurso ? (
          <ChartContainer
            title="Retenção por Curso"
            subtitle="Número de alunos retidos em cada curso."
            height={320}
          >
            <BarChart data={dados.grafico_cursos} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                type="number"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                dataKey="curso"
                type="category"
                stroke="#9CA3AF"
                tick={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "#4B5563",
                }}
                width={200}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "#F9FAFB" }}
              />

              <Bar
                name="Alunos Retidos"
                dataKey="retidos"
                fill="#005386"
                radius={[0, 4, 4, 0]}
                barSize={28}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer
            title="Disciplinas com Maior Reprovação"
            subtitle="Principais disciplinas associadas à retenção dos alunos no curso."
            height={320}
          >
            <BarChart data={dados.grafico_materias} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                type="number"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                dataKey="materia"
                type="category"
                stroke="#9CA3AF"
                tick={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "#4B5563",
                }}
                width={220}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "#FEF2F2" }}
              />

              <Bar
                name="Total de Reprovações"
                dataKey="reprovacoes"
                fill="#C2413B"
                radius={[0, 4, 4, 0]}
                barSize={28}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {carregando ? <SkeletonChart /> : (
          <ChartContainer
            title="Retenção por Ano de Ingresso"
            subtitle="Comparativo entre alunos ingressantes e retidos ao longo dos anos."
          >
            <LineChart data={dados.grafico} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="ano"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />

              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "12px",
                }}
              />

              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                iconType="circle"
              />

              <Line
                name="Ingressantes"
                type="monotone"
                dataKey="total"
                stroke="#005386"
                strokeWidth={2}
                dot={false}
              />

              <Line
                name="Retidos"
                type="monotone"
                dataKey="retidos"
                stroke="#C2413B"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}

        {carregando ? <SkeletonChart /> : (
          <ChartContainer
            title="Retenção por Semestre"
            subtitle="Distribuição dos alunos retidos conforme o semestre atual."
          >
            <BarChart data={dados.grafico_semestres} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="semestre" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "#F9FAFB" }}
              />
              <Bar name="Alunos Retidos" dataKey="retidos" fill="#005386" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}