import React, { useState } from "react";
import { User, Lock, EyeOff, Eye, ShieldCheck, Loader2 } from "lucide-react";
import { Link, replace } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });

      const token = response.data.token || response.data.access_token;
        
      const user = response.data.user;

      if (token) {
        localStorage.setItem("@App:token", token);

        if (user) {
          localStorage.setItem("@App:user", JSON.stringify(user))
        }
        navigate("/inicial", { replace: true });
      }
    } catch (err) {
      console.error("Erro no login:", err);
      const mensagemErro = err.response?.data?.message || "Usuário ou senha incorretos. Tente novamente.";
      setError(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <div className="hidden lg:flex w-1/2 flex-col relative bg-[#a4c5e3]">
        <img
          src="/src/assets/image 1.jpg"
          alt="Campus da UFC em Crateús"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
        />
        <div className="relative z-10 flex flex-col items-center pt-16 bg-gradient-to-b from-white/90 via-white/50 to-transparent h-full">
          <img
            src="/src/assets/logo-ufc-vertical.png"
            alt="Brasão da UFC"
            className="w-48 mb-4 drop-shadow-lg transition-all"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-md">


          <div className="mb-10">
            <h2 className="text-5xl font-bold text-black mb-2 font-figtree">Entrar</h2>
            <p className="text-gray-500 text-lg font-figtree">Bem vindo ao SARA.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">


            <div className="space-y-2">
              <label htmlFor="email" className="font-figtree block text-[#00427A] font-semibold text-lg">
                Usuário
              </label>
              <Input
                id="email"
                type="text"
                placeholder="Digite o seu usuário"
                icon={User}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full border-gray-300 rounded-lg py-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[#00427A] font-semibold text-lg">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a sua senha"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full border-gray-300 rounded-lg py-3"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/recoverpassword"
                className="text-[#00427A] font-medium hover:underline"
              >
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
              className={`w-full py-3 flex justify-center items-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className=" font-figtree mt-12 flex items-center justify-center text-center space-x-2 text-gray-400 text-xs">
            <ShieldCheck size={20} />
            <p>
              Uso exclusivo para fins institucionais.<br />
              Acesso restrito a usuários autorizados.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}