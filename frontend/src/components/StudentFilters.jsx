import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function StudentFilters({
    filtros,
    setFiltros,
    cursos,
    onSearch,
    onClear,
}) {
    const { matricula, situacao, ira, semestre, curso } = filtros;

    const temFiltroAtivo =
        matricula || situacao || ira || semestre || curso;

    const handleChange = (campo, valor) => {
        setFiltros((prev) => ({
            ...prev,
            [campo]: valor,
        }));
    };

    const labelClass =
        "mb-1.5 block text-xs font-semibold text-gray-500";

    const inputClass =
        "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#005386] focus:ring-1 focus:ring-[#005386]";

    return (
        <section className="mb-6 rounded-md border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal
                        size={17}
                        className="text-[#005386]"
                    />

                    <div>
                        <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                            Filtros
                        </h2>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Consulte os alunos por matrícula, curso ou situação.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex flex-wrap items-end gap-4">
                    {/* MATRÍCULA */}
                    <div className="min-w-[220px] flex-1">
                        <label className={labelClass}>
                            Matrícula
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por matrícula"
                                value={matricula}
                                onChange={(e) =>
                                    handleChange(
                                        "matricula",
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && onSearch()
                                }
                                className={`${inputClass} pr-10`}
                            />

                            <button
                                type="button"
                                onClick={onSearch}
                                className="absolute right-0 top-0 flex h-full w-10 cursor-pointer items-center justify-center text-gray-400 transition-colors hover:text-[#005386]"
                                aria-label="Pesquisar"
                            >
                                <Search size={17} />
                            </button>
                        </div>
                    </div>

                    {/* SITUAÇÃO */}
                    <div className="w-44">
                        <label className={labelClass}>
                            Situação
                        </label>

                        <select
                            value={situacao}
                            onChange={(e) =>
                                handleChange(
                                    "situacao",
                                    e.target.value
                                )
                            }
                            className={`${inputClass} cursor-pointer`}
                        >
                            <option value="">Todas</option>
                            <option value="false">Cursando</option>
                            <option value="true">Formado</option>
                        </select>
                    </div>

                    {/* CURSO */}
                    <div className="w-56">
                        <label className={labelClass}>
                            Curso
                        </label>

                        <select
                            value={curso}
                            onChange={(e) =>
                                handleChange(
                                    "curso",
                                    e.target.value
                                )
                            }
                            className={`${inputClass} cursor-pointer`}
                        >
                            <option value="">Todos os cursos</option>

                            {cursos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* IRA */}
                    <div className="w-32">
                        <label className={labelClass}>
                            IRA máx.
                        </label>

                        <input
                            type="number"
                            step="0.1"
                            placeholder="Ex.: 7.0"
                            value={ira}
                            onChange={(e) =>
                                handleChange(
                                    "ira",
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </div>

                    {/* SEMESTRE */}
                    <div className="w-32">
                        <label className={labelClass}>
                            Semestre
                        </label>

                        <input
                            type="number"
                            placeholder="Ex.: 5"
                            value={semestre}
                            onChange={(e) =>
                                handleChange(
                                    "semestre",
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {temFiltroAtivo && (
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                    <span className="text-xs text-gray-500">
                        Filtros aplicados
                    </span>

                    <button
                        type="button"
                        onClick={onClear}
                        className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-[#005386]"
                    >
                        Limpar filtros
                    </button>
                </div>
            )}
        </section>
    );
}
