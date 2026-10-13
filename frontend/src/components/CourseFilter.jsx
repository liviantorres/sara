import React from "react";

export default function CourseFilter({
    value,
    onChange,
    cursos,
    label = "Curso",
}) {
    return (
        <div className="flex h-9 items-center">
            <label className="mr-2 text-sm text-gray-500">
                {label}
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 min-w-[200px] rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none cursor-pointer transition-colors hover:border-gray-300 focus:border-gray-400"
            >
                <option value="">Todos os cursos</option>

                {cursos?.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                        {curso.nome}
                    </option>
                ))}
            </select>
        </div>
    );
}