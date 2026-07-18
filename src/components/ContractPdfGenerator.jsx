import { jsPDF } from "jspdf";
import { saveGeneratedDocument } from "../lib/apiClient";
import { fetchPublicPackagesWithFallback, featureToDisplayText, normalizePackageFeatures } from "../lib/packages";

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const normalized = trimmed
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) => (
  toNumber(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
);

const parseLocalDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value).trim();
  const isoDateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const [, year, month, day] = isoDateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateBR = (value, fallback = 'A confirmar') => {
  const date = parseLocalDate(value);
  return date ? date.toLocaleDateString('pt-BR') : fallback;
};

const firstArray = (...arrays) => arrays.find((items) => Array.isArray(items) && items.length > 0) || [];

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

export const generateContractPdf = async ({ submission, budgetId, businessSettings }) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  if (!submission?.budget_number && !submission?.id) {
    console.warn('A budget_number or id is recommended before generating a budget PDF.');
  }

  // Package search - Clean up name for display
  let pkgName = submission.selectedPackageId || 'Personalizado';

  let serverPackage = null;
  if (!submission.package) {
    try {
      const { packages: livePackages, source } = await fetchPublicPackagesWithFallback();
      if (source !== 'api') {
        throw new Error('Package data is not available from the server.');
      }
      serverPackage = livePackages.find(p => p.id === submission.selectedPackageId);
    } catch (error) {
      console.error('[PDF] Error fetching live packages:', {
        status: error.status,
        endpoint: error.endpoint,
      });
      throw error;
    }
  }

  const pkg = submission.package
    || serverPackage
    || {
    name: pkgName,
    price: 0,
    description: 'Cobertura fotográfica profissional conforme acordado.'
  };

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

  // Helper for numbering (5 digits)
  const budgetNumber = submission.budget_number
    ? String(submission.budget_number).padStart(5, '0')
    : String(submission.id || "00000").slice(-5).toUpperCase();

  const currentDate = new Date().toLocaleDateString('pt-BR');

  // --- HEADER ---
  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Title Left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.text("MAYCLICK PHOTOGRAPHY", margin, 23);

  doc.setFontSize(12);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("ORÇAMENTO", margin, 31);

  // Info Right
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`ORÇAMENTO #${budgetNumber}`, pageWidth - margin, 23, { align: 'right' });
  doc.text(`Data: ${currentDate}`, pageWidth - margin, 31, { align: 'right' });

  yPos = 45;

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

  let clientY = 45;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.6);
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("DADOS DO CLIENTE", 108, clientY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  clientY += 5;
  doc.text(`Nome: ${safePdfText(submission.contractor?.fullName, "Cliente")}`, 108, clientY);
  clientY += 4;

  const eventLoc = submission.budget?.event_location
    || submission.budget?.eventLocation
    || submission.event_location
    || submission.eventLocation
    || submission.event?.event_location
    || submission.event?.locationName
    || submission.event?.eventLocation
    || submission.event?.location
    || submission.event?.event_address
    || submission.event?.address
    || "A definir";
  const splitLoc = doc.splitTextToSize(`Local da festa: ${safePdfText(eventLoc, 'A definir')}`, pageWidth - 108 - margin);
  const visibleLocLines = splitLoc.slice(0, 2);
  doc.text(visibleLocLines, 108, clientY);
  clientY += (visibleLocLines.length * 4);

  const eventDate = formatDateBR(
    submission.budget?.eventDate
    || submission.budget?.event_date
    || submission.eventDate
    || submission.event_date
    || submission.event?.eventDate
    || submission.event?.event_date
    || submission.event?.date
  );
  doc.text(`Data da festa: ${eventDate}`, 108, clientY);

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
  doc.text(safePdfText(pkg.name, "Serviço de Fotografia Profissional"), margin, yPos);

  // Package price (could be overridden by payment.totalValue, but here we show base)
  const basePrice = Number(pkg.price || 0);
  doc.text(`R$ ${basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 5.5;

  const packageMeta = [
    pkg.category ? `Categoria: ${pkg.category}` : null,
    pkg.package_number ? `Pacote: ${pkg.package_number}` : null,
    pkg.coverage_time ? `Cobertura: ${pkg.coverage_time}` : null,
    pkg.team ? `Equipe: ${pkg.team}` : null,
  ].filter(Boolean);

  if (packageMeta.length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const splitMeta = doc.splitTextToSize(packageMeta.join(' | '), pageWidth - (margin * 2));
    doc.text(splitMeta.slice(0, 2), margin, yPos);
    yPos += (Math.min(splitMeta.length, 2) * 3.6) + 2;
  }

  // Description List
  doc.setFontSize(7.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const cleanDescription = (text) => {
    if (!text) return ["Cobertura fotográfica profissional"];

    let items = safePdfText(text).split(/[,\n•]/)
      .map(s => s.trim())
      .filter(s => s.length > 2)
      .filter(s => !s.toLowerCase().includes("pacote moderno"))
      .filter(s => !s.toLowerCase().includes("perfeito para quem"))
      .filter(s => !s.toLowerCase().includes("revisão"))
      .filter(s => !s.toLowerCase().includes("anotação"))
      .filter(s => !s.toLowerCase().includes("instrução"));

    return items;
  };

  const packageFeatures = normalizePackageFeatures(pkg.features);
  const descItems = packageFeatures.length > 0
    ? packageFeatures
      .filter((feature) => feature.included)
      .map(featureToDisplayText)
      .filter(Boolean)
    : cleanDescription(pkg.description);
  descItems.slice(0, 5).forEach(item => {
    const bullet = `- ${safePdfText(item)}`;
    const splitItem = doc.splitTextToSize(bullet, pageWidth - (margin * 2) - 10);
    doc.text(splitItem.slice(0, 2), margin + 4, yPos);
    yPos += Math.min(splitItem.length, 2) * 3.5;
  });

  if (pkg.deliveries && descItems.length < 5) {
    yPos += 1.5;
    doc.setFont("helvetica", "bold");
    doc.text("Entregas:", margin, yPos);
    yPos += 3.5;
    doc.setFont("helvetica", "normal");
    const splitDeliveries = doc.splitTextToSize(safePdfText(pkg.deliveries), pageWidth - (margin * 2));
    doc.text(splitDeliveries.slice(0, 1), margin, yPos);
    yPos += Math.min(splitDeliveries.length, 1) * 3.5;
  }

  if (pkg.differential && descItems.length < 4) {
    yPos += 1.5;
    doc.setFont("helvetica", "bold");
    doc.text("Diferencial:", margin, yPos);
    yPos += 3.5;
    doc.setFont("helvetica", "normal");
    const splitDifferential = doc.splitTextToSize(safePdfText(pkg.differential), pageWidth - (margin * 2));
    doc.text(splitDifferential.slice(0, 1), margin, yPos);
    yPos += Math.min(splitDifferential.length, 1) * 3.5;
  }

  yPos += 1.5;

  // --- EXTRAS / TRAVEL ---
  const extras = firstArray(submission.extras, submission.extras_data);
  const extraHours = Number(submission.extraHoursCount || 0);
  const travel = Number(submission.transportValue || 0);
  const travelLabel = submission.transportLabel || 'Deslocamento ida e volta';
  const extrasTotal = extras.reduce((acc, extra) => acc + toNumber(extra.price), 0);
  const extraHoursTotal = extraHours * toNumber(submission.extraHourPrice || 190);
  const computedSubtotal = toNumber(pkg.price) + extrasTotal + extraHoursTotal + travel;
  const discountData = submission.discountData || submission.discount_data || {};
  const discountAmount = Math.min(
    Math.max(0, toNumber(discountData.amount ?? submission.discountValue)),
    computedSubtotal
  );
  const subtotal = toNumber(submission.subtotal) || computedSubtotal;
  const totalPrice = Math.max(0, toNumber(submission.totalValue ?? submission.total) || (subtotal - discountAmount));

  const ensureLineSpace = (height = 6) => {
    if (yPos + height > footerY - 8) {
      doc.addPage();
      yPos = 18;
    }
  };

  if (extras.length > 0 || extraHours > 0) {
    yPos += 1.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
    doc.text("ADICIONAIS", margin, yPos);
    yPos += 4;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    extras.forEach(extra => {
      ensureLineSpace();
      doc.text(`- ${safePdfText(extra.name, 'Adicional')}`, margin, yPos);
      doc.text(`R$ ${formatMoney(extra.price)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
    });

    if (extraHours > 0) {
      ensureLineSpace();
      const price = Number(submission.extraHourPrice || 190);
      doc.text(`- Hora Extra (${extraHours}h)`, margin, yPos);
      doc.text(`R$ ${formatMoney(extraHours * price)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
    }
  }

  if (travel > 0) {
    yPos += 1.5;
    ensureLineSpace();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
    doc.text("DESLOCAMENTO", margin, yPos);
    yPos += 4;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const splitTravelLabel = doc.splitTextToSize(travelLabel, pageWidth - (margin * 2) - 55);
    doc.text(splitTravelLabel.slice(0, 1), margin, yPos);
    doc.text(`R$ ${formatMoney(travel)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 4.2;
  }

  // --- TOTAL FINAL ---
  yPos += 2.5;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4.5;

  if (discountAmount > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Subtotal:", pageWidth - margin - 80, yPos);
    doc.text(`R$ ${formatMoney(subtotal)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 4.5;

    doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
    doc.text("Desconto:", pageWidth - margin - 80, yPos);
    doc.text(`- R$ ${formatMoney(discountAmount)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
  }

  doc.setFillColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.rect(pageWidth - margin - 78, yPos, 78, 11, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.2);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL FINAL:", pageWidth - margin - 74, yPos + 7.3);
  doc.setFontSize(10.8);
  doc.text(`R$ ${formatMoney(totalPrice)}`, pageWidth - margin - 4, yPos + 7.5, { align: 'right' });

  yPos += 15;

  // --- COMMERCIAL NOTES ---
  doc.setFontSize(8.8);
  doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
  doc.text("OBSERVAÇÕES COMERCIAIS", margin, yPos);
  yPos += 4.6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const cashTotal = totalPrice * 0.95;
  const entryTotal = totalPrice * 0.3;
  const balanceTotal = totalPrice * 0.7;
  const commercialLines = [
    `- Este orçamento é válido por ${businessSettings?.budget_validity_days || 5} dias.`,
    '- Formas de pagamento:',
    `  • À vista com 5% de desconto: R$ ${formatMoney(cashTotal)}.`,
    `  • Parcelado com 30% de entrada (R$ ${formatMoney(entryTotal)}) + 70% restante (R$ ${formatMoney(balanceTotal)}).`,
    '  • Cartão de crédito.',
    '- Após a aprovação, o contrato é enviado para assinatura digital segura.'
  ];

  commercialLines.forEach(line => {
    const splitLine = doc.splitTextToSize(line, pageWidth - (margin * 2));
    if (yPos + 3.6 > footerY - 4) {
      doc.addPage();
      yPos = 18;
    }
    doc.text(splitLine.slice(0, 2), margin, yPos);
    yPos += Math.min(splitLine.length, 2) * 3.4;
  });

  // --- FOOTER ---
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Mayclick Photography - Todos os direitos reservados.", pageWidth / 2, pageHeight - 6, { align: "center" });

  const clientName = sanitizeFileNamePart(submission.contractor?.fullName);
  const pdfName = `Orcamento_Mayclick_${clientName}_${budgetNumber}.pdf`;
  const pdfBlob = doc.output('blob');
  try {
    const savedDocument = await saveGeneratedDocument({
      submissionId: budgetId ? null : submission.id,
      budgetId: budgetId,
      documentType: 'budget',
      file: pdfBlob,
      fileName: pdfName
    });
    doc.save(pdfName);
    return savedDocument;
  } catch (error) {
    console.error("[PDF] Error saving budget to server:", {
      status: error.status,
      endpoint: error.endpoint,
      details: error.details,
    });
    doc.save(pdfName);
    error.pdfGenerated = true;
    throw error;
  }
};

export const generateServiceContractPdf = async ({ submission, budgetId, businessSettings }) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  if (!submission?.budget_number && !submission?.id) {
    console.warn('A budget_number or id is recommended before generating a contract PDF.');
  }

  const goldPrimary = [181, 164, 109];
  const goldDark = [140, 120, 80];
  const textDark = [20, 20, 20];
  const textMuted = [100, 100, 100];
  const bgSoft = [250, 250, 250];

  const margin = 15;
  const pageWidth = 210;
  const pageHeight = 297;
  let yPos = 15;

  const budgetNumber = submission.budget_number
    ? String(submission.budget_number).padStart(5, '0')
    : String(submission.id || "00000").slice(-5).toUpperCase();

  const currentDate = new Date().toLocaleDateString('pt-BR');

  // --- HEADER ---
  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Title Left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", margin, 23);

  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("FOTOGRÁFICOS", margin, 31);

  // Info Right
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`CONTRATO #${budgetNumber}`, pageWidth - margin, 23, { align: 'right' });
  doc.text(`Data: ${currentDate}`, pageWidth - margin, 31, { align: 'right' });

  yPos = 50;

  // --- VARIABLES ---
  const pkg = submission.package || { name: submission.selectedPackageId || submission.selected_package_name || 'Personalizado', price: 0 };
  const totalValue = submission.budget?.total || submission.totalValue || submission.total || pkg.price;
  const eventLoc = submission.budget?.event_location || submission.eventLocation || submission.event_location || "A definir";
  const eventDate = formatDateBR(submission.budget?.event_date || submission.eventDate || submission.event_date);
  const paymentMethod = submission.paymentMethod || submission.budget?.payment_method || submission.payment_method || "A combinar";

  const defaultContract = `CONTRATADA: [CONTRATADA_NOME], com sede em [ENDERECO_CONTRATADA], inscrita no CNPJ sob nº [CONTRATADA_CNPJ].
  
CONTRATANTE: [NOME_CLIENTE], inscrito no CPF sob nº [CPF_CLIENTE], residente e domiciliado em [ENDERECO_CLIENTE].

OBJETO DO CONTRATO
O presente contrato tem como objeto a prestação de serviços de cobertura fotográfica do evento, referente ao pacote: [PACOTE_NOME].

LOCAL E DATA DO EVENTO
O evento será realizado no dia [DATA_EVENTO], no endereço: [LOCAL_EVENTO].

VALOR E FORMA DE PAGAMENTO
Pela prestação dos serviços, a CONTRATANTE pagará à CONTRATADA o valor total de R$ [VALOR_TOTAL].
Forma de pagamento: [FORMA_PAGAMENTO].

OBRIGAÇÕES E RESPONSABILIDADES
A contratada se compromete a entregar o material no prazo estipulado e a contratante se compromete a garantir o acesso da equipe ao local do evento.
`;

  let rawText = businessSettings?.contract_text || defaultContract;

  // Replace tags
  rawText = rawText.replace(/\[CONTRATADA_NOME\]/g, businessSettings?.company_name || 'Mayclick Photography');
  rawText = rawText.replace(/\[CONTRATADA_CNPJ\]/g, businessSettings?.cnpj || '___.___.___/____-__');
  rawText = rawText.replace(/\[ENDERECO_CONTRATADA\]/g, businessSettings?.address || 'Endereço não informado');

  
  const clientName = submission.contractor?.fullName || submission.client_name || "_______________";
  const clientCpf = submission.contractor?.cpf || submission.client_cpf || "___.___.___-__";
  const clientAddress = submission.contractor?.address || submission.client_address || "Endereço não informado";

  rawText = rawText.replace(/\[NOME_CLIENTE\]/g, safePdfText(clientName));
  rawText = rawText.replace(/\[CPF_CLIENTE\]/g, safePdfText(clientCpf));
  rawText = rawText.replace(/\[ENDERECO_CLIENTE\]/g, safePdfText(clientAddress));
  
  rawText = rawText.replace(/\[DATA_EVENTO\]/g, eventDate);
  rawText = rawText.replace(/\[LOCAL_EVENTO\]/g, eventLoc);
  rawText = rawText.replace(/\[PACOTE_NOME\]/g, safePdfText(pkg.name, "Serviço Fotográfico"));
  rawText = rawText.replace(/\[VALOR_TOTAL\]/g, formatMoney(totalValue));
  rawText = rawText.replace(/\[FORMA_PAGAMENTO\]/g, paymentMethod);

  // Print text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const splitLines = doc.splitTextToSize(rawText, pageWidth - (margin * 2));
  
  for (let i = 0; i < splitLines.length; i++) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(splitLines[i], margin, yPos);
    yPos += 5.5;
  }

  yPos += 20;
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 30;
  }

  // Signatures
  doc.setDrawColor(textMuted[0], textMuted[1], textMuted[2]);
  
  // Signature 1
  doc.line(margin, yPos, margin + 70, yPos);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CONTRATADA", margin, yPos + 5);
  doc.setFont("helvetica", "normal");
  doc.text(businessSettings?.company_name || 'Mayclick Photography', margin, yPos + 10);
  
  // Signature 2
  doc.line(pageWidth - margin - 70, yPos, pageWidth - margin, yPos);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATANTE", pageWidth - margin - 70, yPos + 5);
  doc.setFont("helvetica", "normal");
  doc.text(safePdfText(clientName), pageWidth - margin - 70, yPos + 10);

  // Create file Blob
  const pdfBlob = doc.output('blob');
  const fileName = `Contrato-${budgetNumber}-${(clientName).replace(/[^a-z0-9]/gi, '_').substring(0, 20)}.pdf`;
  const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

  try {
    const savedDocument = await saveGeneratedDocument({
      submissionId: submission.id,
      budgetId: budgetId,
      documentType: 'contract',
      file,
      fileName,
    });
    return savedDocument;
  } catch (error) {
    console.error('[PDF] Error saving contract document:', {
      status: error.status,
      message: error.message,
    });
    const err = new Error(error.message || 'Falha ao salvar o PDF do Contrato gerado.');
    err.pdfGenerated = true; 
    err.pdfBlob = pdfBlob;
    throw err;
  }
};

export const generateFichaTecnicaPdf = async ({ submission, businessSettings }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const GOLD = [176, 154, 91];
  const GOLD_DARK = [128, 109, 62];
  const BLACK = [14, 14, 14];
  const TEXT = [48, 42, 35];
  const MUTED = [112, 104, 88];
  const BEIGE = [226, 211, 185];
  const BEIGE_LIGHT = [247, 243, 234];
  const WHITE = [255, 255, 255];

  const safeText = (value, fallback = 'Não informado') => {
    const text = value == null ? '' : String(value).trim();
    return text && !['undefined', 'null'].includes(text.toLowerCase()) ? text : fallback;
  };

  const formatDate = (value, fallback = 'A confirmar') => formatDateBR(value, fallback);

  const formatCurrency = (value) => (
    toNumber(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  );

  const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

  const safeObject = (value) => (
    value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  );

  const firstObject = (...values) => (
    values.map(safeObject).find((value) => Object.keys(value).length > 0) || {}
  );

  const linkedBudget = safeObject(submission.budget);
  const hasLinkedBudget = Boolean(linkedBudget.id || linkedBudget.budget_number || linkedBudget.total || linkedBudget.payment_data);
  const contractor = submission.contractor || submission.contractor_data || {};
  const event = submission.event || submission.event_data || {};
  const payment = hasLinkedBudget
    ? firstObject(linkedBudget.payment_data, submission.payment, submission.payment_data)
    : firstObject(submission.payment, submission.payment_data);
  const selectedPackageId = submission.selectedPackageId || submission.selected_package_id || '';

  const firstText = (...values) => {
    for (const value of values) {
      const text = value == null ? '' : String(value).trim();
      if (text && !['undefined', 'null'].includes(text.toLowerCase())) return text;
    }
    return '';
  };

  const firstNonUuidText = (...values) => {
    for (const value of values) {
      const text = firstText(value);
      if (text && !isUuid(text)) return text;
    }
    return '';
  };

  const safeArrayValue = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const normalizeExtras = (items) => (
    safeArrayValue(items)
        .map((extra) => {
          const unitPrice = toNumber(extra?.price ?? extra?.amount ?? extra?.value);
          const quantity = Math.max(1, toNumber(extra?.quantity || 1));
          const total = toNumber(extra?.total);

          return {
            name: firstText(extra?.name, extra?.label, extra?.title, extra?.description),
            price: total > 0 ? total : unitPrice * quantity,
          };
        })
        .filter((extra) => extra.name)
  );

  const normalizeTravelExtra = (...travelSources) => {
    for (const travel of travelSources) {
      if (!travel) continue;
      if (typeof travel === 'number' || typeof travel === 'string') {
        const price = toNumber(travel);
        if (price > 0) return { name: 'Deslocamento ida e volta', price };
        continue;
      }
      const price = toNumber(travel.amount ?? travel.value ?? travel.price ?? travel.total);
      const label = firstText(travel.label, travel.name, travel.description, 'Deslocamento ida e volta');
      if (price > 0) return { name: label, price };
    }
    return null;
  };

  const normalizeTextForMatch = (value) => (
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  );

  const isTravelLikeExtra = (extra) => {
    const text = normalizeTextForMatch(extra?.name || extra?.label || extra?.description);
    return text.includes('deslocamento') || text.includes('ida e volta') || text.includes('transporte') || text.includes('travel');
  };

  const roundMoney = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

  const compactAddress = (address) => {
    if (!address) return 'Não informado';
    if (typeof address === 'string') return safeText(address);
    const streetLine = [address.street, address.number].filter(Boolean).join(', ');
    const complement = address.complement ? String(address.complement).trim() : '';
    const district = address.neighborhood ? String(address.neighborhood).trim() : '';
    const cityState = [address.city, address.state].filter(Boolean).join(' - ');
    const zip = address.zip || address.cep || '';
    const parts = [streetLine, complement, district, cityState, zip].filter(Boolean);
    return parts.length ? parts.join(' | ') : 'Não informado';
  };

  const resolvePackage = async () => {
    const directName = firstNonUuidText(
      submission.selected_package_name,
      submission.selectedPackageName,
      submission.package_data?.name,
      submission.package?.name,
      submission.packageName,
      submission.package_name,
      submission.budget?.selected_package_name,
      submission.budget?.package_data?.name
    );

    if (directName) {
      return {
        name: directName,
        category: submission.package?.category || submission.package_data?.category || linkedBudget.package_data?.category || '',
        price: toNumber(
          submission.package?.price
          ?? submission.package_data?.price
          ?? linkedBudget.package_data?.price
          ?? linkedBudget.package_price
        ),
      };
    }

    if (submission.package?.id === selectedPackageId && submission.package?.name && !isUuid(submission.package.name)) {
      return { name: submission.package.name, category: submission.package.category || '', price: toNumber(submission.package.price) };
    }

    try {
      const { packages } = await fetchPublicPackagesWithFallback();
      const found = packages.find((pkg) => String(pkg.id) === String(selectedPackageId));
      if (found?.name) return { name: found.name, category: found.category || '', price: toNumber(found.price) };
    } catch (error) {
      console.warn('[PDF] Could not resolve package name for ficha técnica:', {
        status: error.status,
        endpoint: error.endpoint,
      });
    }

    return {
      name: isUuid(selectedPackageId) ? 'Pacote a confirmar' : safeText(selectedPackageId, 'Pacote a confirmar'),
      category: '',
      price: toNumber(linkedBudget.package_price ?? linkedBudget.package_data?.price),
    };
  };

  const packageInfo = await resolvePackage();
  const split = (text, width) => doc.splitTextToSize(safeText(text), width);

  const drawTopRule = (y) => {
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.35);
    doc.line(margin, y, pageWidth / 2 - 6, y);
    doc.line(pageWidth / 2 + 6, y, pageWidth - margin, y);
    doc.rect(pageWidth / 2 - 1.5, y - 1.5, 3, 3);
  };

  const drawSectionTitle = (title, x, y, width) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(GOLD_DARK[0], GOLD_DARK[1], GOLD_DARK[2]);
    doc.text(title, x, y);
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.25);
    doc.line(x, y + 3, x + width, y + 3);
  };

  const drawLabelValue = (label, value, x, y, width, options = {}) => {
    const labelWidth = options.labelWidth || 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(options.size || 7.6);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(label + ':', x, y);
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    const lines = doc.splitTextToSize(safeText(value), width - labelWidth);
    doc.text(lines, x + labelWidth, y);
    return y + Math.max(5, lines.length * 4.1);
  };

  const drawMoneyRow = (label, value, x, y, width, highlight = false) => {
    doc.setFont('helvetica', highlight ? 'bold' : 'normal');
    doc.setFontSize(highlight ? 9.5 : 8.5);
    doc.setTextColor(highlight ? GOLD_DARK[0] : TEXT[0], highlight ? GOLD_DARK[1] : TEXT[1], highlight ? GOLD_DARK[2] : TEXT[2]);
    doc.text(label, x, y);
    doc.text(value, x + width, y, { align: 'right' });
    doc.setDrawColor(232, 226, 214);
    doc.line(x, y + 2.3, x + width, y + 2.3);
    return y + 7.2;
  };

  const fullName = safeText(contractor.fullName || contractor.name, 'A definir');
  const eventType = firstText(event.type, event.eventType, event.event_type, event.service_type, submission.event_type, packageInfo.category);
  const celebrantsName = firstText(
    event.celebrantsName,
    event.celebrantName,
    event.celebrant,
    event.birthdayPerson,
    event.coupleName,
    event.debutanteName
  );
  const eventLocation = firstText(
    event.location,
    event.eventLocation,
    event.locationName,
    event.local,
    event.event_location,
    event.eventAddress,
    event.event_address,
    submission.event_location,
    submission.budget?.event_location
  );
  const guestCount = firstText(event.guestCount, event.guests, event.estimatedGuests, event.guest_count);
  const eventDate = formatDate(event.date || event.eventDate || event.event_date || submission.event_date);
  const startTime = safeText(event.startTime || event.start_time || event.startsAt, 'A definir');
  const endTime = safeText(event.endTime || event.end_time || event.endsAt, 'A definir');
  const eventAddress = compactAddress(event.address || event.eventAddress || event.event_address || event.event_location || eventLocation);
  const residentialAddress = compactAddress(contractor.address);
  const notes = safeText(submission.observations || submission.importantNotes || submission.important_notes, '');
  const extrasSource = [
    linkedBudget.extras_data,
    submission.extras,
    submission.extras_data,
    submission.selectedExtras,
    submission.selected_extras,
  ].find((source) => safeArrayValue(source).length > 0);
  const baseExtras = [
    ...normalizeExtras(extrasSource),
  ];
  const travelExtra = normalizeTravelExtra(
    linkedBudget.travel_data,
    linkedBudget.travel,
    submission.travel_data,
    submission.travelData,
    submission.travel,
    event.travel_data,
    event.travelData,
    submission.event_data?.travel_data,
    submission.event?.travel_data,
    submission.selectedTravel,
    submission.selected_travel,
    submission.transportValue
  );
  const hasTravelInExtras = baseExtras.some(isTravelLikeExtra);
  const extras = travelExtra && !hasTravelInExtras ? [...baseExtras, travelExtra] : baseExtras;
  const packagePrice = toNumber(
    linkedBudget.package_price
    ?? linkedBudget.package_data?.price
    ?? submission.package?.price
    ?? submission.package_data?.price
    ?? packageInfo.price
  );
  const extrasTotal = baseExtras.reduce((acc, extra) => acc + toNumber(extra.price), 0);
  const travelTotal = travelExtra && !hasTravelInExtras ? toNumber(travelExtra.price) : 0;
  const computedSubtotal = roundMoney(packagePrice + extrasTotal + travelTotal);
  const discountData = hasLinkedBudget
    ? safeObject(linkedBudget.discount_data)
    : safeObject(submission.discount_data || submission.discountData);
  const discountAmount = toNumber(discountData.amount ?? submission.discountValue ?? payment.discountValue);
  const subtotal = toNumber(linkedBudget.subtotal ?? payment.baseValue) || computedSubtotal;
  const paymentTotal = toNumber(payment.totalValue ?? payment.total);
  const calculatedTotal = roundMoney(Math.max(0, subtotal - discountAmount));
  const financialTotal = toNumber(linkedBudget.total)
    || (hasLinkedBudget && paymentTotal > 0 ? paymentTotal : calculatedTotal || paymentTotal);
  const paymentMethod = firstText(payment.method, payment.paymentMethod, submission.paymentMethod);
  const paymentMethodKey = normalizeTextForMatch(paymentMethod);
  const isPixParcelado = paymentMethodKey.includes('pix') && (paymentMethodKey.includes('parcel') || paymentMethodKey.includes('entrada'));
  const isPixCash = paymentMethodKey === 'pix' || (paymentMethodKey.includes('pix') && !isPixParcelado);
  const rawEntry = toNumber(payment.entryValue ?? payment.entry);
  const rawBalance = toNumber(payment.balanceValue ?? payment.balance);
  const paymentEntry = isPixParcelado
    ? roundMoney(financialTotal * 0.3)
    : rawEntry > 0 && Math.abs(roundMoney(rawEntry + rawBalance) - financialTotal) <= 0.01
      ? rawEntry
      : isPixCash
        ? financialTotal
        : rawEntry;
  const paymentBalance = isPixParcelado
    ? roundMoney(financialTotal * 0.7)
    : rawEntry > 0 && Math.abs(roundMoney(rawEntry + rawBalance) - financialTotal) <= 0.01
      ? rawBalance
      : roundMoney(Math.max(0, financialTotal - paymentEntry));

  doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setDrawColor(226, 215, 190);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 7; i += 1) {
    doc.line(margin + i * 6, 10 + i * 0.55, 92 + i * 6, 2 + i * 0.55);
  }

  let logoLoaded = false;
  try {
    const logoImg = new Image();
    logoImg.src = '/logo.jpg';
    await new Promise((resolve) => {
      logoImg.onload = () => {
        doc.addImage(logoImg, 'JPEG', 132, 8, 48, 22);
        logoLoaded = true;
        resolve();
      };
      logoImg.onerror = () => resolve();
      setTimeout(resolve, 350);
    });
  } catch {
    // Text wordmark below is the fallback.
  }

  if (!logoLoaded) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(GOLD_DARK[0], GOLD_DARK[1], GOLD_DARK[2]);
    doc.text('MAYCLICK', 154, 20, { align: 'center' });
    doc.setFontSize(8);
    doc.setCharSpace(2.2);
    doc.text('PHOTOGRAPHY', 154, 27, { align: 'center' });
    doc.setCharSpace(0);
  }

  doc.setFontSize(17);
  doc.setTextColor(GOLD_DARK[0], GOLD_DARK[1], GOLD_DARK[2]);
  doc.text('FICHA TÉCNICA DE CADASTRO DE CLIENTE', pageWidth / 2, 38, { align: 'center' });
  drawTopRule(47);

  const stripY = 56;
  const stripH = 28;
  doc.setFillColor(BEIGE[0], BEIGE[1], BEIGE[2]);
  doc.roundedRect(margin, stripY, pageWidth - margin * 2, stripH, 2, 2, 'F');
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.roundedRect(margin, stripY, pageWidth - margin * 2, stripH, 2, 2, 'S');

  const stripCol = (pageWidth - margin * 2) / 3;
  doc.setDrawColor(190, 169, 125);
  doc.line(margin + stripCol, stripY + 5, margin + stripCol, stripY + stripH - 5);
  doc.line(margin + stripCol * 2, stripY + 5, margin + stripCol * 2, stripY + stripH - 5);

  const drawStripBlock = (title, value, x, valueSize = 9.5) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(GOLD_DARK[0], GOLD_DARK[1], GOLD_DARK[2]);
    doc.text(title, x, stripY + 8);
    doc.setFontSize(valueSize);
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    const lines = doc.splitTextToSize(safeText(value, 'A definir'), stripCol - 12);
    doc.text(lines.slice(0, 2), x, stripY + 18);
  };

  drawStripBlock('NOME DA CONTRATANTE', fullName, margin + 7, 8.8);
  drawStripBlock('DATA DO EVENTO', eventDate, margin + stripCol + 7, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(GOLD_DARK[0], GOLD_DARK[1], GOLD_DARK[2]);
  doc.text('HORÁRIO DO EVENTO', margin + stripCol * 2 + 7, stripY + 8);
  doc.setFontSize(8.2);
  doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
  doc.text('INÍCIO: ' + startTime, margin + stripCol * 2 + 7, stripY + 17);
  doc.text('TÉRMINO: ' + endTime, margin + stripCol * 2 + 7, stripY + 24);

  const eventY = 91;
  const eventH = 48;
  doc.setFillColor(BEIGE[0], BEIGE[1], BEIGE[2]);
  doc.rect(margin, eventY, pageWidth - margin * 2, eventH, 'F');
  drawSectionTitle('DADOS DO EVENTO', margin + 6, eventY + 10, pageWidth - margin * 2 - 12);

  let eyLeft = eventY + 21;
  let eyRight = eventY + 21;
  const halfW = (pageWidth - margin * 2 - 16) / 2;
  eyLeft = drawLabelValue('Tipo de evento', eventType, margin + 6, eyLeft, halfW, { labelWidth: 28, bold: true, size: 8.2 });
  eyLeft = drawLabelValue('Celebrante', celebrantsName, margin + 6, eyLeft, halfW, { labelWidth: 28, bold: true, size: 8.2 });
  eyLeft = drawLabelValue('Local', eventLocation, margin + 6, eyLeft, halfW, { labelWidth: 28, bold: true, size: 8.2 });
  eyRight = drawLabelValue('Endereço', eventAddress, margin + 8 + halfW, eyRight, halfW, { labelWidth: 26, bold: true, size: 8.2 });
  eyRight = drawLabelValue('Tema', event.theme, margin + 8 + halfW, eyRight, halfW, { labelWidth: 26, bold: true, size: 8.2 });
  eyRight = drawLabelValue('Convidados', guestCount, margin + 8 + halfW, eyRight, halfW, { labelWidth: 26, bold: true, size: 8.2 });

  const personalY = 149;
  const blockW = (pageWidth - margin * 2 - 8) / 2;
  drawSectionTitle('DADOS PESSOAIS', margin, personalY, blockW);
  drawSectionTitle('DADOS DE CONTATO', margin + blockW + 8, personalY, blockW);

  let py = personalY + 10;
  py = drawLabelValue('Nome completo', fullName, margin, py, blockW, { labelWidth: 27, bold: true });
  py = drawLabelValue('CPF', contractor.cpf, margin, py, blockW, { labelWidth: 27 });
  py = drawLabelValue('RG', contractor.rg, margin, py, blockW, { labelWidth: 27 });
  py = drawLabelValue('Nascimento', formatDate(contractor.birthDate, 'Não informado'), margin, py, blockW, { labelWidth: 27 });
  py = drawLabelValue('Estado civil', firstText(contractor.civilStatus, contractor.civil_status, contractor.maritalStatus), margin, py, blockW, { labelWidth: 27 });
  py = drawLabelValue('Profissão', firstText(contractor.profession, contractor.occupation, contractor.jobTitle), margin, py, blockW, { labelWidth: 27 });
  py = drawLabelValue('Endereço', residentialAddress, margin, py, blockW, { labelWidth: 27 });

  let cy = personalY + 10;
  const contactX = margin + blockW + 8;
  cy = drawLabelValue('WhatsApp', contractor.phone1, contactX, cy, blockW, { labelWidth: 28, bold: true });
  cy = drawLabelValue('Telefone 2', contractor.phone2, contactX, cy, blockW, { labelWidth: 28 });
  cy = drawLabelValue('E-mail', contractor.email, contactX, cy, blockW, { labelWidth: 28 });
  drawLabelValue('Instagram', contractor.instagram, contactX, cy, blockW, { labelWidth: 28 });

  const lowerY = 210;
  drawSectionTitle('PACOTE CONTRATADO', margin, lowerY, blockW);
  drawSectionTitle('OBSERVAÇÕES', contactX, lowerY, blockW);

  doc.setFillColor(BEIGE_LIGHT[0], BEIGE_LIGHT[1], BEIGE_LIGHT[2]);
  doc.roundedRect(margin, lowerY + 8, blockW, 21, 2, 2, 'F');
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.roundedRect(margin, lowerY + 8, blockW, 21, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
  doc.text(split('PACOTE: ' + packageInfo.name, blockW - 8), margin + 4, lowerY + 16);
  if (packagePrice > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    doc.text('Valor do pacote: ' + formatCurrency(packagePrice), margin + 4, lowerY + 22);
  }
  if (packageInfo.category) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text('Categoria: ' + packageInfo.category, margin + 4, lowerY + 26);
  }

  drawSectionTitle('CONDIÇÕES DE PAGAMENTO', margin, lowerY + 34, blockW);
  let payY = lowerY + 44;
  payY = drawMoneyRow('Valor total', formatCurrency(financialTotal), margin, payY, blockW, true);
  payY = drawMoneyRow('Entrada', formatCurrency(paymentEntry), margin, payY, blockW);
  payY = drawMoneyRow('Saldo restante', formatCurrency(paymentBalance), margin, payY, blockW);
  payY = drawLabelValue('Forma de pagamento', paymentMethod, margin, payY + 1, blockW, { labelWidth: 38, bold: true, size: 8.2 });
  payY = drawLabelValue('Parcelas', payment.installments, margin, payY, blockW, { labelWidth: 38, size: 8.2 });
  drawLabelValue('Datas de acerto', payment.dueDates || payment.paymentDates, margin, payY, blockW, { labelWidth: 38, size: 8.2 });

  const obsX = contactX;
  const obsY = lowerY + 9;
  doc.setFont('helvetica', notes ? 'bold' : 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
  if (notes) {
    doc.text(doc.splitTextToSize(notes, blockW - 4).slice(0, extras.length > 0 ? 4 : 8), obsX, obsY);
  }
  doc.setDrawColor(232, 226, 214);
  for (let i = 0; i < 9; i += 1) {
    const y = obsY + 7 + i * 5.5;
    doc.line(obsX, y, obsX + blockW, y);
  }

  if (extras.length > 0) {
    drawSectionTitle('ADICIONAIS CONTRATADOS', contactX, lowerY + 39, blockW);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4);
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    extras.slice(0, 3).forEach((extra, index) => {
      const rowY = lowerY + 49 + index * 6;
      doc.text(doc.splitTextToSize(extra.name, blockW - 30).slice(0, 1), contactX, rowY);
      doc.text(formatCurrency(extra.price), contactX + blockW, rowY, { align: 'right' });
    });
  }

  const footerY = 273;
  doc.setFillColor(BLACK[0], BLACK[1], BLACK[2]);
  doc.rect(0, footerY, pageWidth, pageHeight - footerY, 'F');
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.35);
  doc.line(0, footerY, pageWidth, footerY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text('Mayclick Photography', pageWidth / 2, footerY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.text('Instagram: @mayclick_fotos   |   WhatsApp: +55 11 96303-1814   |   Cidade: Mogi das Cruzes - SP', pageWidth / 2, footerY + 12, { align: 'center' });
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text('Nos permita registrar sua história!', pageWidth / 2, footerY + 17, { align: 'center' });
  doc.setTextColor(180, 180, 180);
  doc.text('MayClick Photography - Todos os direitos reservados.', pageWidth / 2, footerY + 22, { align: 'center' });

  if (extras.length > 3) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(GOLD_DARK[0], GOLD_DARK[1], GOLD_DARK[2]);
    doc.text('ADICIONAIS CONTRATADOS', margin, 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    let extraY = 36;
    extras.forEach((extra) => {
      if (extraY > 276) {
        doc.addPage();
        extraY = 24;
      }
      doc.text(extra.name, margin, extraY);
      doc.text(formatCurrency(extra.price), pageWidth - margin, extraY, { align: 'right' });
      extraY += 7;
    });
  }

  const pdfName = 'Ficha_Tecnica_Mayclick_' + sanitizeFileNamePart(fullName.split(' ')[0] || 'Cliente') + '.pdf';
  const pdfBlob = doc.output('blob');
  try {
    await saveGeneratedDocument({
      submissionId: submission.id,
      documentType: 'technical_sheet',
      file: pdfBlob,
      fileName: pdfName
    });
    doc.save(pdfName);
  } catch (error) {
    console.error('[PDF] Error saving ficha to server:', {
      status: error.status,
      endpoint: error.endpoint,
    });
    throw error;
  }
};
