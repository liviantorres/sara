import React from "react";
import { ResponsiveContainer } from "recharts";

export default function ChartContainer({ title, subtitle, children, height = 300 }) {
    return (
        <div className="bg-white border border-gray-200 shadow-sm shadow-blue-900/5 rounded-xl p-6 flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-[20px] font-bold text-gray-900 tracking-wide">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div style={{ height: `${height}px` }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    );
}