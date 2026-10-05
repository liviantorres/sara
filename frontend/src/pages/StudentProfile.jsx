import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { api } from "../services/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentProfile() {
    const { matricula } = useParams();
    const navigate = useNavigate();

    const [aluno, setAluno] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const buscarDossie = async () => {
            try {
                const respAluno = await api.get(`/api/alunos?matricula=${matricula}`);
                if (respAluno.data.length > 0) setAluno(respAluno.data[0]);

                const respHist = await api.get(`/api/historicos?aluno_matricula=${matricula}`);
                setHistorico(respHist.data);
            } catch (error) {
                console.error("Erro ao carregar dossiê:", error);
            } finally {
                setCarregando(false);
            }
        };
        buscarDossie();
    }, [matricula]);

    if (carregando) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-full min-h-screen bg-slate-50">
                    <p className="text-[#005386] font-bold animate-pulse text-xl">Analisando Dossiê do Aluno...</p>
                </div>
            </Layout>
        );
    }

    if (!aluno) {
        return (
            <Layout>
                <div className="p-8 text-center text-gray-500 font-figtree">Nenhum aluno encontrado.</div>
            </Layout>
        );
    }

    const CARGA_HORARIA_CURSOS = {
        1: 3200, 
        2: 3600, 
    };

    const metaHoras = CARGA_HORARIA_CURSOS[aluno.curso_id] || 3000; 
    const horasFaltantes = Math.max(0, metaHoras - aluno.ch_total);
    const porcentagemConclusao = Math.min(100, Math.round((aluno.ch_total / metaHoras) * 100));

    const aprovadas = historico.filter(h => h.status_conclusao).length;
    const pendentes = historico.filter(h => !h.status_conclusao).length;
    const dadosPizza = [
        { name: "Aprovadas", value: aprovadas, color: "#005386" }, 
        { name: "Reprovadas/Pendentes", value: pendentes, color: "#CBD5E1" } 
    ];

    const limiteSemestres = [2, 4, 5].includes(aluno.curso_id) ? 10 : 8;
        
    const isRetido = !aluno.formado && (aluno.semestre_atual > limiteSemestres);
    
    let statusAcademico = "Fluxo Regular";
    let corStatus = "text-[#005386]"; 

    if (aluno.formado) {
        statusAcademico = "Formado";
        corStatus = "text-green-600";
    } else if (isRetido) {
        statusAcademico = "Retido (Risco)";
        corStatus = "text-red-600";
    }

    const materiasCriticas = [...historico]
        .filter(h => h.qtd_reprovado > 0)
        .sort((a, b) => b.qtd_reprovado - a.qtd_reprovado)
        .slice(0, 5)
        .map(h => ({ name: h.disciplina_codigo, reprovacoes: h.qtd_reprovado }));

    return (
        <>
            <div className="p-8 font-figtree bg-slate-50 min-h-screen">
                <button
                    onClick={() => navigate("/alunos")}
                    className="cursor-pointer mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-[#005386] font-bold uppercase tracking-widest transition-colors"
                >
                    &larr; Voltar para a lista
                </button>

                <PageHeader
                    
                    tag="Dossiê Acadêmico"
                    title={`Aluno: ${aluno.matricula}`}
                    description={`Ingresso em ${aluno.ano_ingresso}. Prazo máximo para conclusão: ${aluno.prazo_conclusao}.`}
                                       stats={[
                        { label: "Semestre", value: `${aluno.semestre_atual}º` },
                        { label: "IRA", value: aluno.ira, color: aluno.ira < 5 ? "text-red-500" : "text-[#005386]" },
                        { label: "Residência", value: aluno.municipio_reside || "N/A" }, 
                        { label: "Status Geral", value: statusAcademico, color: corStatus } 
                    ]}
                />

                {isRetido && (
                    <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-2 rounded-full">
                                <span className="text-xl" role="img" aria-label="alerta">⚠️</span>
                            </div>
                            <div>
                                <h4 className="text-red-800 font-bold text-sm tracking-wide uppercase">Alerta de Retenção Detectada</h4>
                                <p className="text-red-600 text-sm mt-0.5 font-medium">
                                    Este aluno apresenta múltiplos fatores de risco ({aluno.total_reprovacoes} reprovações acumuladas e IRA de {aluno.ira}) e encontra-se retido fora do fluxo ideal.
                                </p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white text-red-700 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm">
                            Notificar Coordenação
                        </button>
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
                    <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Reprovações</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{aluno.total_reprovacoes}</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trancamentos</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{aluno.qtd_trancamentos}</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Média de Notas</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{Number(aluno.media_notas).toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CH Concluída</p>
                        <p className="text-3xl font-black text-[#005386] mt-1">{aluno.ch_total}h</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CH Faltante</p>
                        <p className="text-3xl font-black text-orange-500 mt-1">{horasFaltantes}h</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm md:col-span-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Média & Consistência</p>
                        <div className="flex items-end gap-3 mt-1">
                            <p className="text-3xl font-black text-gray-900">{Number(aluno.media_notas).toFixed(2)}</p>
                            <p className="text-sm font-medium text-gray-400 mb-1 pb-0.5" title="Variância das notas">
                                ± {Number(aluno.variancia_notas).toFixed(1)} <span className="text-[10px] uppercase">var</span>
                            </p>
                        </div>
                    </div>

                </div>
                <div className="bg-white p-4 mb-8 border border-gray-200 rounded-xl shadow-sm md:col-span-2 flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Progresso do Curso</p>
                        <p className="text-sm font-bold text-[#005386]">{porcentagemConclusao}%</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                            className="bg-[#005386] h-2.5 rounded-full transition-all duration-1000"
                            style={{ width: `${porcentagemConclusao}%` }}
                        ></div>
                    </div>
                </div>

        
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Eficiência nas Matérias</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                        {dadosPizza.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#005386] rounded-full"></div><span className="text-sm font-semibold text-gray-600">Aprovadas</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 rounded-full"></div><span className="text-sm font-semibold text-gray-600">Pendentes</span></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Matérias Críticas (Reprovações)</h3>
                        {materiasCriticas.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={materiasCriticas} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                        <XAxis type="number" allowDecimals={false} stroke="#94A3B8" />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#475569' }} />
                                        <Tooltip cursor={{ fill: '#F8FAFC' }} />
                                        <Bar dataKey="reprovacoes" fill="#00A3E0" radius={[0, 4, 4, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400 font-medium">
                                Nenhuma reprovação registrada.
                            </div>
                        )}
                    </div>
                </div>

            
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico Completo de Disciplinas</h3>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm shadow-blue-900/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-50/50 text-[#00427A] text-[13px] uppercase tracking-wider border-b border-blue-100/50">
                                    <th className="px-6 py-4 font-bold">Código da Disciplina</th>
                                    <th className="px-6 py-4 font-bold">Situação</th>
                                    <th className="px-6 py-4 font-bold text-center">Tentativas Falhas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {historico.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500 font-medium">Sem registros de disciplinas.</td>
                                    </tr>
                                ) : (
                                    historico.map((hist, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-[#005386]">{hist.disciplina_codigo}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${hist.status_conclusao ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"
                                                    }`}>
                                                    {hist.status_conclusao ? "APROVADO" : "PENDENTE/REPROVADO"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-500">
                                                {hist.qtd_reprovado}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}