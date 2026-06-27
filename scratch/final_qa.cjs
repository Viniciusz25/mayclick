const ExcelJS = require('exceljs');
const path = require('path');

async function finalQA() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '..', 'deliverables', 'ENTREGA_FINAL_MAYCLICK', 'gerador-orcamentos-mayclick.xlsx');
    
    try {
        await workbook.xlsx.readFile(filePath);
        console.log('--- QA FINAL MAYCLICK ---');
        
        const sheetGen = workbook.getWorksheet('Gerador de Orçamento');
        const sheetFinal = workbook.getWorksheet('Orçamento Final');
        const sheetConfig = workbook.getWorksheet('Pacotes e Configurações');

        // Check Brand
        const brand = sheetConfig.getCell('J4').value;
        console.log(`Marca identificada: ${brand}`);
        if (brand === 'Mayclick Photography') {
            console.log('[OK] Identidade Mayclick aplicada.');
        } else {
            console.log('[ERRO] Marca incorreta.');
        }

        // Check Formulas
        const totalFormula = sheetGen.getCell('C19').formula;
        console.log(`Fórmula Total Final: ${totalFormula}`);

        const finalClientRef = sheetFinal.getCell('E7').formula;
        console.log(`Referência Cliente Orçamento Final: ${finalClientRef}`);

    } catch (err) {
        console.error('Erro no QA:', err.message);
    }
}

finalQA();
