import React from "react";

export default function PageHeader({ tag, title, description, stats }) {
    return (
        <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    {tag && (
                        <span className="text-[#005386] font-bold text-[11px] uppercase tracking-widest mb-2 block">
                            {tag}
                        </span>
                    )}
                    
                    <h1 className="text-4xl font-bold text-gray-900 font-figtree">
                        {title}
                    </h1>
                    
                    {description && (
                        <p className="text-gray-500 mt-2 text-sm max-w-xl font-figtree">
                            {description}
                        </p>
                    )}
                </div>

                {stats && stats.length > 0 && (
                    <div className="flex gap-4 w-full lg:w-auto">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex-1 lg:min-w-[150px]">
                                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
                                <p className={`text-2xl font-bold font-figtree ${stat.color || "text-[#005386]"}`}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-0.5 w-full bg-gradient-to-r from-[#005386] via-[#00A3E0] to-transparent rounded-full mt-8 opacity-90"></div>
        </div>
    );
}