
import React from "react";
import { ResponsiveContainer } from "recharts";

export default function ChartContainer({
    title,
    subtitle,
    children,
    height = 300,
    emptyState = null,
}) {
    return (
        <section className="h-full rounded-md border border-gray-200 bg-white">
            <div className="px-5 pt-5">
                <h3 className="text-[18px] font-semibold tracking-tight text-gray-900">
                    {title}
                </h3>

                {subtitle && (
                    <p className="mt-1 text-[13px] leading-5 text-gray-500">
                        {subtitle}
                    </p>
                )}
            </div>

            <div
                style={{ height: `${height}px` }}
                className="mt-4 w-full px-3 pb-4"
            >
                {emptyState ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                        {emptyState}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {children}
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
}
