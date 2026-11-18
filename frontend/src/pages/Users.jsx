import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
    UserPlus,
    ShieldCheck,
    KeyRound,
    Trash2,
    CheckCircle,
    AlertCircle,
    Users as UsersIcon,
    X,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Users() {
    const { user: usuarioLogado } = useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [carregandoLista, setCarregandoLista] = useState(true);

    // Formulário de novo usuário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [papel, setPapel] = useState("coordenacao");
    const [salvando, setSalvando] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ tipo: "", texto: "" });

    // Redefinição de senha 
    const [usuarioRedefinindo, setUsuarioRedefinindo] = useState(null);
    const [novaSenha, setNovaSenha] = useState("");
    const [salvandoSenha, setSalvandoSenha] = useState(false);
    const [feedbackLista, setFeedbackLista] = useState({ tipo: "", texto: "" });

    const carregarUsuarios = async () => {
        setCarregandoLista(true);
        try {
            const { data } = await api.get("/api/auth/usuarios");
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
        } finally {
            setCarregandoLista(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const handleCadastrar = async (e) => {
        e.preventDefault();
        setFeedbackForm({ tipo: "", texto: "" });

        if (senha.trim().length < 6) {
            setFeedbackForm({
                tipo: "error",
                texto: "A senha inicial deve ter pelo menos 6 caracteres.",
            });
            return;
        }

        setSalvando(true);
        try {
            await api.post("/api/auth/registrar", {
                nome: nome.trim(),
                email: email.trim(),
                senha: senha.trim(),
                papel,
            });

            setFeedbackForm({
                tipo: "success",
                texto: `Usuário "${nome.trim()}" cadastrado com sucesso!`,
            });
            setNome("");
            setEmail("");
            setSenha("");
            setPapel("coordenacao");
            carregarUsuarios();
        } catch (error) {
            setFeedbackForm({
                tipo: "error",
                texto:
                    error.response?.data?.detail ||
                    "Não foi possível cadastrar o usuário.",
            });
        } finally {
            setSalvando(false);
        }
    };

    const handleSalvarNovaSenha = async (usuarioId) => {
        setFeedbackLista({ tipo: "", texto: "" });
        if (novaSenha.trim().length < 6) {
            setFeedbackLista({
                tipo: "error",
                texto: "A nova senha deve ter pelo menos 6 caracteres.",
            });
            return;
        }

        setSalvandoSenha(true);
        try {
            const { data } = await api.patch(
                `/api/auth/usuarios/${usuarioId}/senha`,
                { nova_senha: novaSenha.trim() }
            );
            setFeedbackLista({ tipo: "success", texto: data.mensagem });
            setUsuarioRedefinindo(null);
            setNovaSenha("");
            carregarUsuarios();
        } catch (error) {
            setFeedbackLista({
                tipo: "error",
                texto:
                    error.response?.data?.detail ||
                    "Erro ao redefinir a senha.",
            });
        } finally {
            setSalvandoSenha(false);
        }
    };

    const handleRemoverUsuario = async (u) => {
        if (
            !window.confirm(
                `Tem certeza que deseja revogar o acesso de "${u.nome}" (${u.email})?`
            )
        ) {
            return;
        }

        setFeedbackLista({ tipo: "", texto: "" });
        try {
            await api.delete(`/api/auth/usuarios/${u.id}`);
            setFeedbackLista({
                tipo: "success",
                texto: `Acesso de "${u.nome}" removido com sucesso.`,
            });
            carregarUsuarios();
        } catch (error) {
            setFeedbackLista({
                tipo: "error",
                texto:
                    error.response?.data?.detail ||
                    "Não foi possível remover o usuário.",
            });
        }
    };

    const inputClass =
        "mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#1D4ED8] focus:outline-none";

    return (
        <div className="min-h-screen font-figtree">
            <PageHeader
                tag="Controle de Acesso"
                title="Gestão de Usuários"
                description="Cadastre novos usuários, defina os perfis de permissão e gerencie as credenciais de acesso ao sistema."
                stats={[
                    {
                        label: "Usuários ativos",
                        value: usuarios.length,
                        icon: <UsersIcon size={16} />,
                    },
                ]}
            />

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 pb-10 lg:grid-cols-12">
                {/* CARD ESQUERDO: NOVO USUÁRIO */}
                <section className="flex flex-col rounded-md border border-gray-200 bg-white lg:col-span-5">
                    <form onSubmit={handleCadastrar} className="flex flex-1 flex-col">
                        <div className="p-6">
                            <div className="flex items-center gap-2">
                                <UserPlus size={18} className="text-[#1D4ED8]" />
                                <h2 className="text-[17px] font-semibold tracking-tight text-[#0B1B3F]">
                                    Cadastrar novo acesso
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Crie uma conta institucional para consulta acadêmica ou administração do sistema.
                            </p>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Nome completo / Identificação
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Ex: Consulta Acadêmica"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        E-mail institucional
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ex: usuario@crateus.ufc.br"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Perfil de permissão
                                    </label>
                                    <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setPapel("coordenacao")}
                                            className={`cursor-pointer rounded-md border px-3 py-2.5 text-left transition-colors ${
                                                papel === "coordenacao"
                                                    ? "border-[#1D4ED8] bg-[#1D4ED8]/5 text-[#1D4ED8]"
                                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className="block text-xs font-semibold">
                                                Consulta Acadêmica
                                            </span>
                                            <span className="mt-0.5 block text-[11px] opacity-80">
                                                Painéis e relatórios
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPapel("dae")}
                                            className={`cursor-pointer rounded-md border px-3 py-2.5 text-left transition-colors ${
                                                papel === "dae"
                                                    ? "border-[#1D4ED8] bg-[#1D4ED8]/5 text-[#1D4ED8]"
                                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className="block text-xs font-semibold">
                                                Administrador
                                            </span>
                                            <span className="mt-0.5 block text-[11px] opacity-80">
                                                Acesso total ao sistema
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Senha inicial
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        placeholder="Mínimo de 6 caracteres"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto border-t border-gray-100 px-6 py-4">
                            <button
                                type="submit"
                                disabled={
                                    salvando ||
                                    !nome.trim() ||
                                    !email.trim() ||
                                    senha.trim().length < 6
                                }
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1D4ED8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <UserPlus size={16} />
                                {salvando ? "Cadastrando..." : "Criar conta de acesso"}
                            </button>

                            {feedbackForm.texto && (
                                <div
                                    className={`mt-4 flex items-start gap-2 border-t border-gray-100 pt-4 text-sm ${
                                        feedbackForm.tipo === "success"
                                            ? "text-[#10B981]"
                                            : "text-[#EF4444]"
                                    }`}
                                >
                                    {feedbackForm.tipo === "success" ? (
                                        <CheckCircle size={17} className="mt-0.5 shrink-0" />
                                    ) : (
                                        <AlertCircle size={17} className="mt-0.5 shrink-0" />
                                    )}
                                    <span>{feedbackForm.texto}</span>
                                </div>
                            )}
                        </div>
                    </form>
                </section>

                {/* CARD DIREITO: LISTA DE USUÁRIOS */}
                <section className="flex flex-col rounded-md border border-gray-200 bg-white lg:col-span-7">
                    <div className="border-b border-gray-100 p-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#1D4ED8]" />
                            <h2 className="text-[17px] font-semibold tracking-tight text-[#0B1B3F]">
                                Contas cadastradas ({usuarios.length})
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Consulte os usuários ativos, altere senhas ou revogue permissões de acesso.
                        </p>

                        {feedbackLista.texto && (
                            <div
                                className={`mt-4 flex items-center justify-between rounded-md border px-3.5 py-2.5 text-xs font-medium ${
                                    feedbackLista.tipo === "success"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                <span>{feedbackLista.texto}</span>
                                <button
                                    type="button"
                                    onClick={() => setFeedbackLista({ tipo: "", texto: "" })}
                                    className="cursor-pointer opacity-70 hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 divide-y divide-gray-100 overflow-y-auto max-h-[520px]">
                        {carregandoLista ? (
                            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
                                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#1D4ED8]" />
                                Carregando usuários...
                            </div>
                        ) : usuarios.length === 0 ? (
                            <div className="py-16 text-center text-sm text-gray-500">
                                Nenhum usuário encontrado.
                            </div>
                        ) : (
                            usuarios.map((u) => {
                                const ehContaAtual =
                                    usuarioLogado?.email &&
                                    u.email.toLowerCase() ===
                                        usuarioLogado.email.toLowerCase();
                                const isAdminRole = u.papel === "dae";
                                const editandoSenha = usuarioRedefinindo === u.id;

                                return (
                                    <div key={u.id} className="p-4 sm:px-6 transition-colors hover:bg-gray-50/60">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1D4ED8]/20 bg-[#F1F5F9] text-sm font-bold text-[#1D4ED8]">
                                                    {u.nome?.charAt(0).toUpperCase() || "U"}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-[#0B1B3F]">
                                                            {u.nome}
                                                        </p>
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                                                isAdminRole
                                                                    ? "bg-[#0B1B3F] text-white"
                                                                    : "border border-blue-200 bg-blue-50 text-[#1D4ED8]"
                                                            }`}
                                                        >
                                                            {isAdminRole ? "Administrador" : "Consulta Acadêmica"}
                                                        </span>
                                                        {ehContaAtual && (
                                                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#10B981]">
                                                                Você
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs text-gray-500">
                                                        {u.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUsuarioRedefinindo(
                                                            editandoSenha ? null : u.id
                                                        );
                                                        setNovaSenha("");
                                                    }}
                                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                                                    title="Redefinir senha deste usuário"
                                                >
                                                    <KeyRound size={13} />
                                                    Nova senha
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={ehContaAtual}
                                                    onClick={() => handleRemoverUsuario(u)}
                                                    title={
                                                        ehContaAtual
                                                            ? "Você não pode remover sua própria conta"
                                                            : "Revogar acesso"
                                                    }
                                                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {editandoSenha && (
                                            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-blue-100 bg-[#F1F5F9]/70 p-2.5">
                                                <input
                                                    type="password"
                                                    value={novaSenha}
                                                    onChange={(e) => setNovaSenha(e.target.value)}
                                                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                                                    className="flex-1 min-w-[200px] rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-[#1D4ED8] focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={salvandoSenha || novaSenha.trim().length < 6}
                                                    onClick={() => handleSalvarNovaSenha(u.id)}
                                                    className="cursor-pointer rounded bg-[#1D4ED8] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {salvandoSenha ? "Salvando..." : "Salvar senha"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUsuarioRedefinindo(null);
                                                        setNovaSenha("");
                                                    }}
                                                    className="cursor-pointer rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}