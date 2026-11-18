
import React from "react";
import KPICard from "./KPICard";

export default function PageHeader({
    tag,
    title,
    description,
    stats,
}) {
    return (
        <header className="mb-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                <div className="min-w-0">
                    {tag && (
                        <span className="mb-2.5 inline-flex items-center rounded-full bg-[#1D4ED8]/5 px-3 py-1 text-xs font-medium text-[#1D4ED8]">
                            {tag}
                        </span>
                    )}

                    <h1 className="font-figtree text-[30px] font-semibold leading-tight tracking-tight text-[#0B1B3F]">
                        {title}
                    </h1>

                    {description && (
                        <p className="mt-3 max-w-2xl font-figtree text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                {stats?.length > 0 && (
                    <div className="grid w-full grid-cols-2 gap-3 lg:w-auto lg:flex">
                        {stats.map((stat, index) => (
                            <KPICard
                                key={stat.label || index}
                                title={stat.label}
                                value={stat.value}
                                subtitle={stat.subtitle}
                                icon={stat.icon}
                                highlightColorClass={
                                    stat.color || "text-[#1D4ED8]"
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-7 h-px w-full bg-slate-200" />
        </header>
    );
}
