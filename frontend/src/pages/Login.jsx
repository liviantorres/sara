import React, { useState } from "react";
import { User, Lock, EyeOff, ShieldCheck } from "lucide-react"; // Atualizei os ícones para bater com o Figma
import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", { email, password });
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Lado Esquerdo - Imagem e Logo */}
      <div className="hidden lg:flex w-1/2 flex-col relative bg-[#a4c5e3]">
        {/* Substitua o src pela imagem real do campus e da logo da UFC */}
        <img
    src="/src/assets/image 1.jpg" 
    alt="Campus da UFC em Crateús"
    /* Mudei para object-center para distribuir melhor o corte e não focar só na base */
    className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
  />
  <div className="relative z-10 flex flex-col items-center pt-16 bg-gradient-to-b from-white/90 via-white/50 to-transparent h-full">
    <img 
      src="/src/assets/logo-ufc-vertical.png" 
      alt="Brasão da UFC" 
      /* Aumentei a logo de w-24 (96px) para w-48 (192px) e adicionei sombra para destacar */
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
                  type="password"
                  placeholder="Digite a sua senha"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border-gray-300 rounded-lg py-3"
                />
        
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeOff size={20} />
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

            <Button 
              type="submit"   
            >
              Entrar
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