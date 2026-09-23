import React, { useState } from "react";
import { Mail, ChevronLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

export default function RecoverPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dados enviados:", { email });
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

            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative">

                <Link
                    to="/"
                    className="absolute top-8 left-8 flex items-center text-gray-500 hover:text-[#00427A] transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 mr-1" />
                    <span className="font-medium text-sm">Voltar ao Login</span>
                </Link>

                <div className="w-full max-w-md mt-12 md:mt-0">

                    {/* Cabeçalho */}
                    <div className="mb-10">
                        <h2 className="text-5xl font-bold text-black mb-2">Recuperar senha</h2>
                        <p className="text-gray-500 text-lg">
                            Informe seu e-mail cadastrado para receber as instruções de acesso ao SARA.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-[#00427A] font-semibold text-base">
                                E-mail Institucional
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="servidor@ufc.br"
                                icon={Mail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-6 bg-[#005386] hover:bg-[#003f66]"
                        >
                            Enviar
                        </Button>
                    </form>

                    <div className="mt-16 flex items-center justify-center text-center space-x-2 text-gray-400 text-xs">
                        <ShieldCheck size={16} />
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