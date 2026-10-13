import React from "react";


export function SkeletonCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-3 animate-pulse">
            <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
        </div>
    );
}

export function SkeletonChart() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-4 animate-pulse">
            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded mb-4"></div>
            <div className="h-[250px] w-full bg-slate-100 rounded-lg"></div>
        </div>
    );
}