const ExcelJS = require('exceljs');
const path = require('path');

async function generateExcel() {
    const workbook = new ExcelJS.Workbook();
    
    // --- COLORS (Based on Mayclick Identity) ---
    const colorOffWhite = 'FFFDFDFD';
    const colorGraphite = 'FF333333';
    const colorOlive = 'FF8C845D'; // Olive/Grey-green
    const colorGold = 'FFD4AF37';  // Gold/Champagne
    const colorHeader = 'FFF2F1ED'; // Very light beige
    const colorBorder = 'FFD1D1D1';

    // ==========================================
    // SHEET 1: PACOTES E CONFIGURAÇÕES
    // ==========================================
    const sheetConfig = workbook.addWorksheet('Pacotes e Configurações');
    
    // 1.1 Business Info Section
    sheetConfig.getCell('I2').value = 'DADOS DA EMPRESA (CONFIGURAÇÃO)';
    sheetConfig.getCell('I2').font = { bold: true, size: 12, color: { argb: colorOlive } };
    
    const bizData = [
        ['Nome da Empresa', 'Mayclick Photography'],
        ['Telefone', '(11) 96303-1814'],
        ['CNPJ', '37.816.268/0001-06'],
        ['Site', 'www.mayfotosefilmagens.com.br'],
        ['Instagram', '@mayclick_fotos'],
        ['Validade (Dias)', 5],
        ['Forma de Pagamento', '50% no ato e 50% no dia do evento. Até 12x no cartão (juros a consultar).']
    ];
    
    bizData.forEach((row, i) => {
        sheetConfig.getCell(`I${i+4}`).value = row[0];
        sheetConfig.getCell(`I${i+4}`).font = { bold: true };
        sheetConfig.getCell(`J${i+4}`).value = row[1];
        sheetConfig.getCell(`J${i+4}`).border = { outline: true, style: 'thin', color: { argb: colorBorder } };
    });

    // 1.2 Package Table
    sheetConfig.columns = [
        { header: 'ID', key: 'id', width: 5 },
        { header: 'CATEGORIA', key: 'cat', width: 15 },
        { header: 'NOME DO PACOTE', key: 'name', width: 30 },
        { header: 'PREÇO BASE', key: 'price', width: 15 },
        { header: 'COBERTURA', key: 'coverage', width: 25 },
        { header: 'EQUIPE', key: 'team', width: 20 },
        { header: 'ENTREGAS', key: 'deliveries', width: 40 }
    ];

    const packages = [
        { id: 1, cat: 'Festa Infantil', name: 'Infantil - Essencial', price: 690, coverage: '4 horas', team: '1 Fotógrafo', deliveries: 'Fotos ilimitadas, editadas, entrega via link digital.' },
        { id: 2, cat: 'Festa Infantil', name: 'Infantil - Premium', price: 990, coverage: 'Cobertura Completa', team: '1 Fotógrafo', deliveries: 'Todas as fotos + Álbum 20x20' },
        { id: 3, cat: 'Festa Infantil', name: 'Infantil - Deluxe', price: 1600, coverage: 'Cobertura Completa', team: '1 Fotógrafo + Assistente', deliveries: 'Todas as fotos + Álbum 30x30 + Vídeo Teaser' },
        { id: 4, cat: 'Debutantes', name: 'Debutante - Bronze', price: 1500, coverage: '4 horas de festa', team: '1 Fotógrafo', deliveries: '150 fotos editadas via link digital' },
        { id: 5, cat: 'Debutantes', name: 'Debutante - Prata', price: 2500, coverage: 'Making of + Festa', team: '2 Fotógrafos', deliveries: '300 fotos editadas + Álbum' },
        { id: 6, cat: 'Debutantes', name: 'Debutante - Ouro', price: 3800, coverage: 'Ensaio + Making of + Festa', team: '2 Fotógrafos + Assistente', deliveries: 'Álbum Premium + Vídeo Teaser' },
        { id: 7, cat: 'Casamento', name: 'Casamento - Cerimônia', price: 1900, coverage: 'Apenas Cerimônia', team: '2 Fotógrafos', deliveries: '200 fotos editadas via link digital' },
        { id: 8, cat: 'Casamento', name: 'Casamento - Prata', price: 3500, coverage: 'Cerimônia + Recepção', team: '2 Fotógrafos', deliveries: 'Álbum Panorâmico + Digital' },
        { id: 9, cat: 'Casamento', name: 'Casamento - Ouro', price: 5800, coverage: 'Making of + Cerimônia + Recepção', team: '2 Fotógrafos + Assistente', deliveries: 'Álbum Luxo + Drone + Pré-Wedding' },
        { id: 10, cat: 'Casamento', name: 'Casamento - Diamante', price: 8900, coverage: 'Experiência Completa', team: '3 Fotógrafos', deliveries: 'Álbum Extra Grande + Vídeo Cinema' }
    ];

    packages.forEach(p => sheetConfig.addRow(p));
    sheetConfig.getRow(1).eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorOlive } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    // ==========================================
    // SHEET 2: GERADOR DE ORÇAMENTO
    // ==========================================
    const sheetGen = workbook.addWorksheet('Gerador de Orçamento');
    
    sheetGen.getCell('B2').value = 'MAYCLICK PHOTOGRAPHY - GERADOR';
    sheetGen.getCell('B2').font = { size: 14, bold: true, color: { argb: colorOlive } };

    // Budget Number
    sheetGen.getCell('F2').value = 'ORÇAMENTO #';
    sheetGen.getCell('G2').value = '01236'; // Initial value
    sheetGen.getCell('G2').font = { bold: true };

    // Client Info
    const genFields = [
        ['NOME DO CLIENTE:', 'B5', 'C5'],
        ['WHATSAPP:', 'B6', 'C6'],
        ['E-MAIL:', 'B7', 'C7'],
        ['DATA DO EVENTO:', 'E5', 'F5'],
        ['LOCAL:', 'E6', 'F6'],
        ['TIPO DE EVENTO:', 'E7', 'F7']
    ];
    genFields.forEach(f => {
        sheetGen.getCell(f[1]).value = f[0];
        sheetGen.getCell(f[1]).font = { bold: true, size: 9 };
        sheetGen.getCell(f[2]).border = { bottom: { style: 'thin', color: { argb: colorBorder } } };
    });

    // Selections
    sheetGen.getCell('B9').value = 'SELECIONE O PACOTE:';
    sheetGen.getCell('B9').font = { bold: true, color: { argb: colorOlive } };
    sheetGen.dataValidations.add('C9', {
        type: 'list',
        allowBlank: true,
        formulae: [`'Pacotes e Configurações'!$C$2:$C$11`]
    });
    sheetGen.getCell('C9').border = { outline: true, style: 'medium', color: { argb: colorOlive } };

    // Adjustments
    const adjFields = [
        ['Horas Extras (Qtd):', 'B11', 'C11'],
        ['Valor da Hora:', 'D11', 'E11'],
        ['Deslocamento (R$):', 'B12', 'C12'],
        ['Extras (R$):', 'D12', 'E12'],
        ['Desconto (R$):', 'B13', 'C13']
    ];
    adjFields.forEach(f => {
        sheetGen.getCell(f[1]).value = f[0];
        sheetGen.getCell(f[1]).font = { bold: true, size: 9 };
        sheetGen.getCell(f[2]).border = { outline: true, style: 'thin', color: { argb: colorBorder } };
    });

    // Summary logic
    sheetGen.getCell('B15').value = 'RESUMO FINANCEIRO';
    sheetGen.getCell('B15').font = { bold: true, color: { argb: colorOlive } };
    
    sheetGen.getCell('B16').value = 'Subtotal Pacote:';
    sheetGen.getCell('C16').value = { formula: `VLOOKUP(C9, 'Pacotes e Configurações'!$C$2:$D$11, 2, FALSE)` };
    sheetGen.getCell('C16').numFmt = '"R$ "#,##0.00';

    sheetGen.getCell('B17').value = 'Total Extras/Ajustes:';
    sheetGen.getCell('C17').value = { formula: `(C11*E11) + C12 + E12` };
    sheetGen.getCell('C17').numFmt = '"R$ "#,##0.00';

    sheetGen.getCell('B18').value = 'Desconto Aplicado:';
    sheetGen.getCell('C18').value = { formula: `C13` };
    sheetGen.getCell('C18').numFmt = '"R$ "#,##0.00';

    sheetGen.getCell('B19').value = 'INVESTIMENTO FINAL:';
    sheetGen.getCell('B19').font = { bold: true, size: 11 };
    sheetGen.getCell('C19').value = { formula: `C16 + C17 - C18` };
    sheetGen.getCell('C19').font = { bold: true, size: 12, color: { argb: colorGold } };
    sheetGen.getCell('C19').numFmt = '"R$ "#,##0.00';

    // ==========================================
    // SHEET 3: ORÇAMENTO FINAL (MAYCLICK STYLE)
    // ==========================================
    const sheetFinal = workbook.addWorksheet('Orçamento Final');
    sheetFinal.pageSetup.paperSize = 9;
    sheetFinal.pageSetup.fitToPage = true;
    sheetFinal.properties.defaultRowHeight = 22;

    // Header Curve Simulation
    sheetFinal.mergeCells('A1:G2');
    const header = sheetFinal.getCell('A1');
    header.value = 'ORÇAMENTO FOTOGRÁFICO';
    header.font = { size: 22, bold: true, color: { argb: colorOlive }, name: 'Arial Black' };
    header.alignment = { horizontal: 'center', vertical: 'middle' };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHeader } };
    header.border = { bottom: { style: 'medium', color: { argb: colorOlive } } };

    // Budget Number & Brand
    sheetFinal.getCell('A4').value = { formula: `CONCATENATE("ORÇAMENTO #", 'Gerador de Orçamento'!G2)` };
    sheetFinal.getCell('A4').font = { size: 14, bold: true };
    
    sheetFinal.getCell('E4').value = { formula: `'Pacotes e Configurações'!J4` }; // Mayclick Photography
    sheetFinal.getCell('E4').font = { bold: true, color: { argb: colorOlive } };
    sheetFinal.getCell('E4').alignment = { horizontal: 'right' };

    // Company & Client Grid
    sheetFinal.getCell('A6').value = 'DADOS DA EMPRESA:';
    sheetFinal.getCell('A6').font = { bold: true, size: 9, color: { argb: colorOlive } };
    sheetFinal.getCell('A7').value = { formula: `CONCATENATE("WhatsApp: ", 'Pacotes e Configurações'!J5, " | CNPJ: ", 'Pacotes e Configurações'!J6)` };
    sheetFinal.getCell('A8').value = { formula: `'Pacotes e Configurações'!J7` }; // Site
    sheetFinal.getCell('A7').font = { size: 8 };
    sheetFinal.getCell('A8').font = { size: 8 };

    sheetFinal.getCell('E6').value = 'PREPARADO PARA:';
    sheetFinal.getCell('E6').font = { bold: true, size: 9, color: { argb: colorOlive } };
    sheetFinal.getCell('E6').alignment = { horizontal: 'right' };
    sheetFinal.getCell('E7').value = { formula: `'Gerador de Orçamento'!C5` }; // Client Name
    sheetFinal.getCell('E7').alignment = { horizontal: 'right' };
    sheetFinal.getCell('E8').value = { formula: `CONCATENATE('Gerador de Orçamento'!F7, " em ", TEXT('Gerador de Orçamento'!F5, "dd/mm/yyyy"))` };
    sheetFinal.getCell('E8').alignment = { horizontal: 'right' };

    // Institutional Text (Corrected)
    sheetFinal.mergeCells('A10:G12');
    const instText = sheetFinal.getCell('A10');
    instText.value = 'A Mayclick Photography atua há 4 anos registrando eventos sociais com cuidado, sensibilidade e compromisso. Cada evento é tratado como uma memória única, e nosso objetivo é entregar uma experiência segura, organizada e especial para cada cliente.';
    instText.font = { size: 9, color: { argb: colorGraphite } };
    instText.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };

    // Proposal Table
    sheetFinal.getRow(14).values = ['SERVIÇO', '', 'DESCRIÇÃO', '', '', '', 'VALOR TOTAL'];
    sheetFinal.mergeCells('A14:B14');
    sheetFinal.mergeCells('C14:F14');
    sheetFinal.getRow(14).eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorOlive } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
    });

    // Content Row
    sheetFinal.mergeCells('A15:B17');
    sheetFinal.getCell('A15').value = { formula: `'Gerador de Orçamento'!C9` };
    sheetFinal.getCell('A15').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    sheetFinal.getCell('A15').font = { bold: true, size: 9 };

    sheetFinal.mergeCells('C15:F17');
    sheetFinal.getCell('C15').value = { formula: `VLOOKUP('Gerador de Orçamento'!C9, 'Pacotes e Configurações'!$C$2:$G$11, 5, FALSE)` };
    sheetFinal.getCell('C15').alignment = { vertical: 'middle', wrapText: true };
    sheetFinal.getCell('C15').font = { size: 9 };

    sheetFinal.mergeCells('G15:G17');
    sheetFinal.getCell('G15').value = { formula: `'Gerador de Orçamento'!C19` };
    sheetFinal.getCell('G15').numFmt = '"R$ "#,##0.00';
    sheetFinal.getCell('G15').alignment = { vertical: 'middle', horizontal: 'right' };
    sheetFinal.getCell('G15').font = { bold: true };

    // Payment & Terms
    sheetFinal.getCell('A19').value = 'FORMA DE PAGAMENTO:';
    sheetFinal.getCell('A19').font = { bold: true, size: 9, color: { argb: colorOlive } };
    sheetFinal.mergeCells('A20:G20');
    sheetFinal.getCell('A20').value = { formula: `'Pacotes e Configurações'!J10` };
    sheetFinal.getCell('A20').font = { size: 9 };

    sheetFinal.getCell('A22').value = 'TERMOS E CONDIÇÕES:';
    sheetFinal.getCell('A22').font = { bold: true, size: 9, color: { argb: colorOlive } };
    sheetFinal.mergeCells('A23:G24');
    sheetFinal.getCell('A23').value = { formula: `CONCATENATE("Este orçamento é válido por ", 'Pacotes e Configurações'!J9, " dias. Após a aprovação, o contrato é enviado para assinatura digital garantindo segurança e autenticidade via ZapSign.")` };
    sheetFinal.getCell('A23').font = { size: 8 };
    sheetFinal.getCell('A23').alignment = { wrapText: true };

    // Footer
    sheetFinal.mergeCells('A26:G26');
    sheetFinal.getCell('A26').value = 'Siga nosso Instagram: @mayclick_fotos | www.mayfotosefilmagens.com.br';
    sheetFinal.getCell('A26').font = { size: 8, italic: true, color: { argb: colorOlive } };
    sheetFinal.getCell('A26').alignment = { horizontal: 'center' };

    // Save
    const outputPath = path.join(__dirname, '..', 'deliverables', 'gerador-orcamentos-fotografia.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log('Planilha Mayclick refinada com sucesso!');
}

generateExcel().catch(err => console.error(err));
