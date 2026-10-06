import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Info, ChevronDown, ChevronUp, Database, RefreshCw } from "lucide-react";
import { api } from "../services/api";

export default function DataImport() {
    const [arquivos, setArquivos] = useState([]);
    const [statusManual, setStatusManual] = useState("idle");
    const [statusAuto, setStatusAuto] = useState("idle");
    const [mensagem, setMensagem] = useState("");
    const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

    // --- Lógica do Upload Manual ---
    const handleFileChange = (e) => {
        setArquivos(Array.from(e.target.files));
        setStatusManual("idle");
    };

    const handleUploadManual = async () => {
        if (arquivos.length === 0) return alert("Selecione pelo menos um arquivo CSV.");
        setStatusManual("loading");
        const formData = new FormData();
        arquivos.forEach(file => formData.append("arquivos", file));

        try {
            const response = await api.post("/api/admin/sincronizar", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setStatusManual("success");
            setMensagem(response.data.mensagem);
        } catch (error) {
            setStatusManual("error");
            setMensagem(error.response?.data?.detail || "Erro ao importar dados.");
        }
    };

    // --- Lógica da Automação com DEYSI ---
    const handleSyncAutomatica = async () => {
        setStatusAuto("loading");
        try {
            const response = await api.post("/api/admin/sync-auto");
            setStatusAuto("success");
            setMensagem(response.data.mensagem);
        } catch (error) {
            setStatusAuto("error");
            setMensagem("Falha ao se conectar com os servidores do DEYSI. Verifique a API.");
        }
    };

    return (
        <div className="font-figtree min-h-screen bg-slate-50">
            <PageHeader tag="Administração" title="Integração de Dados." description="Sincronize o SARA com o sistema acadêmico (DEYSI) de forma automática ou via upload manual." />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 max-w-6xl mx-auto pb-10">

                {/* CARD 1: SINCRONIZAÇÃO AUTOMÁTICA */}
                <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-blue-50 rounded-lg text-[#005386]"><Database size={24} /></div>
                        <h3 className="text-xl font-bold text-gray-900">Sincronização com DEYSI</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-8">Conecte-se diretamente aos servidores da universidade para buscar os dados em tempo real (Requer liberação da TI).</p>

                    <div className="mt-auto">
                        <button
                            onClick={handleSyncAutomatica} disabled={statusAuto === "loading"}
                            className="cursor-pointer w-full bg-[#005386] text-white px-4 py-4 rounded-xl font-bold hover:bg-[#003f66] disabled:opacity-50 transition-colors flex items-center justify-center gap-3 shadow-md shadow-blue-900/20"
                        >
                            {statusAuto === "loading" ? <RefreshCw className="animate-spin" size={20} /> : <Database size={20} />}
                            {statusAuto === "loading" ? "Conectando ao DEYSI..." : "Buscar Dados Agora"}
                        </button>
                    </div>

                    {statusAuto === "success" && (
                        <div className="mt-6 bg-green-50 text-green-800 p-4 rounded-lg flex items-start gap-3 border border-green-200"><CheckCircle className="text-green-600 flex-shrink-0" /><div><h4 className="font-bold">Sucesso!</h4><p className="text-sm">{mensagem}</p></div></div>
                    )}
                </div>

                {/* CARD 2: UPLOAD MANUAL */}
                <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Manual</h3>

                    <button onClick={() => setMostrarInstrucoes(!mostrarInstrucoes)} className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-[#005386] hover:text-[#003f66] mb-4 transition-colors">
                        <Info size={16} /> Ver regras de formatação do CSV {mostrarInstrucoes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {mostrarInstrucoes && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4 text-xs text-gray-700 animate-in fade-in duration-300">
                            <p className="mb-3 text-[13px]">
                                Para evitar erros, o arquivo deve ser salvo como <strong>CSV (separado por vírgulas)</strong>.
                                Veja como preencher as principais colunas:
                            </p>

                            <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-blue-200 text-[#005386]">
                                            <th className="pb-2 font-bold">Nome exato da Coluna</th>
                                            <th className="pb-2 font-bold">O que preencher? (Exemplo)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-100">
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">matricula</td>
                                            <td className="py-2">Apenas números (Ex: <strong>473829</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">ira</td>
                                            <td className="py-2">Número decimal usando ponto (Ex: <strong>7.5</strong> ou <strong>8.0</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">formado</td>
                                            <td className="py-2">Obrigatório ser texto em maiúsculo: <strong>SIM</strong> ou <strong>NÃO</strong></td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">semestre_em_que_o_aluno_está</td>
                                            <td className="py-2">Apenas o número do semestre (Ex: <strong>4</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">ano_de_ingresso</td>
                                            <td className="py-2">Ano e Semestre que entrou (Ex: <strong>2022.1</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">prazo_para_terminar_o_curso</td>
                                            <td className="py-2">Ano e Semestre limite (Ex: <strong>2026.1</strong> ou <strong>2026.2</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">ch_total</td>
                                            <td className="py-2">Carga horária total (Ex: <strong>3200</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">quantidade_de_trancamentos</td>
                                            <td className="py-2">Número inteiro (Ex: <strong>0</strong> ou <strong>2</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold">media_das_notas</td>
                                            <td className="py-2">Número decimal com ponto (Ex: <strong>8.5</strong>)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono font-semibold text-pink-700 bg-pink-50/50">Sigla da Matéria (Ex: CRT0001)</td>
                                            <td className="py-2 text-pink-700 bg-pink-50/50">Digite <strong>1</strong> se o aluno passou, ou deixe em branco.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                        <UploadCloud size={32} className="text-[#005386] mb-3" />
                        <label className="cursor-pointer bg-slate-100 text-[#005386] px-5 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm">
                            Selecionar CSV
                            <input type="file" multiple accept=".csv" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    {arquivos.length > 0 && (
                        <div className="mt-4">
                            <div className="flex flex-col gap-2 mb-4">
                                {arquivos.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-gray-200 text-xs text-gray-700">
                                        <FileText size={14} className="text-[#005386]" /> {file.name}
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleUploadManual} disabled={statusManual === "loading"} className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm">
                                {statusManual === "loading" ? "Processando CSV..." : "Sincronizar Arquivos"}
                            </button>
                        </div>
                    )}

                    {statusManual === "success" && (
                        <div className="mt-4 bg-green-50 text-green-800 p-3 rounded flex items-start gap-2 border border-green-200 text-sm"><CheckCircle size={18} className="text-green-600" />{mensagem}</div>
                    )}
                </div>

            </div>
        </div>
    );
}