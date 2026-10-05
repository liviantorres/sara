import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import PageHeader from "../components/PageHeader";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from "lucide-react";

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

    const carregarCursos = async () => {
      try {
        const response = await api.get("/api/cursos");
        setCursos(response.data);
      } catch (error) { }
    };
    carregarCursos();
  }, []);

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
        if (dados.total_alunos === 0) return alert("Nenhum dado para exportar");

        const nomeCurso = filtroCurso 
            ? cursos.find(c => String(c.id) === String(filtroCurso))?.nome 
            : "Todos os Cursos (Visão Geral)";

        if (tipo === 'csv') {
            const worksheet = XLSX.utils.json_to_sheet(dados.grafico);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "SARA_Evolucao_Historica.csv";
            link.click();
        } 
        else if (tipo === 'excel') {
            const workbook = XLSX.utils.book_new();
            
            const resumo = [{ "Filtro": nomeCurso, "Alunos": dados.total_alunos, "Retidos": dados.total_retidos, "Taxa": `${taxaRetencao}%` }];
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resumo), "Resumo");
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico), "Evolução Histórica");
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico_semestres), "Por Semestre");
            
            if (filtroCurso && dados.grafico_materias) {
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico_materias), "Matérias Gargalo");
            } else if (dados.grafico_cursos) {
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico_cursos), "Ranking Cursos");
            }
            XLSX.writeFile(workbook, "Dashboard_SARA.xlsx");
        } 
        else if (tipo === 'pdf') {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Relatório Gerencial - Dashboard SARA", 14, 15);
            doc.setFontSize(11);
            doc.text(`Filtro: ${nomeCurso}`, 14, 22);
            doc.text(`Total de Alunos: ${dados.total_alunos} | Retidos: ${dados.total_retidos} (${taxaRetencao}%)`, 14, 28);

            let posY = 35;

            doc.text("Evolução Histórica de Retenção", 14, posY);
            autoTable(doc, {
                head: [['Ano', 'Total Ingressantes', 'Alunos Retidos']],
                body: dados.grafico.map(g => [g.ano, g.total || 0, g.retidos]),
                startY: posY + 3,
                theme: 'striped',
                headStyles: { fillColor: [0, 83, 134] }
            });
            posY = doc.lastAutoTable.finalY + 10;

            if (filtroCurso && dados.grafico_materias?.length > 0) {
                doc.text("Top 5 Matérias Gargalo", 14, posY);
                autoTable(doc, {
                    head: [['Disciplina', 'Reprovações']],
                    body: dados.grafico_materias.map(m => [m.materia, m.reprovacoes]),
                    startY: posY + 3,
                    theme: 'striped',
                    headStyles: { fillColor: [220, 38, 38] } 
                });
            } else if (dados.grafico_cursos?.length > 0) {
                doc.text("Ranking de Retenção por Curso", 14, posY);
                autoTable(doc, {
                    head: [['Curso', 'Alunos Retidos']],
                    body: dados.grafico_cursos.map(c => [c.curso, c.retidos]),
                    startY: posY + 3,
                    theme: 'striped',
                    headStyles: { fillColor: [0, 83, 134] }
                });
            }
            doc.save("Dashboard_SARA.pdf");
        }
    };

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

            <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6 -mt-2">
              
              <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[42px]">
                  <div className="px-4 bg-gray-50 border-r border-gray-200 text-[#005386] font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                      <Download size={16} /> Relatório
                  </div>
                  <button onClick={() => gerarRelatorioDashboard('csv')} className="px-4 hover:bg-gray-100 text-gray-600 font-semibold text-sm transition-colors border-r border-gray-200 cursor-pointer flex items-center">
                      CSV
                  </button>
                  <button onClick={() => gerarRelatorioDashboard('excel')} className="px-4 hover:bg-gray-100 text-green-700 font-semibold text-sm transition-colors border-r border-gray-200 cursor-pointer flex items-center">
                      Excel
                  </button>
                  <button onClick={() => gerarRelatorioDashboard('pdf')} className="px-4 hover:bg-gray-100 text-red-600 font-semibold text-sm transition-colors cursor-pointer flex items-center">
                      PDF
                  </button>
              </div>

      
              <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[42px]">
                <div className="px-4 bg-gray-50 border-r border-gray-200 text-[#005386] font-bold text-[11px] uppercase tracking-widest flex items-center">
                  Filtrar por curso
                </div>
                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                  className="bg-white px-3 text-sm text-gray-800 focus:outline-none cursor-pointer font-semibold min-w-[200px]"
                >
                  <option value="">Visão Geral (Todos)</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nome}</option>
                  ))}
                </select>
              </div>
              
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, idx) => (
              <div key={idx} className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6 text-left hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">{card.title}</span>
                <span className={`text-4xl font-black ${card.cor}`}>{card.value}</span>
              </div>
            ))}
          </div>
           <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6 mb-8 mt-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Ranking de Retenção por Curso</h3>
              <p className="text-sm text-gray-500 mt-1">
                Comparativo global da universidade para identificar quais departamentos precisam de maior intervenção.
              </p>
            </div>
          {!filtroCurso ? (
            
            <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6 mb-8 mt-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Ranking de Retenção por Curso</h3>
                <p className="text-sm text-gray-500 mt-1">Comparativo global da universidade para identificar quais departamentos precisam de intervenção.</p>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.grafico_cursos} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="curso" type="category" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} width={200} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F8FAFC' }} />
                    <Bar name="Alunos Retidos" dataKey="retidos" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          ) : (

            <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6 mb-8 mt-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">Top 5 Matérias Gargalo do Curso</h3>
                <p className="text-sm text-gray-500 mt-1">Disciplinas com maior índice de reprovações bloqueando o fluxo dos alunos deste departamento.</p>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.grafico_materias} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="materia" type="category" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 800, fill: '#475569' }} width={220} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#FEE2E2' }} />
                    <Bar name="Total de Reprovações" dataKey="reprovacoes" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Retenção por Ano de Ingresso</h3>
                <p className="text-sm text-gray-500 mt-1">Comparativo histórico de ingressantes vs retidos.</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados.grafico} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="ano" stroke="#94A3B8" tick={{ fontSize: 12 }} tickMargin={10} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                    <Line name="Ingressantes" type="monotone" dataKey="total" stroke="#94A3B8" strokeWidth={3} dot={{ r: 3 }} />
                    <Line name="Retidos" type="monotone" dataKey="retidos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>


            <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Onde os alunos estão travando?</h3>
                <p className="text-sm text-gray-500 mt-1">Volume de alunos em risco agrupados por semestre atual.</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.grafico_semestres} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="semestre" stroke="#94A3B8" tick={{ fontSize: 12 }} tickMargin={10} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F1F5F9' }} />
                    <Bar name="Alunos Retidos" dataKey="retidos" fill="#005386" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}