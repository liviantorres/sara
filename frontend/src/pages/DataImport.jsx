import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import {
    UploadCloud,
    CheckCircle,
    FileText,
    Info,
    ChevronDown,
    ChevronUp,
    Database,
    RefreshCw,
} from "lucide-react";
import { api } from "../services/api";

export default function DataImport() {
    const [arquivos, setArquivos] = useState([]);
    const [statusManual, setStatusManual] = useState("idle");
    const [statusAuto, setStatusAuto] = useState("idle");
    const [mensagem, setMensagem] = useState("");
    const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

    const handleFileChange = (e) => {
        setArquivos(Array.from(e.target.files));
        setStatusManual("idle");
        setMensagem("");
    };

    const handleUploadManual = async () => {
        if (arquivos.length === 0) {
            alert("Selecione pelo menos um arquivo CSV.");
            return;
        }

        setStatusManual("loading");

        const formData = new FormData();

        arquivos.forEach((file) => {
            formData.append("arquivos", file);
        });

        try {
            const response = await api.post(
                "/api/admin/sincronizar",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setStatusManual("success");
            setMensagem(response.data.mensagem);
        } catch (error) {
            setStatusManual("error");
            setMensagem(
                error.response?.data?.detail ||
                    "Erro ao importar dados."
            );
        }
    };

    const handleSyncAutomatica = async () => {
        setStatusAuto("loading");
        setMensagem("");

        try {
            const response = await api.post("/api/admin/sync-auto");

            setStatusAuto("success");
            setMensagem(response.data.mensagem);
        } catch (error) {
            setStatusAuto("error");
            setMensagem(
                "Falha ao se conectar com os servidores do DEYSI. Verifique a API."
            );
        }
    };

    return (
        <div className="min-h-screen font-figtree">
            <PageHeader
                tag="Administração"
                title="Integração de dados"
                description="Sincronize os dados acadêmicos do SARA por meio do DEYSI ou envie os arquivos manualmente."
            />

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 pb-10 lg:grid-cols-2">
                {/* SINCRONIZAÇÃO AUTOMÁTICA */}
                <section className="flex flex-col rounded-md border border-gray-200 bg-white">
                    <div className="p-6">
                        <div className="flex items-start gap-3">
                            <Database
                                size={20}
                                className="mt-0.5 shrink-0 text-[#005386]"
                            />

                            <div>
                                <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                                    Sincronização com DEYSI
                                </h2>

                                <p className="mt-1.5 max-w-lg text-sm leading-5 text-gray-500">
                                    Busque os dados diretamente nos servidores
                                    da universidade.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto border-t border-gray-100 px-6 py-4">
                        <button
                            onClick={handleSyncAutomatica}
                            disabled={statusAuto === "loading"}
                            className="
                                flex
                                w-full
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                rounded-md
                                bg-[#005386]
                                px-4
                                py-2.5
                                text-sm
                                font-medium
                                text-white
                                transition-colors
                                hover:bg-[#004a78]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {statusAuto === "loading" ? (
                                <RefreshCw
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Database size={16} />
                            )}

                            {statusAuto === "loading"
                                ? "Conectando ao DEYSI..."
                                : "Buscar dados agora"}
                        </button>

                        {statusAuto === "success" && (
                            <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4 text-sm text-green-700">
                                <CheckCircle
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="font-medium">Sincronização concluída</p>
                                    <p className="mt-0.5 text-green-600">
                                        {mensagem}
                                    </p>
                                </div>
                            </div>
                        )}

                        {statusAuto === "error" && (
                            <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-red-600">
                                {mensagem}
                            </div>
                        )}
                    </div>
                </section>

                {/* UPLOAD MANUAL */}
                <section className="rounded-md border border-gray-200 bg-white">
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                                    Upload manual
                                </h2>

                                <p className="mt-1.5 text-sm leading-5 text-gray-500">
                                    Envie os arquivos CSV quando a sincronização
                                    automática não estiver disponível.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarInstrucoes(!mostrarInstrucoes)
                                }
                                className="
                                    flex
                                    shrink-0
                                    cursor-pointer
                                    items-center
                                    gap-1.5
                                    text-xs
                                    font-medium
                                    text-gray-500
                                    transition-colors
                                    hover:text-[#005386]
                                "
                            >
                                <Info size={15} />

                                Regras

                                {mostrarInstrucoes ? (
                                    <ChevronUp size={14} />
                                ) : (
                                    <ChevronDown size={14} />
                                )}
                            </button>
                        </div>

                        {/* INSTRUÇÕES */}
                        {mostrarInstrucoes && (
                            <div className="mt-5 border-t border-gray-100 pt-5">
                                <p className="mb-4 text-sm leading-5 text-gray-600">
                                    O arquivo deve ser salvo como{" "}
                                    <strong className="font-medium text-gray-800">
                                        CSV separado por vírgulas
                                    </strong>
                                    . Confira as principais colunas:
                                </p>

                                <div className="max-h-56 overflow-y-auto">
                                    <table className="w-full border-collapse text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="pb-2 pr-4 font-semibold text-gray-500">
                                                    Coluna
                                                </th>

                                                <th className="pb-2 font-semibold text-gray-500">
                                                    Preenchimento
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    matricula
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Apenas números. Ex:{" "}
                                                    <strong>473829</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    ira
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Número decimal. Ex:{" "}
                                                    <strong>7.5</strong> ou{" "}
                                                    <strong>8.0</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    formado
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    <strong>SIM</strong> ou{" "}
                                                    <strong>NÃO</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    semestre_em_que_o_aluno_está
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Número do semestre. Ex:{" "}
                                                    <strong>4</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    ano_de_ingresso
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Ano e semestre. Ex:{" "}
                                                    <strong>2022.1</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    prazo_para_terminar_o_curso
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Ano e semestre limite. Ex:{" "}
                                                    <strong>2026.1</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    ch_total
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Carga horária total. Ex:{" "}
                                                    <strong>3200</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    quantidade_de_trancamentos
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Número inteiro. Ex:{" "}
                                                    <strong>0</strong> ou{" "}
                                                    <strong>2</strong>
                                                </td>
                                            </tr>

                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    media_das_notas
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Número decimal. Ex:{" "}
                                                    <strong>8.5</strong>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="py-2 pr-4 font-mono text-gray-700">
                                                    Sigla da Matéria
                                                </td>
                                                <td className="py-2 text-gray-600">
                                                    Digite <strong>1</strong>{" "}
                                                    se o aluno passou ou deixe
                                                    em branco.
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ÁREA DE UPLOAD */}
                        <div className="mt-5 rounded-md border border-dashed border-gray-300 px-6 py-7 text-center transition-colors hover:border-gray-400 hover:bg-gray-50">
                            <UploadCloud
                                size={28}
                                className="mx-auto mb-3 text-gray-400"
                            />

                            <p className="text-sm font-medium text-gray-700">
                                Selecione os arquivos CSV
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Você pode selecionar mais de um arquivo.
                            </p>

                            <label className="mt-4 inline-flex cursor-pointer items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50">
                                Escolher arquivos

                                <input
                                    type="file"
                                    multiple
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* ARQUIVOS SELECIONADOS */}
                        {arquivos.length > 0 && (
                            <div className="mt-4">
                                <div className="space-y-1.5">
                                    {arquivos.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 border-b border-gray-100 py-2 text-sm text-gray-600 last:border-0"
                                        >
                                            <FileText
                                                size={15}
                                                className="shrink-0 text-gray-400"
                                            />

                                            <span className="truncate">
                                                {file.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleUploadManual}
                                    disabled={statusManual === "loading"}
                                    className="
                                        mt-4
                                        flex
                                        w-full
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-md
                                        bg-[#005386]
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-white
                                        transition-colors
                                        hover:bg-[#004a78]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {statusManual === "loading"
                                        ? "Processando arquivos..."
                                        : "Sincronizar arquivos"}
                                </button>
                            </div>
                        )}

                        {/* RESULTADO */}
                        {statusManual === "success" && (
                            <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4 text-sm text-green-700">
                                <CheckCircle
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />

                                <span>{mensagem}</span>
                            </div>
                        )}

                        {statusManual === "error" && (
                            <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-red-600">
                                {mensagem}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}