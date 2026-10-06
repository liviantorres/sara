import React from "react";

export default function KPICard({ title, value, subtitle, icon, highlightColor = "" }) {
    const borderClass = highlightColor ? `border-l-4 border-l-${highlightColor}` : "";

    return (
        <div className={`bg-white p-5 border border-gray-200 rounded-xl shadow-sm shadow-blue-900/5 ${borderClass}`}>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                {title}
            </p>
            <h4 className="text-2xl font-bold text-[#005386] truncate" title={String(value)}>
                {value}
            </h4>
            {subtitle && (
                <div className={`text-xs mt-2 font-medium flex items-center gap-1 ${highlightColor ? `text-${highlightColor}` : 'text-gray-400'}`}>
                    {icon && icon} {subtitle}
                </div>
            )}
        </div>
    );
}