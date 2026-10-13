import React from "react";

export default function DataTable({
    columns,
    data,
    isLoading,
    emptyMessage = "Nenhum dado encontrado.",
}) {
    return (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr className="border-b border-gray-200">
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`
                                        whitespace-nowrap
                                        px-4
                                        py-3
                                        text-[12px]
                                        font-semibold
                                        text-gray-500
                                        ${col.headerClassName || ""}
                                    `}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#005386]" />
                                        Carregando dados...
                                    </div>
                                </td>
                            </tr>
                        ) : !data || data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`
                                                px-4
                                                py-3.5
                                                text-sm
                                                text-gray-700
                                                ${col.cellClassName || ""}
                                            `}
                                        >
                                            {col.render
                                                ? col.render(row, rowIndex)
                                                : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}