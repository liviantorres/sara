import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Info, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../services/api";

export default function DataImport() {
    const [arquivos, setArquivos] = useState([]);
    const [status, setStatus] = useState("idle"); 
    const [mensagem, setMensagem] = useState("");
    const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

    const handleFileChange = (e) => {
        setArquivos(Array.from(e.target.files));
        setStatus("idle");
    };

    const handleUpload = async () => {
        if (arquivos.length === 0) {
            alert("Selecione pelo menos um arquivo CSV.");
            return;
        }

        setStatus("loading");
        
        const formData = new FormData();
        arquivos.forEach(file => {
            formData.append("arquivos", file);
        });

        try {
            const response = await api.post("/api/admin/sincronizar", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setStatus("success");
            setMensagem(response.data.mensagem);
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMensagem(error.response?.data?.detail || "Erro ao importar dados.");
        }
    };

    return (
        <div className="font-figtree min-h-screen bg-slate-50">
            <PageHeader
                tag="Administração"
                title="Importação de Dados."
                description="Faça o upload dos arquivos CSV gerados pelo sistema acadêmico para atualizar a base de dados do SARA."
            />

            <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-8 max-w-2xl mt-6 mx-auto">
                                {/* Botão de Instruções */}
                <button 
                    onClick={() => setMostrarInstrucoes(!mostrarInstrucoes)}
                    className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-[#005386] hover:text-[#003f66] mb-4 transition-colors"
                >
                    <Info size={18} />
                    Como devo formatar meus arquivos CSV?
                    {mostrarInstrucoes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Painel de Instruções (Acordeão) */}
                {mostrarInstrucoes && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6 text-sm text-gray-700 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p>
                            Para garantir que o SARA importe os dados corretamente, certifique-se de que seus arquivos 
                            estejam no formato <strong>CSV (separado por vírgulas)</strong> e possuam exatamente as colunas abaixo:
                        </p>
                        
                        <div>
                            <h5 className="font-bold text-gray-900 mb-1">1. Arquivos de Curso (Ex: cc.csv, ec.csv)</h5>
                            <p className="text-gray-600 mb-2">Colunas obrigatórias na primeira linha (cabeçalho):</p>
                            <code className="block bg-white p-3 rounded border border-gray-200 text-[11px] overflow-x-auto text-pink-700 font-mono">
                                matricula, ira, formado, semestre_em_que_o_aluno_está, ano_de_ingresso, prazo_para_terminar_o_curso, ch_total, quantidade_de_trancamentos, quantidade_de_reprovações, media_das_notas, variancia_das_notas
                            </code>
                            <p className="mt-2 text-[11px] text-gray-500">
                                * Nota: Para as notas, as colunas devem usar o código (Ex: <strong>CRT0001</strong>). 
                                Para reprovações, use o formato <strong>reprovado_vezes_CRT0001</strong>.
                            </p>
                        </div>

                        <div>
                            <h5 className="font-bold text-gray-900 mb-1">2. Dicionário (codigos_disciplinas.csv)</h5>
                            <code className="block bg-white p-3 rounded border border-gray-200 text-[11px] overflow-x-auto text-pink-700 font-mono">
                                Codigo_CRT, Nome_Disciplina
                            </code>
                        </div>
                    </div>
                )}
                {/* Zona de Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                    <UploadCloud size={48} className="text-[#005386] mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Selecione seus arquivos CSV</h3>
                    <p className="text-sm text-gray-500 mb-6">Suporta: cc.csv, ea.csv, ec.csv, em.csv, si.csv e codigos_disciplinas.csv</p>
                    
                    <label className="cursor-pointer bg-[#005386] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#003f66] transition-colors">
                        Selecionar Arquivos
                        <input type="file" multiple accept=".csv" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                {/* Lista de Arquivos */}
                {arquivos.length > 0 && (
                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Arquivos Selecionados</h4>
                        <div className="flex flex-col gap-2 mb-6">
                            {arquivos.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-gray-200">
                                    <FileText size={18} className="text-[#005386]" />
                                    <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                                    <span className="text-xs text-gray-400 ml-auto">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleUpload} 
                            disabled={status === "loading"}
                            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {status === "loading" ? "Processando e Sincronizando..." : "Iniciar Sincronização"}
                        </button>
                    </div>
                )}

                {/* Feedbacks de Sucesso ou Erro */}
                {status === "success" && (
                    <div className="mt-6 bg-green-50 text-green-800 p-4 rounded-lg flex items-start gap-3 border border-green-200">
                        <CheckCircle className="text-green-600 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">Sucesso!</h4>
                            <p className="text-sm">{mensagem}</p>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="mt-6 bg-red-50 text-red-800 p-4 rounded-lg flex items-start gap-3 border border-red-200">
                        <AlertTriangle className="text-red-600 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">Erro na Importação</h4>
                            <p className="text-sm">{mensagem}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}