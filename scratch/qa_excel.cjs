const ExcelJS = require('exceljs');
const path = require('path');

async function inspectExcel() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '..', 'deliverables', 'gerador-orcamentos-fotografia.xlsx');
    
    try {
        await workbook.xlsx.readFile(filePath);
        console.log('--- RELATÓRIO DE QA EXCEL ---');
        console.log(`Planilha carregada: ${filePath}`);
        
        // 1. Verificando Abas
        const sheets = workbook.worksheets.map(s => s.name);
        console.log(`Abas encontradas: ${sheets.join(', ')}`);
        
        const expectedSheets = ['Pacotes e Configurações', 'Gerador de Orçamento', 'Orçamento Final'];
        expectedSheets.forEach(s => {
            if (sheets.includes(s)) {
                console.log(`[OK] Aba "${s}" presente.`);
            } else {
                console.log(`[ERRO] Aba "${s}" AUSENTE.`);
            }
        });

        // 2. Verificando Fórmulas no Gerador
        const sheetGen = workbook.getWorksheet('Gerador de Orçamento');
        console.log('\n--- Inspeção de Fórmulas (Gerador) ---');
        
        const formulas = [
            { cell: 'C16', desc: 'Subtotal Pacote' },
            { cell: 'C17', desc: 'Total Extras/Ajustes' },
            { cell: 'C18', desc: 'Desconto' },
            { cell: 'C19', desc: 'Investimento Final' }
        ];

        formulas.forEach(f => {
            const cell = sheetGen.getCell(f.cell);
            if (cell.formula) {
                console.log(`[OK] ${f.desc} (${f.cell}): ${cell.formula}`);
            } else {
                console.log(`[ALERTA] ${f.desc} (${f.cell}) não possui fórmula. Valor: ${cell.value}`);
            }
        });

        // 3. Verificando Referências no Orçamento Final
        const sheetFinal = workbook.getWorksheet('Orçamento Final');
        console.log('\n--- Inspeção de Referências (Orçamento Final) ---');
        
        const refs = [
            { cell: 'E7', desc: 'Nome do Cliente' },
            { cell: 'A15', desc: 'Nome do Pacote' },
            { cell: 'G15', desc: 'Valor Base' },
            { cell: 'G19', desc: 'Investimento Total' }
        ];

        refs.forEach(r => {
            const cell = sheetFinal.getCell(r.cell);
            if (cell.formula) {
                console.log(`[OK] ${r.desc} (${r.cell}): ${cell.formula}`);
            } else {
                console.log(`[ALERTA] ${r.desc} (${r.cell}) não possui fórmula/referência.`);
            }
        });

    } catch (err) {
        console.error('Erro ao ler a planilha:', err.message);
    }
}

inspectExcel();
