import React, { useState } from "react";
import { User, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

import wordmarkSara from "../assets/sara-wordmark-branco.svg"; 
import logoSaraAzul from "../assets/sara-horizontal-azul.svg"; 

const CURVA = "M-2 48 H30 C52 48 62 44 66 30 C69.4 18 74 9 84 8";

const BARRAS = [
  [4, 58, 9, 0.3],
  [20, 57, 9, 0.38],
  [36, 55, 9, 0.48],
  [52, 52, 9, 0.6],
  [76, 15, 10, 1],
];

function GraficoEvolucao({ className = "" }) {
  return (
    <svg
      viewBox="0 0 100 70"
      preserveAspectRatio="xMaxYMax meet"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sara-curva" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="86" y2="0">
          <stop offset="0" stopColor="#22D3EE" stopOpacity="0.15" />
          <stop offset="0.45" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="sara-barra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#3B82F6" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="sara-brilho">
          <stop offset="0" stopColor="#34D399" stopOpacity="0.4" />
          <stop offset="1" stopColor="#34D399" stopOpacity="0" />
        </radialGradient>
      </defs>

      {BARRAS.map(([x, topo, largura, opacidade], i) => (
        <rect
          key={x}
          className="sara-barra"
          style={{ animationDelay: `${0.1 + i * 0.1}s` }}
          x={x}
          y={topo}
          width={largura}
          height={72 - topo}
          rx="2"
          fill="url(#sara-barra)"
          opacity={opacidade}
        />
      ))}

      <path className="sara-curva" pathLength="1" d={CURVA} stroke="url(#sara-curva)" strokeWidth="3" strokeLinecap="round" opacity="0.2" style={{ filter: "blur(1.2px)" }} />
      <path className="sara-curva" pathLength="1" d={CURVA} stroke="url(#sara-curva)" strokeWidth="1.1" strokeLinecap="round" />

      <g className="sara-no">
        <circle cx="88.4" cy="8" r="9" fill="url(#sara-brilho)" />
        <circle cx="88.4" cy="8" r="4.2" fill="#0B1B3F" stroke="#34D399" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const response = await api.post("/api/auth/login", params);

      const token = response.data.token || response.data.access_token;
      const refreshToken = response.data.refresh_token;
      const user = response.data.user;

      if (token) {
        signIn(user, token, refreshToken);
        navigate("/inicial");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      const mensagemErro = String(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Usuário ou senha incorretos. Tente novamente."
      );
      setError(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans overflow-hidden">
      <style>{`
        .sara-curva { stroke-dasharray: 1; stroke-dashoffset: 1; animation: sara-desenha 1.8s .4s cubic-bezier(.65,0,.35,1) forwards; }
        .sara-barra { transform-box: fill-box; transform-origin: bottom; animation: sara-sobe .9s cubic-bezier(.2,.8,.2,1) both; }
        .sara-no { opacity: 0; animation: sara-aparece .6s 2s ease-out forwards; }
        @keyframes sara-desenha { to { stroke-dashoffset: 0; } }
        @keyframes sara-sobe { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes sara-aparece { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .sara-curva, .sara-barra, .sara-no { animation: none; }
          .sara-curva { stroke-dashoffset: 0; }
          .sara-no { opacity: 1; }
        }
      `}</style>

      <aside className="hidden lg:block w-1/2 relative overflow-hidden bg-[#0B1B3F] text-white">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
        <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-28 w-[26rem] h-[26rem] bg-emerald-400/[0.08] rounded-full blur-3xl pointer-events-none" />

        <GraficoEvolucao className="absolute bottom-0 right-0 w-full h-[62%] pointer-events-none" />

        <div className="absolute left-16 top-[22%] z-10 flex flex-col gap-5">
          <img src={wordmarkSara} alt="SARA" className="h-16 xl:h-[72px] w-auto self-start" />
          <p className="font-figtree text-slate-300 text-lg xl:text-xl leading-relaxed">
            Sistema de Análise e Monitoramento
            <br />da Retenção Acadêmica
          </p>
        </div>
      </aside>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative overflow-hidden bg-gradient-to-br from-white via-[#EEF6FF] to-[#D6E8FF]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/45 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/90 rounded-full blur-2xl pointer-events-none" />

        <img src={logoSaraAzul} alt="SARA" className="lg:hidden relative z-10 h-10 w-auto mb-8" />

        <div className="w-full max-w-md relative z-10 bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(11,27,63,0.08)] border border-white">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1B3F] tracking-tight mb-3 font-figtree">
              Bem-vindo ao SARA
            </h2>
            <p className="text-slate-600 text-base leading-relaxed font-figtree">
              Acesse a sua conta para acompanhar e monitorar os indicadores de retenção acadêmica.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="font-figtree block text-[#0B1B3F] font-semibold text-base">
                Usuário
              </label>
              <Input
                id="email"
                type="text"
                placeholder="Digite o seu e-mail ou usuário"
                icon={User}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full border-slate-200 bg-white rounded-lg py-3"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="font-figtree block text-[#0B1B3F] font-semibold text-base">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a sua senha"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full border-slate-200 bg-white rounded-lg py-3"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/recoverpassword" className="text-[#0B1B3F] text-sm font-semibold hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 text-center font-figtree animate-pulse">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 flex justify-center items-center gap-2 font-semibold shadow-md ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Entrando...
                </>
              ) : (
                "Acessar o Sistema"
              )}
            </Button>
          </form>

          <div className="font-figtree mt-8 pt-6 border-t border-slate-200/70 flex items-center justify-center text-center space-x-2 text-slate-400 text-xs">
            <ShieldCheck size={18} className="text-[#005386]/70 shrink-0" />
            <p>
              Uso exclusivo para fins institucionais.
              <br />
              Acesso restrito a usuários autorizados.
            </p>
          </div>
        </div>
      </div >
    </div >
  );
}
