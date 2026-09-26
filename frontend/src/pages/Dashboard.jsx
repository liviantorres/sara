import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", retidos: 500, media: 900 },
  { name: "Feb", retidos: 800, media: 1300 },
  { name: "Mar", retidos: 600, media: 1500 },
  { name: "Apr", retidos: 1000, media: 1100 },
  { name: "May", retidos: 900, media: 1050 },
  { name: "Jun", retidos: 1100, media: 1600 },
  { name: "Jul", retidos: 1500, media: 2100 },
  { name: "Aug", retidos: 1800, media: 2300 },
];

export default function Dashboard() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold font-figtree text-gray-900">Olá, Zé Welligton.</h2>
        <p className="text-gray-800 mt-1 text-base font-figtree">Bem-vindo ao Sistema de Análise e Monitoramento da Retenção Acadêmica.</p>
        <p className="text-xs text-gray-600 mt-2 font-figtree">Última atualização: 22/07/2026 às 08:15</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total de alunos", value: "565" },
          { title: "Retidos", value: "368" },
          { title: "Taxa de Retenção", value: "70,4%" },
          { title: "Alertas", value: "12" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-gray-300 rounded-xl p-6 text-center">
            <span className="text-lg font-medium text-gray-700 block mb-2 font-figtree">{card.title}</span>
            <span className="text-4xl font-bold font-figtree text-gray-900">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white border border-gray-300 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 font-figtree">Evolução da Retenção</h3>
        <p className="text-xs text-gray-400 mb-6 font-figtree">Neste gráfico, é demonstrada a evolução da retenção ao longo dos anos.</p>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="retidos" stroke="#0284C7" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="media" stroke="#F59E0B" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}