const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

// Read logo file as Base64
const logoBuffer = fs.readFileSync(path.join(__dirname, '../public/logo-nova.png'));
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

const safePdfText = (value, fallback = '') => {
  const text = value == null ? '' : String(value).trim();
  return text && !['undefined', 'null', '[object object]'].includes(text.toLowerCase()) ? text : fallback;
};

const sanitizeFileNamePart = (value, fallback = 'Cliente') => (
  String(value || fallback)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || fallback
);

const toNumber = (v) => Number(v) || 0;
const formatMoney = (v) => toNumber(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const formatDateBR = (v) => v ? new Date(v + 'T12:00:00').toLocaleDateString('pt-BR') : 'A confirmar';

const submission = {
  id: 1042,
  budget_number: 1042,
  contractor: {
    fullName: "Mariana Souza & Carlos Eduardo",
    cpf: "123.456.789-00",
    email: "mariana.souza@email.com",
    phone: "(11) 98765-4321",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
  },
  budget: {
    event_location: "Buffet Mansão das Flores - Vila Mariana, São Paulo - SP",
    event_date: "2026-10-24"
  },
  selectedPackageId: "Casamento Completo Premium",
  package: {
    name: "Casamento Completo Premium",
    price: 4500.00,
    category: "Casamento",
    coverage_time: "8 horas",
    team: "2 Fotógrafos + 1 Assistente",
    description: "Cobertura fotográfica completa da cerimônia, recepção e Making Of dos noivos.",
    deliveries: "Pen drive exclusivo + Galeria Online em alta resolução com download ilimitado",
    differential: "Ensaio pré-wedding incluso + Tratamento de cor e edição fina de todas as fotos"
  },
  extras: [
    { name: "Making Of do Noivo", price: 400.00 },
    { name: "Drone (Tomadas Aéreas)", price: 600.00 }
  ],
  extraHoursCount: 1,
  extraHourPrice: 250.00,
  transportValue: 150.00,
  transportLabel: "Deslocamento ida e volta (São Paulo)",
  subtotal: 5900.00,
  discountData: { amount: 300.00 },
  totalValue: 5600.00
};

// --- 1. GENERATE ORÇAMENTO PDF ---
function generateSampleOrcamento() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pkg = submission.package;
  const goldPrimary = [181, 164, 109];
  const goldDark = [140, 120, 80];
  const textDark = [20, 20, 20];
  const textMuted = [100, 100, 100];
  const bgSoft = [250, 250, 250];

  const margin = 12;
  const pageWidth = 210;
  const pageHeight = 297;
  const footerY = pageHeight - 10;
  let yPos = 15;

  const budgetNumber = String(submission.budget_number).padStart(5, '0');
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // --- HEADER WITH LOGO ---
  const headerHeight = 38;
  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Top Gold Line Accent
  doc.setFillColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Draw Logo
  const logoSize = 25; // 25mm x 25mm square logo
  doc.addImage(logoBase64, 'PNG', margin, 6.5, logoSize, logoSize);
  const titleX = margin + logoSize + 4; // ~41mm

  // Title Left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.text("MAYCLICK PHOTOGRAPHY", titleX, 18);

  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("ORÇAMENTO", titleX, 25);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Fotografia Profissional", titleX, 30.5);

  // Info Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text(`ORÇAMENTO #${budgetNumber}`, pageWidth - margin, 18, { align: 'right' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Data: ${currentDate}`, pageWidth - margin, 25, { align: 'right' });

  // Bottom Header Line
  doc.setDrawColor(225, 215, 185);
  doc.setLineWidth(0.4);
  doc.line(margin, headerHeight, pageWidth - margin, headerHeight);

  yPos = 46;

  // --- SENDER & RECEIVER ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.6);
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("MAYCLICK PHOTOGRAPHY", margin, yPos);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  yPos += 5;
  doc.text(`WhatsApp: (11) 96303-1814`, margin, yPos);
  yPos += 4;
  doc.text("CNPJ: 37.816.268/0001-06", margin, yPos);
  yPos += 4;
  doc.text("Site: www.mayfotosefilmagens.com.br", margin, yPos);
  yPos += 4;
  doc.text("Instagram: @mayclick_fotos", margin, yPos);

  let clientY = 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.6);
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("DADOS DO CLIENTE", 108, clientY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  clientY += 5;
  doc.text(`Nome: ${submission.contractor.fullName}`, 108, clientY);
  clientY += 4;

  const eventLoc = submission.budget.event_location;
  const splitLoc = doc.splitTextToSize(`Local da festa: ${eventLoc}`, pageWidth - 108 - margin);
  doc.text(splitLoc.slice(0, 2), 108, clientY);
  clientY += (Math.min(splitLoc.length, 2) * 4);

  doc.text(`Data da festa: ${formatDateBR(submission.budget.event_date)}`, 108, clientY);

  yPos = Math.max(yPos + 4, clientY + 6);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.2);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const institutionalText = "Registro fotográfico profissional para eventos sociais, com entrega conforme pacote contratado.";
  const institutionalLines = doc.splitTextToSize(institutionalText, pageWidth - (margin * 2));
  doc.text(institutionalLines.slice(0, 2), margin, yPos);
  yPos += Math.min(institutionalLines.length, 2) * 3.4 + 3;

  // --- SERVICE TABLE ---
  doc.setFillColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 7, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(255, 255, 255);
  doc.text("SERVIÇO", margin + 4, yPos + 4.8);
  doc.text("VALOR", pageWidth - margin - 4, yPos + 4.8, { align: 'right' });

  yPos += 12;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(pkg.name, margin, yPos);
  doc.text(`R$ ${formatMoney(pkg.price)}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 5.5;

  const packageMeta = [
    pkg.category ? `Categoria: ${pkg.category}` : null,
    pkg.coverage_time ? `Cobertura: ${pkg.coverage_time}` : null,
    pkg.team ? `Equipe: ${pkg.team}` : null,
  ].filter(Boolean);

  if (packageMeta.length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(packageMeta.join(' | '), margin, yPos);
    yPos += 5.5;
  }

  // Description
  doc.setFontSize(7.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`- Cobertura fotográfica completa da cerimônia, recepção e Making Of`, margin + 4, yPos);
  yPos += 4;
  doc.text(`- Ensaio pré-wedding em locação a escolher`, margin + 4, yPos);
  yPos += 4;
  doc.text(`- Tratamento de cor e edição fina de todas as imagens selecionadas`, margin + 4, yPos);
  yPos += 5;

  if (pkg.deliveries) {
    doc.setFont("helvetica", "bold");
    doc.text("Entregas:", margin, yPos);
    yPos += 3.5;
    doc.setFont("helvetica", "normal");
    doc.text(pkg.deliveries, margin, yPos);
    yPos += 4.5;
  }

  // EXTRAS
  doc.setFont("helvetica", "bold");
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("ADICIONAIS", margin, yPos);
  yPos += 4;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  submission.extras.forEach(extra => {
    doc.text(`- ${extra.name}`, margin, yPos);
    doc.text(`R$ ${formatMoney(extra.price)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 4;
  });

  if (submission.extraHoursCount > 0) {
    doc.text(`- Hora Extra (${submission.extraHoursCount}h)`, margin, yPos);
    doc.text(`R$ ${formatMoney(submission.extraHoursCount * submission.extraHourPrice)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 4;
  }

  // DESLOCAMENTO
  doc.setFont("helvetica", "bold");
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("DESLOCAMENTO", margin, yPos);
  yPos += 4;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(submission.transportLabel, margin, yPos);
  doc.text(`R$ ${formatMoney(submission.transportValue)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;

  // TOTAL FINAL
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Subtotal:", pageWidth - margin - 80, yPos);
  doc.text(`R$ ${formatMoney(submission.subtotal)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 4.5;

  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("Desconto:", pageWidth - margin - 80, yPos);
  doc.text(`- R$ ${formatMoney(submission.discountData.amount)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;

  doc.setFillColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.rect(pageWidth - margin - 78, yPos, 78, 11, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.2);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL FINAL:", pageWidth - margin - 74, yPos + 7.3);
  doc.setFontSize(10.8);
  doc.text(`R$ ${formatMoney(submission.totalValue)}`, pageWidth - margin - 4, yPos + 7.5, { align: 'right' });

  yPos += 15;

  // OBSERVAÇÕES COMERCIAIS
  doc.setFontSize(8.8);
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("OBSERVAÇÕES COMERCIAIS", margin, yPos);
  yPos += 4.6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const commercialLines = [
    `- Este orçamento é válido por 5 dias.`,
    '- Formas de pagamento:',
    `  • À vista com 5% de desconto: R$ ${formatMoney(submission.totalValue * 0.95)}.`,
    `  • Parcelado com 30% de entrada (R$ ${formatMoney(submission.totalValue * 0.3)}) + 70% restante (R$ ${formatMoney(submission.totalValue * 0.7)}).`,
    '  • Cartão de crédito.',
    '- Após a aprovação, o contrato é enviado para assinatura digital segura.'
  ];

  commercialLines.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 3.6;
  });

  // FOOTER
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Mayclick Photography - Todos os direitos reservados.", pageWidth / 2, pageHeight - 6, { align: "center" });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const outputPath = path.join(__dirname, 'Orcamento_Mayclick_Teste_Mariana_Souza.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`[SUCCESS] Generated sample PDF at: ${outputPath}`);
  return outputPath;
}

generateSampleOrcamento();
