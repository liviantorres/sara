import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export const exportarRankingDisciplinas = (tipo, materias, nomeCurso) => {
    if (materias.length === 0) return alert("Nenhum dado para exportar");

    const dadosExportacao = materias.map((m, index) => ({
        "Posição": `${index + 1}º`,
        "Disciplina": m.nome,
        "Código": m.codigo,
        "Reprovações": m.reprovacoes,
        "Nível de Alerta": index < 5 ? "Crítico" : index < 15 ? "Atenção" : "Normal"
    }));

    if (tipo === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Ranking_Disciplinas.csv";
        link.click();
    } 
    else if (tipo === 'excel') {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dadosExportacao), "Ranking");
        XLSX.writeFile(workbook, "Ranking_Disciplinas.xlsx");
    } 
    else if (tipo === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Ranking de Disciplinas Gargalo", 14, 15);
        doc.setFontSize(11);
        doc.text(`Filtro: ${nomeCurso}`, 14, 22);

        autoTable(doc, {
            head: [['Pos', 'Disciplina', 'Código', 'Reprovações', 'Alerta']],
            body: dadosExportacao.map(d => Object.values(d)),
            startY: 28,
            theme: 'striped',
            headStyles: { fillColor: [0, 83, 134] }
        });
        doc.save("Ranking_Disciplinas.pdf");
    }
};

export const exportarDashboard = (tipo, dados, nomeCurso, taxaRetencao) => {
    if (!dados || dados.total_alunos === 0) return alert("Nenhum dado para exportar");

    if (tipo === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(dados.grafico);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "SARA_Evolucao_Historica.csv";
        link.click();
    } 
    else if (tipo === 'excel') {
        const workbook = XLSX.utils.book_new();
        const resumo = [{ "Filtro": nomeCurso, "Alunos": dados.total_alunos, "Retidos": dados.total_retidos, "Taxa": `${taxaRetencao}%` }];
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resumo), "Resumo");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico), "Evolução Histórica");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico_semestres), "Por Semestre");
        
        if (dados.grafico_materias && dados.grafico_materias.length > 0) {
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico_materias), "Matérias Gargalo");
        } else if (dados.grafico_cursos) {
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dados.grafico_cursos), "Ranking Cursos");
        }
        XLSX.writeFile(workbook, "Dashboard_SARA.xlsx");
    } 
    else if (tipo === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Relatório Gerencial - Dashboard SARA", 14, 15);
        doc.setFontSize(11);
        doc.text(`Filtro: ${nomeCurso}`, 14, 22);
        doc.text(`Total de Alunos: ${dados.total_alunos} | Retidos: ${dados.total_retidos} (${taxaRetencao}%)`, 14, 28);

        let posY = 35;
        doc.text("Evolução Histórica de Retenção", 14, posY);
        autoTable(doc, {
            head: [['Ano', 'Total Ingressantes', 'Alunos Retidos']],
            body: dados.grafico.map(g => [g.ano, g.total || 0, g.retidos]),
            startY: posY + 3,
            theme: 'striped',
            headStyles: { fillColor: [0, 83, 134] }
        });
        
        posY = doc.lastAutoTable.finalY + 10;
        if (dados.grafico_materias?.length > 0) {
            doc.text("Top 5 Matérias Gargalo", 14, posY);
            autoTable(doc, {
                head: [['Disciplina', 'Reprovações']],
                body: dados.grafico_materias.map(m => [m.materia, m.reprovacoes || m.reprovações]),
                startY: posY + 3,
                theme: 'striped',
                headStyles: { fillColor: [220, 38, 38] }
            });
        } else if (dados.grafico_cursos?.length > 0) {
            doc.text("Ranking de Retenção por Curso", 14, posY);
            autoTable(doc, {
                head: [['Curso', 'Alunos Retidos']],
                body: dados.grafico_cursos.map(c => [c.curso, c.retidos]),
                startY: posY + 3,
                theme: 'striped',
                headStyles: { fillColor: [0, 83, 134] }
            });
        }
        doc.save("Dashboard_SARA.pdf");
    }
};

export const exportarAlunos = (tipo, dados, cursos) => {
    if (dados.length === 0) return alert("Nenhum dado para exportar!");

    const dadosRicos = dados.map(aluno => ({
        "Matrícula": aluno.matricula,
        "Curso": cursos.find(c => String(c.id) === String(aluno.curso_id))?.nome || aluno.curso_id,
        "Situação": aluno.formado ? "Formado" : "Cursando",
        "IRA": aluno.ira,
        "Sem. Atual": aluno.semestre_atual,
        "Ano Ingresso": aluno.ano_ingresso,
        "Prazo Max": aluno.prazo_conclusao || "-",
        "Reprovações": aluno.total_reprovacoes || 0,
        "Trancamentos": aluno.qtd_trancamentos || 0,
        "CH Total": aluno.ch_total || 0,
        "Origem": aluno.municipio_reside || "N/A"
    }));

    if (tipo === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(dadosRicos);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "SARA_Alunos.csv";
        link.click();
    } 
    else if (tipo === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(dadosRicos);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Alunos SARA");
        XLSX.writeFile(workbook, "SARA_Alunos.xlsx");
    } 
    else if (tipo === 'pdf') {
        const doc = new jsPDF('landscape');
        doc.text("Relatório de Alunos - Sistema SARA", 14, 15);
        autoTable(doc, {
            head: [Object.keys(dadosRicos[0])],
            body: dadosRicos.map(d => Object.values(d)),
            startY: 20,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 83, 134] }
        });
        doc.save("SARA_Alunos.pdf");
    }
};