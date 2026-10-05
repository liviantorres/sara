import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.nome || "Usuário SARA";
  const [filtroCurso, setFiltroCurso] = useState("");
  const [cursos, setCursos] = useState([]);

  const [dados, setDados] = useState({
    total_alunos: 0,
    total_retidos: 0,
    grafico: []
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Carrega as opções de curso pro Dropdown
    const carregarCursos = async () => {
      try {
        const response = await api.get("/api/cursos");
        setCursos(response.data);
      } catch (error) { }
    };
    carregarCursos();
  }, []);

  // Carrega o Dashboard toda vez que o filtro mudar!
  useEffect(() => {
    const carregarDashboard = async () => {
      setCarregando(true);
      try {
        // Passando o filtro na URL
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


  const cards = [
    { title: "Total de alunos", value: dados.total_alunos, cor: "text-[#005386]" },
    { title: "Retidos (Em Risco)", value: dados.total_retidos, cor: "text-red-600" },
    { title: "Taxa de Retenção", value: `${taxaRetencao}%`, cor: taxaRetencao > 30 ? "text-red-600" : "text-green-600" },
    { title: "Turmas Analisadas", value: dados.grafico.length, cor: "text-[#005386]" }
  ];

  return (
    <div className="font-figtree">


      {carregando ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-[#005386] font-bold animate-pulse text-lg">Processando base de dados institucional...</p>
        </div>
      ) : (
        <>
                              <PageHeader
            tag="Painel Central"
            title={`Olá, ${userName}.`}
            description="Bem-vindo ao Sistema de Análise e Monitoramento da Retenção Acadêmica."
          />

          {/* BARRA DE CONTROLE GLOBAL */}
          <div className="flex justify-end mb-6 -mt-2">
            <div className="w-80 bg-white p-3 rounded-xl border border-gray-200 shadow-sm shadow-blue-900/5">
              <label className="block text-[10px] font-bold text-[#005386] uppercase tracking-widest mb-1.5 px-1">
                ⚙️ Visão Departamental
              </label>
              <select
                value={filtroCurso}
                onChange={(e) => setFiltroCurso(e.target.value)}
                className="w-full bg-slate-50 border border-gray-100 rounded-lg py-2 px-3 text-sm text-gray-800 focus:bg-white focus:border-[#005386] focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer font-semibold transition-all"
              >
                <option value="">🌎 Visão Global (Toda a Universidade)</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>{curso.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CARTÕES DE RESUMO (Ficam abaixo do filtro agora!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, idx) => (
              <div key={idx} className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6 text-left hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">{card.title}</span>
                <span className={`text-4xl font-black ${card.cor}`}>{card.value}</span>
              </div>
            ))}
          </div>

          {/* GRÁFICO MESTRE */}
          <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900">Evolução da Retenção por Ano de Ingresso</h3>
              <p className="text-sm text-gray-500 mt-1">Comparativo entre o total de alunos matriculados e a quantidade que encontra-se retida atualmente.</p>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dados.grafico} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="ano" stroke="#94A3B8" tick={{ fontSize: 13, fontWeight: 600, fill: '#64748B' }} tickMargin={10} />
                  <YAxis stroke="#94A3B8" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Line name="Total de Ingressantes" type="monotone" dataKey="total" stroke="#94A3B8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  <Line name="Alunos Retidos" type="monotone" dataKey="retidos" stroke="#ef4444" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}