import React from "react";

export default function KPICard({
    title,
    value,
    subtitle,
    icon,
    highlightColorClass = "text-[#005386]",
}) {
    return (
        <div className="relative min-w-[190px] flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span className="text-gray-400">
                            {icon}
                        </span>
                    )}

                    <span className="text-[13px] font-medium text-gray-500">
                        {title}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
                <p
                    className="text-[30px] font-semibold leading-none tracking-tight text-gray-900"
                    title={String(value)}
                >
                    {value}
                </p>

                {subtitle && (
                    <span className={`text-xs font-medium ${highlightColorClass}`}>
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
}