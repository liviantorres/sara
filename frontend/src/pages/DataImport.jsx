import React, { useState, useEffect } from "react";
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
    XCircle,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";

const OPCOES_CURSOS = [
    { id: "cc.csv", sigla: "CC", nome: "Ciência da Computação" },
    { id: "ea.csv", sigla: "EA", nome: "Engenharia Ambiental" },
    { id: "ec.csv", sigla: "EC", nome: "Engenharia Civil" },
    { id: "em.csv", sigla: "EM", nome: "Engenharia de Minas" },
    { id: "si.csv", sigla: "SI", nome: "Sistemas de Informação" },
];

export default function DataImport() {
    const [arquivos, setArquivos] = useState([]);
    const [statusManual, setStatusManual] = useState("idle");
    const [mensagemManual, setMensagemManual] = useState("");
    const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

    // Estados da sincronização automática
    const [cursosSelecionados, setCursosSelecionados] = useState(
        OPCOES_CURSOS.map((c) => c.id)
    );
    const [anoInicial, setAnoInicial] = useState("2016");
    const [anoFinal, setAnoFinal] = useState("2024");
    const [statusAuto, setStatusAuto] = useState("idle"); // idle | running | success | cancelled | error
    const [mensagemAuto, setMensagemAuto] = useState("");
    const [progressoInfo, setProgressoInfo] = useState({
        progresso: 0,
        lote_atual: 0,
        total_lotes: 0,
        curso_atual: "",
        intervalo_atual: "",
        etapa: "idle",
        segundos_pausa_restantes: 0,
        lotes_falhos: [],
    });
    const [cancelando, setCancelando] = useState(false);

    const alternarCurso = (idCurso) => {
        if (statusAuto === "running") return;
        setCursosSelecionados((prev) =>
            prev.includes(idCurso)
                ? prev.filter((id) => id !== idCurso)
                : [...prev, idCurso]
        );
    };

    const alternarTodosCursos = () => {
        if (statusAuto === "running") return;
        if (cursosSelecionados.length === OPCOES_CURSOS.length) {
            setCursosSelecionados([]);
        } else {
            setCursosSelecionados(OPCOES_CURSOS.map((c) => c.id));
        }
    };

    // Calcula uma prévia dos lotes de 3 em 3 anos
    const calcularPreviaLotes = () => {
        const ini = parseInt(anoInicial, 10);
        const fim = parseInt(anoFinal, 10);
        if (isNaN(ini) || isNaN(fim) || ini > fim || fim - ini > 30) return [];
        const lotes = [];
        let atual = ini;
        while (atual <= fim) {
            const fimLote = Math.min(atual + 2, fim);
            lotes.push(`${atual} a ${fimLote}`);
            atual = fimLote + 1;
        }
        return lotes;
    };

    const lotesPrevia = calcularPreviaLotes();

    useEffect(() => {
        const consultarStatus = async () => {
            try {
                const { data } = await api.get("/api/admin/sync-status");
                setProgressoInfo(data);

                if (data.em_andamento) {
                    setStatusAuto("running");
                    setMensagemAuto(data.mensagem);
                } else if (data.etapa === "concluido") {
                    setStatusAuto("success");
                    setMensagemAuto(data.mensagem);
                    setCancelando(false);
                } else if (data.etapa === "concluido_com_falhas") {
                    setStatusAuto("partial");
                    setMensagemAuto(data.mensagem);
                    setCancelando(false);
                } else if (data.etapa === "cancelado") {
                    setStatusAuto("cancelled");
                    setMensagemAuto(data.mensagem);
                    setCancelando(false);
                } else if (data.etapa === "erro") {
                    setStatusAuto("error");
                    setMensagemAuto(data.mensagem);
                    setCancelando(false);
                }
            } catch {
                // Silencia erro de polling caso ainda não tenha iniciado
            }
        };

        consultarStatus();
        const timer = setInterval(consultarStatus, 2500);

        return () => clearInterval(timer);
    }, []);

    const handleFileChange = (e) => {
        setArquivos(Array.from(e.target.files));
        setStatusManual("idle");
        setMensagemManual("");
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
            setMensagemManual(response.data.mensagem);
        } catch (error) {
            setStatusManual("error");
            setMensagemManual(
                error.response?.data?.detail || "Erro ao importar dados."
            );
        }
    };

    const handleSyncAutomatica = async () => {
        if (cursosSelecionados.length === 0) {
            setStatusAuto("error");
            setMensagemAuto("Selecione pelo menos um curso para extrair.");
            return;
        }

        const ini = parseInt(anoInicial, 10);
        const fim = parseInt(anoFinal, 10);

        if (isNaN(ini) || isNaN(fim) || ini > fim) {
            setStatusAuto("error");
            setMensagemAuto(
                "Informe um intervalo de anos válido (ex: 2016 até 2024)."
            );
            return;
        }

        setCancelando(false);
        setStatusAuto("running");
        setMensagemAuto("Conectando ao DEYSI e preparando lotes...");

        try {
            await api.post("/api/admin/sync-auto", {
                ano_inicial: ini,
                ano_final: fim,
                cursos: cursosSelecionados,
            });
        } catch (error) {
            setStatusAuto("error");
            setMensagemAuto(
                error.response?.data?.detail ||
                "Falha ao se conectar com os servidores do DEYSI. Verifique se o container está rodando."
            );
        }
    };

    const handleCancelarSync = async () => {
        setCancelando(true);
        try {
            await api.post("/api/admin/sync-cancel");
        } catch {
            setCancelando(false);
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
                                    Escolha os cursos e o intervalo de anos para
                                    extrair em lotes de 3 em 3 anos com pausa de
                                    2 minutos.
                                </p>
                            </div>
                        </div>

                        {/* SELEÇÃO DE CURSOS */}
                        <div className="mt-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-700">
                                    Cursos para extrair ({cursosSelecionados.length}/
                                    {OPCOES_CURSOS.length})
                                </span>
                                <button
                                    type="button"
                                    disabled={statusAuto === "running"}
                                    onClick={alternarTodosCursos}
                                    className="cursor-pointer text-xs font-medium text-[#005386] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {cursosSelecionados.length ===
                                        OPCOES_CURSOS.length
                                        ? "Desmarcar todos"
                                        : "Selecionar todos"}
                                </button>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {OPCOES_CURSOS.map((curso) => {
                                    const selecionado =
                                        cursosSelecionados.includes(curso.id);
                                    return (
                                        <label
                                            key={curso.id}
                                            onClick={() =>
                                                alternarCurso(curso.id)
                                            }
                                            className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-colors ${selecionado
                                                    ? "border-[#005386] bg-[#005386]/5 font-medium text-[#005386]"
                                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                } ${statusAuto === "running"
                                                    ? "cursor-not-allowed opacity-60"
                                                    : ""
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selecionado}
                                                onChange={() => { }}
                                                disabled={
                                                    statusAuto === "running"
                                                }
                                                className="h-3.5 w-3.5 accent-[#005386]"
                                            />
                                            <span className="truncate">
                                                {curso.nome} (<strong>{curso.sigla}</strong>)
                                                {" "}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SELEÇÃO DO INTERVALO DE ANOS */}
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="anoInicial"
                                    className="block text-xs font-medium text-gray-700"
                                >
                                    Ano Inicial
                                </label>
                                <input
                                    id="anoInicial"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    disabled={statusAuto === "running"}
                                    value={anoInicial}
                                    onChange={(e) => setAnoInicial(e.target.value)}
                                    placeholder="Ex: 2016"
                                    className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#005386] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="anoFinal"
                                    className="block text-xs font-medium text-gray-700"
                                >
                                    Ano Final
                                </label>
                                <input
                                    id="anoFinal"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    disabled={statusAuto === "running"}
                                    value={anoFinal}
                                    onChange={(e) => setAnoFinal(e.target.value)}
                                    placeholder="Ex: 2024"
                                    className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#005386] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>
                        </div>

                        {lotesPrevia.length > 0 &&
                            cursosSelecionados.length > 0 &&
                            statusAuto !== "running" && (
                                <div className="mt-4 rounded-md bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600">
                                    <span className="font-medium text-gray-700">
                                        Total de lotes (
                                        {cursosSelecionados.length *
                                            lotesPrevia.length}
                                        ):{" "}
                                    </span>
                                    {lotesPrevia.join(" | ")}
                                </div>
                            )}

                        {progressoInfo.lotes_falhos?.length > 0 && (
                            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                                <p className="flex items-center gap-1.5 font-semibold">
                                    <AlertTriangle size={14} className="shrink-0" />
                                    Alguns períodos ficaram incompletos ou falharam:
                                </p>
                                <ul className="mt-2 space-y-1.5 pl-1">
                                    {progressoInfo.lotes_falhos.map((l, i) => {
                                        const periodo =
                                            l.ano_inicial === l.ano_final
                                                ? `${l.ano_inicial}`
                                                : `${l.ano_inicial}–${l.ano_final}`;
                                        const opcaoCurso = OPCOES_CURSOS.find(
                                            (c) =>
                                                c.sigla === l.sigla ||
                                                c.nome === l.curso
                                        );
                                        return (
                                            <li
                                                key={i}
                                                className="flex items-center justify-between gap-2 rounded bg-amber-100/60 px-2.5 py-1.5"
                                            >
                                                <span>
                                                    <strong>
                                                        {l.curso} ({periodo}):
                                                    </strong>{" "}
                                                    {l.erro}
                                                </span>
                                                {statusAuto !== "running" &&
                                                    opcaoCurso && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCursosSelecionados([
                                                                    opcaoCurso.id,
                                                                ]);
                                                                setAnoInicial(
                                                                    String(
                                                                        l.ano_inicial
                                                                    )
                                                                );
                                                                setAnoFinal(
                                                                    String(
                                                                        l.ano_final
                                                                    )
                                                                );
                                                            }}
                                                            className="shrink-0 cursor-pointer rounded border border-amber-300 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-900 hover:bg-amber-50"
                                                        >
                                                            Selecionar período
                                                        </button>
                                                    )}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p className="mt-2 text-amber-700">
                                    Clique em <strong>Selecionar período</strong> e depois em{" "}
                                    <strong>Buscar dados agora</strong> para tentar novamente apenas o que faltou.
                                </p>
                            </div>
                        )}

                        {/* BARRA DE PROGRESSO AO VIVO */}
                        {statusAuto === "running" && (
                            <div className="mt-5 rounded-md border border-blue-100 bg-blue-50/50 p-4">
                                <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                                    <span>
                                        {progressoInfo.lote_atual > 0
                                            ? `Lote ${progressoInfo.lote_atual} de ${progressoInfo.total_lotes} • ${progressoInfo.curso_atual} (${progressoInfo.intervalo_atual})`
                                            : "Extração em andamento..."}
                                    </span>
                                    <span className="font-semibold text-[#005386]">
                                        {progressoInfo.progresso || 0}%
                                    </span>
                                </div>

                                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full rounded-full bg-[#005386] transition-all duration-500"
                                        style={{
                                            width: `${Math.max(
                                                progressoInfo.progresso || 0,
                                                4
                                            )}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-600">
                                    {progressoInfo.etapa === "pausa" ? (
                                        <Clock
                                            size={14}
                                            className="shrink-0 text-amber-600"
                                        />
                                    ) : (
                                        <RefreshCw
                                            size={14}
                                            className="shrink-0 animate-spin text-[#005386]"
                                        />
                                    )}
                                    <span>{mensagemAuto}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto border-t border-gray-100 px-6 py-4">
                        {statusAuto === "running" ? (
                            <button
                                onClick={handleCancelarSync}
                                disabled={cancelando}
                                className="
                                    flex
                                    w-full
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-md
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-red-700
                                    transition-colors
                                    hover:bg-red-100
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <XCircle size={16} />
                                {cancelando
                                    ? "Cancelando extração..."
                                    : "Cancelar extração"}
                            </button>
                        ) : (
                            <button
                                onClick={handleSyncAutomatica}
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
                                "
                            >
                                <Database size={16} />
                                Buscar dados agora
                            </button>
                        )}

                        {statusAuto === "success" && (
                            <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4 text-sm text-green-700">
                                <CheckCircle
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="font-medium">
                                        Sincronização concluída
                                    </p>
                                    <p className="mt-0.5 text-green-600">
                                        {mensagemAuto}
                                    </p>
                                </div>
                            </div>
                        )}

                        {statusAuto === "partial" && (
                            <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4 text-sm text-amber-700">
                                <AlertTriangle
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />
                                <div>
                                    <p className="font-medium">
                                        Sincronização concluída com falhas
                                    </p>
                                    <p className="mt-0.5 text-amber-600">
                                        {mensagemAuto}
                                    </p>
                                </div>
                            </div>
                        )}

                        {statusAuto === "cancelled" && (
                            <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4 text-sm text-amber-700">
                                <XCircle
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />
                                <div>
                                    <p className="font-medium">
                                        Extração interrompida
                                    </p>
                                    <p className="mt-0.5 text-amber-600">
                                        {mensagemAuto}
                                    </p>
                                </div>
                            </div>
                        )}

                        {statusAuto === "error" && (
                            <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-red-600">
                                {mensagemAuto}
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

                                <span>{mensagemManual}</span>
                            </div>
                        )}

                        {statusManual === "error" && (
                            <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-red-600">
                                {mensagemManual}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}