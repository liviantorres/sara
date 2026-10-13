import React from "react";
import { Download } from "lucide-react";

export default function ExportGroup({ onExport }) {
    return (
        <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-3 text-sm font-medium text-gray-600 border-r border-gray-200">
                <Download size={15} className="text-gray-400" />
                <span>Exportar</span>
            </div>

            <button
                onClick={() => onExport("csv")}
                className="h-full px-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
                CSV
            </button>

            <button
                onClick={() => onExport("excel")}
                className="h-full px-3 text-sm text-gray-600 border-l border-gray-100 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
                Excel
            </button>

            <button
                onClick={() => onExport("pdf")}
                className="h-full px-3 text-sm text-gray-600 border-l border-gray-100 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
                PDF
            </button>
        </div>
    );
}