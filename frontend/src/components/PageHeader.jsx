import React from "react";
import KPICard from "./KPICard";

export default function PageHeader({ tag, title, description, stats }) {
    return (
        <div className="mb-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    {tag && (
                        <p className="mb-2 text-xs font-medium text-gray-500">
                            {tag}
                        </p>
                    )}

                    <h1 className="font-figtree text-[30px] font-semibold leading-tight tracking-tight text-gray-900">
                        {title}
                    </h1>

                    {description && (
                        <p className="mt-2 max-w-2xl font-figtree text-sm leading-6 text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                {stats && stats.length > 0 && (
                    <div className="grid w-full grid-cols-2 gap-3 lg:w-auto lg:flex">
                        {stats.map((stat, index) => (
                            <KPICard
                                key={index}
                                title={stat.label}
                                value={stat.value}
                                subtitle={stat.subtitle}
                                icon={stat.icon}
                                highlightColorClass={
                                    stat.color || "text-[#005386]"
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-7 h-px w-full bg-gray-200" />
        </div>
    );
}