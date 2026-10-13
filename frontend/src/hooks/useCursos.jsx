import { useState, useEffect } from "react";
import { api } from "../services/api";

export function useCursos() {
    const [cursos, setCursos] = useState([]);
    const [carregandoCursos, setCarregandoCursos] = useState(true);

    useEffect(() => {
        const carregarCursos = async () => {
            try {
                const response = await api.get("/api/cursos");
                setCursos(response.data);
            } catch (error) {
                console.error("Erro ao carregar os cursos:", error);
            } finally {
                setCarregandoCursos(false);
            }
        };
        
        carregarCursos();
    }, []);

    return { cursos, carregandoCursos };
}