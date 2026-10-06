import React from "react";
import { Download } from "lucide-react";

export default function ExportGroup({ onExport }) {
    return (
        <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[42px]">
            <div className="px-4 bg-gray-50 border-r border-gray-200 text-[#005386] font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                <Download size={16} /> Relatório
            </div>
            <button onClick={() => onExport('csv')} className="px-4 hover:bg-gray-100 text-gray-600 font-semibold text-sm transition-colors border-r border-gray-200 cursor-pointer flex items-center">
                CSV
            </button>
            <button onClick={() => onExport('excel')} className="px-4 hover:bg-gray-100 text-green-700 font-semibold text-sm transition-colors border-r border-gray-200 cursor-pointer flex items-center">
                Excel
            </button>
            <button onClick={() => onExport('pdf')} className="px-4 hover:bg-gray-100 text-red-600 font-semibold text-sm transition-colors cursor-pointer flex items-center">
                PDF
            </button>
        </div>
    );
}