import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, User, Calendar,
  MapPin, CreditCard, Plus, Trash, Save, Calculator,
  ChevronRight, Info, Check, PlusCircle, Percent
} from 'lucide-react';
import useSettings from '../hooks/useSettings';
import { getExtras, getPackages, createBudget, updateBudget } from '../lib/apiClient';
import { getLocalPackagesFallback, normalizePackage } from '../lib/packages';
import { generateContractPdf } from './ContractPdfGenerator';

const formatBRL = (value) => (
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
);

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;



const maskPhone = (value) => {
  if (!value) return '';
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 2) v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
  if (v.length > 9) v = `${v.substring(0, 10)}-${v.substring(10)}`;
  return v;
};

const normalizeDiscountType = (type) => (
  ['none', 'fixed', 'percentage'].includes(type) ? type : 'none'
);

const calculateBudgetTotals = ({ budget, packages, modalities }) => {
  const pkg = packages.find(p => p.id === budget.selectedPackageId);
  const packagePrice = toNumber(pkg?.price);
  const extrasTotal = budget.selectedModalities.reduce((acc, modId) => {
    const mod = modalities.find(m => m.id === modId);
    return acc + toNumber(mod?.price);
  }, 0);
  const extraHourMod = modalities.find(m => m.name.toLowerCase().includes('hora extra'));
  const extraHourPrice = extraHourMod ? toNumber(extraHourMod.price) : 190;
  const extraHoursTotal = toNumber(budget.extraHours) * extraHourPrice;
  const travelTotal = toNumber(budget.transportValue);
  const subtotal = roundMoney(packagePrice + extrasTotal + extraHoursTotal + travelTotal);
  const discountType = normalizeDiscountType(budget.discountType);
  const rawDiscountValue = Math.max(0, toNumber(budget.discountValue));
  const discountAmount = roundMoney(
    discountType === 'fixed'
      ? Math.min(rawDiscountValue, subtotal)
      : discountType === 'percentage'
        ? subtotal * (Math.min(rawDiscountValue, 100) / 100)
        : 0
  );
  const total = roundMoney(Math.max(0, subtotal - discountAmount));

  return {
    packagePrice,
    extrasTotal: roundMoney(extrasTotal),
    extraHourPrice,
    extraHoursTotal: roundMoney(extraHoursTotal),
    travelTotal,
    subtotal,
    discountType,
    discountValue: rawDiscountValue,
    discountAmount,
    total,
  };
};

const ManualBudget = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();
  const pricing = businessSettings?.pricing || {};
  const [packages, setPackages] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [errorNotice, setErrorNotice] = useState('');
  const [packageSource, setPackageSource] = useState('api');
  const [extrasSource, setExtrasSource] = useState('api');
  const packageCategories = [...new Set(packages.map(pkg => pkg.category).filter(Boolean))];
  const isUsingFallbackData = packageSource !== 'api' || extrasSource !== 'api';

  useEffect(() => {
    fetchPackages();
    fetchExtras();
  }, []);

  const fetchPackages = async () => {
    setPackageSource('api');
    try {
      const data = await getPackages();
      setPackages((Array.isArray(data) ? data : []).map(normalizePackage).filter(pkg => pkg.active));
    } catch (error) {
      console.error('[ManualBudget] Error fetching packages:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
      });
      setPackageSource('fallback');
      setPackages(getLocalPackagesFallback().filter(pkg => pkg.active));
      setErrorNotice('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
    }
  };

  const fetchExtras = async () => {
    setExtrasSource('api');
    try {
      const data = await getExtras();
      setModalities(data.filter(ex => ex.active));
    } catch (error) {
      console.error('[ManualBudget] Error fetching extras:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
      });
      setExtrasSource('fallback');
      setModalities(pricing.modalities || []);
      setErrorNotice('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
    }
  };

  const [budget, setBudget] = useState({
    client: { name: '', phone: '', email: '', address: '' },
    event: { type: 'infantil', date: '', address: '' },
    selectedPackageId: '',
    selectedModalities: [],
    transportValue: 0,
    extraHours: 0,
    discountType: 'none',
    discountValue: '',
    discountAmount: 0,
    subtotal: 0,
    total: 0,
    paymentMethod: 'Pix',
    initialSettlementDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    finalSettlementDate: ''
  });

  const [activeCategory, setActiveCategory] = useState('infantil');

  // Recalculate total
  useEffect(() => {
    const totals = calculateBudgetTotals({ budget, packages, modalities });

    setBudget(prev => {
      if (
        prev.total === totals.total
        && prev.subtotal === totals.subtotal
        && prev.discountAmount === totals.discountAmount
      ) {
        return prev;
      }

      return {
        ...prev,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        total: totals.total,
      };
    });
  }, [
    budget.selectedPackageId,
    budget.selectedModalities,
    budget.transportValue,
    budget.extraHours,
    budget.discountType,
    budget.discountValue,
    packages,
    modalities
  ]);

  const handleToggleModality = (id) => {
    setBudget(prev => {
      const exists = prev.selectedModalities.includes(id);
      return {
        ...prev,
        selectedModalities: exists
          ? prev.selectedModalities.filter(m => m !== id)
          : [...prev.selectedModalities, id]
      };
    });
  };

  const [saving, setSaving] = useState(false);
  const [savedBudgetId, setSavedBudgetId] = useState(null);
  const [savedBudgetNumber, setSavedBudgetNumber] = useState(null);

  const handleSaveBudget = async (isSilent = false) => {
    if (isUsingFallbackData) {
      const message = 'Dados locais temporários. Não é possível salvar até reconectar ao servidor.';
      if (!isSilent) alert(message);
      return null;
    }

    if (!budget.selectedPackageId || !budget.client.name) {
      if (!isSilent) alert('Por favor, preencha o nome do cliente e escolha um pacote.');
      return null;
    }

    setSaving(true);
    try {
      const pkg = packages.find(p => p.id === budget.selectedPackageId);
      const totals = calculateBudgetTotals({ budget, packages, modalities });
      const transportOption = (businessSettings?.pricing?.transport || []).find(t => Number(t.price) === toNumber(budget.transportValue));
        const travelLabel = transportOption ? transportOption.name : 'Deslocamento';

        const budgetData = {
          client_name: budget.client.name,
          client_phone: budget.client.phone,
          client_email: budget.client.email,
          event_type: budget.event.type,
          event_date: budget.event.date,
          event_location: budget.event.address,
          selected_package_id: budget.selectedPackageId,
          selected_package_name: pkg?.name,
          package_price: Number(pkg?.price || 0),
          package_data: pkg || {},
          extras_data: budget.selectedModalities.map(id => modalities.find(m => m.id === id)).filter(Boolean),
          travel_data: {
            label: travelLabel,
            amount: totals.travelTotal,
            value: totals.travelTotal,
            extraHours: toNumber(budget.extraHours),
            extraHourPrice: totals.extraHourPrice,
          },
        discount_data: {
          type: totals.discountType,
          value: totals.discountType === 'none' ? 0 : totals.discountValue,
          amount: totals.discountAmount,
        },
        payment_data: {
          method: budget.paymentMethod,
          totalValue: totals.total.toString()
        },
        subtotal: totals.subtotal,
        total: totals.total,
        status: savedBudgetId ? undefined : 'draft' // keep existing status or set draft
      };

      let result;
      if (savedBudgetId) {
        result = await updateBudget(savedBudgetId, budgetData);
      } else {
        result = await createBudget({ ...budgetData, source_type: 'manual' });
      }

      if (result?.id) {
        setSavedBudgetId(result.id);
      }
      if (result?.budget_number) {
        setSavedBudgetNumber(result.budget_number);
      }

      if (!isSilent) alert('Orçamento salvo com sucesso!');
      return result;
    } catch (error) {
      const errorMsg = error.message || 'Erro desconhecido';
      console.error('[ManualBudget] Error saving budget:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
        details: error.details,
        selectedPackageId: budget.selectedPackageId,
      });
      if (!isSilent) alert(`Erro ao salvar orçamento: ${errorMsg}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (isUsingFallbackData) {
      alert('Dados locais temporários. Não é possível gerar PDF até salvar o orçamento no servidor.');
      return;
    }

    const saved = await handleSaveBudget(true);
    if (!saved && !savedBudgetId) {
      alert('Nao foi possivel salvar o orcamento no sistema. O PDF nao sera gerado sem um numero real do banco.');
      return;
    }

    const selectedPackage = packages.find((pkg) => pkg.id === budget.selectedPackageId) || null;
    const totals = calculateBudgetTotals({ budget, packages, modalities });
    const bId = saved?.id || savedBudgetId;
    const bNum = saved?.budget_number || savedBudgetNumber;

    if (!bId || !bNum) {
      alert('O servidor nao retornou id e numero real do orcamento. O PDF nao sera gerado.');
      return;
    }

    const transportOption = (businessSettings?.pricing?.transport || []).find(t => Number(t.price) === toNumber(budget.transportValue));
    const travelLabel = transportOption ? transportOption.name : 'Deslocamento';

    const submissionMock = {
      id: bId,
      budget_number: bNum,
      createdAt: new Date().toISOString(),
      contractor: {
        fullName: budget.client.name,
        phone1: budget.client.phone,
        email: budget.client.email,
        address: budget.client.address
      },
      event: {
        celebrantsName: budget.client.name,
        date: budget.event.date,
        address: budget.event.address,
        startTime: '10:00',
        endTime: '14:00'
      },
      selectedPackageId: budget.selectedPackageId,
      package: selectedPackage,
      extras: budget.selectedModalities.map(id => modalities.find(m => m.id === id)).filter(Boolean),
      extraHoursCount: budget.extraHours,
      extraHourPrice: totals.extraHourPrice,
      transportValue: totals.travelTotal,
      transportLabel: travelLabel,
      subtotal: totals.subtotal,
      totalValue: totals.total,
      discountData: {
        type: totals.discountType,
        value: totals.discountType === 'none' ? 0 : totals.discountValue,
        amount: totals.discountAmount,
      },
      discountValue: totals.discountAmount,
      paymentMethod: budget.paymentMethod,
      contractualConsent: true,
      importantNotes: `Orçamento Manual - Valor Transporte: ${totals.travelTotal}, Horas Extras: ${toNumber(budget.extraHours)}, Desconto: ${totals.discountAmount}`
    };

    try {
      await generateContractPdf({
        submission: submissionMock,
        budgetId: bId,
        businessSettings
      });

      // Update status to 'generated' if it was 'draft'
      if (saved || savedBudgetId) {
        await updateBudget(bId, { status: 'generated' });
      }

      alert('PDF gerado com sucesso!');
      navigate('/app/orcamentos');
    } catch (err) {
      console.error('[ManualBudget] Error generating PDF:', {
        status: err.status,
        endpoint: err.endpoint,
        message: err.message,
        details: err.details,
      });
      if (err.pdfGenerated && err.endpoint === '/admin/documents') {
        alert('PDF gerado, mas não foi possível salvar em Documentos Gerados.');
        return;
      }
      alert('Não foi possível gerar e salvar o PDF no sistema. Verifique a conexão com o servidor.');
    }
  };

  const currentTotals = calculateBudgetTotals({ budget, packages, modalities });

  return (
    <div className="manual-budget-content fade-in">
      <header className="page-header mb-4">
        <span className="badge badge-accent mb-1">Painel Administrativo</span>
        <h1>Novo Orçamento Manual</h1>
        <p className="text-muted">Monte um orçamento personalizado para seu cliente de forma rápida.</p>

        {errorNotice && (
          <div className="alert alert-warning mt-4 flex items-center gap-3">
            <Info size={20} className="text-amber-600" />
            <div>
              <p className="font-bold text-amber-900">Aviso de Sincronização</p>
              <p className="text-sm text-amber-800">{errorNotice}</p>
            </div>
          </div>
        )}
      </header>

      <div className="budget-builder-layout">
        <div className="form-column">

          {/* CLIENT DATA */}
          <section className="card mb-4">
            <h2 className="section-title"><User size={20} className="text-accent" /> Dados do Cliente</h2>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Nome do Cliente</label>
                <input
                  className="form-control"
                  placeholder="Nome completo"
                  value={budget.client.name}
                  onChange={e => setBudget({...budget, client: {...budget.client, name: e.target.value}})}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input
                  className="form-control"
                  placeholder="(00) 00000-0000"
                  value={budget.client.phone}
                  onChange={e => setBudget({...budget, client: {...budget.client, phone: maskPhone(e.target.value)}})}
                />
              </div>
            </div>
            <div className="form-group mb-0">
              <label>E-mail</label>
              <input
                className="form-control"
                placeholder="cliente@email.com"
                value={budget.client.email}
                onChange={e => setBudget({...budget, client: {...budget.client, email: e.target.value}})}
              />
            </div>
          </section>

          <section className="card mb-4">
            <h2 className="section-title"><MapPin size={20} className="text-accent" /> Dados do Evento</h2>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Local da festa</label>
                <input
                  className="form-control"
                  placeholder="Nome do local, salão ou endereço"
                  value={budget.event.address}
                  onChange={e => setBudget({ ...budget, event: { ...budget.event, address: e.target.value } })}
                />
              </div>
              <div className="form-group">
                <label>Data da festa</label>
                <input
                  type="date"
                  className="form-control"
                  value={budget.event.date}
                  onChange={e => setBudget({ ...budget, event: { ...budget.event, date: e.target.value } })}
                />
              </div>
            </div>
          </section>

          {/* PACKAGE SELECTION */}
          <section className="card mb-4">
            <h2 className="section-title"><Calendar size={20} className="text-accent" /> Escolha o Pacote</h2>

            <div className="category-nav mb-4">
              {(packageCategories.length ? packageCategories : ['infantil', 'debutante', 'casamento']).map(cat => (
                <button
                  key={cat}
                  className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mini-pkg-grid">
              {packages.filter(p => p.category === activeCategory).map(pkg => (
                <div
                  key={pkg.id}
                  className={`mini-pkg-card ${budget.selectedPackageId === pkg.id ? 'selected' : ''} ${isUsingFallbackData ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!isUsingFallbackData) setBudget({...budget, selectedPackageId: pkg.id});
                  }}
                >
                  <div className="mini-pkg-header">
                    <span className="mini-pkg-name">{pkg.name}</span>
                    {budget.selectedPackageId === pkg.id && <Check size={14} className="mini-pkg-check" />}
                  </div>
                  <div className="mini-pkg-price">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pkg.price)}
                  </div>
                </div>
              ))}
            </div>
            {packages.filter(p => p.category === activeCategory).length === 0 && (
              <p className="text-center text-muted p-4">Nenhum pacote cadastrado nesta categoria.</p>
            )}

            {/* EXTRAS SELECTION */}
            <section className="card mb-4">
              <h2 className="section-title"><PlusCircle size={20} className="text-accent" /> Extras e Ajustes</h2>
              <p className="text-sm text-muted mb-4">Adicione serviços adicionais ao orçamento.</p>

              <div className="mods-grid">
                {modalities.filter(m => !m.name.toLowerCase().includes('hora extra')).map(mod => (
                  <label key={mod.id} className={`mod-item ${budget.selectedModalities.includes(mod.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={budget.selectedModalities.includes(mod.id)}
                      disabled={isUsingFallbackData}
                      onChange={() => handleToggleModality(mod.id)}
                    />
                    <div className="mod-info">
                      <span className="mod-name">{mod.name}</span>
                      <span className="mod-price">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mod.price)}
                      </span>
                    </div>
                    {budget.selectedModalities.includes(mod.id) && <Check size={16} className="text-accent" />}
                  </label>
                ))}
              </div>

              <div className="extra-hours-selector mt-6 p-4 bg-page rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">Horas Extras</h4>
                    <p className="text-xs text-muted">Acréscimo por hora adicional de cobertura.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(modalities.find(m => m.name.toLowerCase().includes('hora extra'))?.price || 190)}
                      </span>
                      <span className="text-xs text-muted">por hora</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      style={{ width: '80px' }}
                      value={budget.extraHours}
                      disabled={isUsingFallbackData}
                      onChange={e => setBudget({...budget, extraHours: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* TRAVEL */}
            <section className="card mb-4">
              <h2 className="section-title"><MapPin size={20} className="text-accent" /> Deslocamento</h2>
              <div className="travel-options-grid">
                {(businessSettings?.pricing?.transport || []).map((option) => (
                  <button
                    key={option.id || option.name}
                    type="button"
                    className={`travel-option ${toNumber(budget.transportValue) === Number(option.price) ? 'selected' : ''}`}
                    onClick={() => setBudget({ ...budget, transportValue: option.price })}
                  >
                    <span className="travel-option-label" aria-label={option.name}>
                      {option.name.toUpperCase()}
                    </span>
                    <strong>{formatBRL(option.price)}</strong>
                  </button>
                ))}
              </div>
            </section>

            {/* DISCOUNT */}
            <section className="card mb-4">
              <h2 className="section-title"><Percent size={20} className="text-accent" /> Desconto</h2>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Tipo de desconto</label>
                  <select
                    className="form-control"
                    value={budget.discountType}
                    onChange={e => setBudget({
                      ...budget,
                      discountType: e.target.value,
                      discountValue: e.target.value === 'none' ? '' : budget.discountValue
                    })}
                  >
                    <option value="none">Sem desconto</option>
                    <option value="fixed">Desconto em R$</option>
                    <option value="percentage">Desconto em %</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Valor do desconto</label>
                  <input
                    type="number"
                    min="0"
                    max={budget.discountType === 'percentage' ? '100' : undefined}
                    step={budget.discountType === 'percentage' ? '0.01' : '1'}
                    className="form-control"
                    placeholder={budget.discountType === 'percentage' ? '5' : '112'}
                    value={budget.discountValue}
                    disabled={budget.discountType === 'none'}
                    onChange={e => setBudget({ ...budget, discountValue: e.target.value })}
                  />
                </div>
              </div>
              {currentTotals.discountAmount > 0 && (
                <div className="discount-preview">
                  <span>Desconto aplicado</span>
                  <strong>- {formatBRL(currentTotals.discountAmount)}</strong>
                </div>
              )}
            </section>

            {/* PAYMENT SELECTION */}
            <section className="card mb-4">
              <h2 className="section-title"><CreditCard size={20} className="text-accent" /> Condições de Pagamento</h2>

              {/* Top Values Summary */}
              <div className="payment-summary-mini grid grid-3 mb-6">
                <div className="mini-val-card">
                  <span className="mini-label">Total</span>
                  <span className="mini-amount">R$ {budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className={`mini-val-card ${budget.paymentMethod === 'Pix' ? 'highlighted' : ''}`}>
                  <span className="mini-label">Entrada / Pix</span>
                  <span className="mini-amount">R$ {(budget.paymentMethod === 'Pix' ? budget.total : budget.paymentMethod === 'Parcelado via Pix' ? budget.total * 0.3 : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mini-val-card">
                  <span className="mini-label">Saldo</span>
                  <span className="mini-amount">R$ {(budget.paymentMethod === 'Pix' ? 0 : budget.paymentMethod === 'Parcelado via Pix' ? budget.total * 0.7 : budget.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="payment-methods-grid-modern mb-6">
                {[
                  { id: 'Pix', label: 'PIX', sub: 'À vista (-5%)' },
                  { id: 'Parcelado via Pix', label: 'PIX PARCELADO', sub: '30% entrada' },
                  { id: 'Parcelado via cartão de crédito', label: 'CARTÃO', sub: 'No ato' }
                ].map(opt => (
                  <div
                    key={opt.id}
                    className={`method-btn-modern ${budget.paymentMethod === opt.id ? 'selected' : ''}`}
                    onClick={() => setBudget({...budget, paymentMethod: opt.id})}
                  >
                    <span className="method-btn-title">{opt.label}</span>
                    <span className="method-btn-sub">{opt.sub}</span>
                  </div>
                ))}
              </div>

              {budget.paymentMethod === 'Parcelado via Pix' && (
                <div className="payment-extra-fields fade-in">
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Acerto Inicial (30%)</label>
                      <div className="readonly-box">
                        <Calendar size={16} />
                        <span>Vencimento: {new Date(budget.initialSettlementDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Acerto Final (70%)</label>
                      <div className="input-with-icon">
                        <Calendar size={18} className="input-icon" />
                        <input
                          type="date"
                          className="form-control"
                          value={budget.finalSettlementDate}
                          onChange={e => setBudget({...budget, finalSettlementDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </section>
        </div>

        {/* SUMMARY COLUMN */}
        <aside className="summary-column">
          <div className="card sticky-summary">
            <h2 className="section-title"><Calculator size={20} className="text-accent" /> Resumo Final</h2>

            <div className="summary-body">
              <div className="summary-row">
                <span>Pacote Base:</span>
                <span className="font-bold">
                  {packages.find(p => p.id === budget.selectedPackageId)?.price
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(packages.find(p => p.id === budget.selectedPackageId).price)
                    : 'R$ 0,00'}
                </span>
              </div>

              <div className="summary-row">
                <span>Extras ({budget.selectedModalities.length}):</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    budget.selectedModalities.reduce((acc, id) => acc + (modalities.find(m => m.id === id)?.price || 0), 0)
                  )}
                </span>
              </div>

              <div className="summary-row">
                <span>Deslocamento ida e volta:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.transportValue || 0)}</span>
              </div>

              <div className="summary-row">
                <span>Horas Extras:</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    (budget.extraHours || 0) * (modalities.find(m => m.name.toLowerCase().includes('hora extra'))?.price || 190)
                  )}
                </span>
              </div>

              <div className="summary-row">
                <span>Subtotal:</span>
                <span className="font-bold">{formatBRL(currentTotals.subtotal)}</span>
              </div>

              {currentTotals.discountAmount > 0 && (
                <div className="summary-row text-error">
                  <span>Desconto:</span>
                  <span>-{formatBRL(currentTotals.discountAmount)}</span>
                </div>
              )}

              <div className="summary-total-block mt-4">
                <span className="total-label">VALOR TOTAL DO ORÇAMENTO</span>
                <span className="total-amount">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.total)}
                </span>
              </div>
            </div>

            <div className="budget-actions mt-4">
              <button
                className="btn btn-outline btn-full btn-lg mb-3"
                onClick={() => handleSaveBudget(false)}
                disabled={saving || isUsingFallbackData || !budget.selectedPackageId || !budget.client.name}
              >
                <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Orçamento'}
              </button>

              <button
                className="btn btn-accent btn-full btn-lg"
                onClick={handleGeneratePdf}
                disabled={saving || isUsingFallbackData || !budget.selectedPackageId || !budget.client.name}
              >
                <FileText size={20} /> Gerar PDF do Orçamento
              </button>
            </div>
            <p className="text-center text-sm text-muted mt-4">
              <Info size={14} /> O PDF será gerado com o papel timbrado da Mayclick.
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        .budget-builder-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2.5rem;
          align-items: start;
        }

        .category-nav {
          display: flex;
          gap: 0.625rem;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .cat-tab {
          background: none;
          border: none;
          padding: 0.625rem 1.25rem;
          cursor: pointer;
          color: var(--text-muted);
          font-weight: 800;
          font-size: 0.8125rem;
          text-transform: uppercase;
          transition: var(--transition);
          border-radius: var(--radius-sm);
          letter-spacing: 0.05em;
        }

        .cat-tab.active {
          color: var(--accent);
          background-color: var(--accent-light);
        }

        .mini-pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .mini-pkg-card {
          padding: 1.25rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
          background-color: var(--bg-page);
        }

        .mini-pkg-card:hover {
          border-color: var(--accent);
          background-color: #fff;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .mini-pkg-card.selected {
          border-color: var(--accent);
          background-color: #fff;
          box-shadow: 0 0 0 1px var(--accent), var(--shadow-md);
        }

        .mini-pkg-card.disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .mini-pkg-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .mini-pkg-name {
          font-weight: 700;
          font-size: 0.9375rem;
          line-height: 1.3;
          color: var(--primary);
        }

        .mini-pkg-check {
          color: var(--accent);
        }

        .mini-pkg-price {
          font-weight: 800;
          color: var(--accent);
          font-size: 1.125rem;
        }

        /* Mods Grid */
        .mods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }

        .mod-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
          background-color: var(--bg-page);
        }

        .mod-item input { display: none; }

        .mod-item:hover {
          border-color: var(--accent);
          background-color: #fff;
        }

        .mod-item.selected {
          border-color: var(--accent);
          background-color: #fff;
          box-shadow: 0 0 0 1px var(--accent);
        }

        .mod-info { flex: 1; display: flex; flex-direction: column; }
        .mod-name { font-weight: 700; font-size: 0.9375rem; color: var(--primary); }
        .mod-price { font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px; }

        /* Summary */
        .sticky-summary {
          position: sticky;
          top: 110px;
          border: 2px solid var(--border);
          padding: 3rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 1rem;
          color: var(--text-main);
        }

        .summary-total-block {
          background-color: var(--primary);
          color: #fff;
          padding: 2rem 1.5rem;
          border-radius: var(--radius-sm);
          text-align: center;
          margin: 2rem -1rem 0 -1rem;
          box-shadow: var(--shadow-lg);
        }

        .total-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.6;
          margin-bottom: 0.75rem;
          font-weight: 800;
        }

        .total-amount {
          font-size: 2.25rem;
          font-weight: 800;
          display: block;
          letter-spacing: -0.02em;
        }

        .text-error { color: var(--error); }

        .payment-summary-mini { gap: 0.75rem; }
        .mini-val-card {
          background-color: var(--bg-page);
          border: 1px solid var(--border);
          padding: 1rem;
          border-radius: var(--radius-sm);
          text-align: center;
        }
        .mini-val-card.highlighted { border-color: var(--accent); background-color: #fff; }
        .mini-label { display: block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px; }
        .mini-amount { font-size: 1rem; font-weight: 800; color: var(--primary); }
        .highlighted .mini-amount { color: var(--accent); }
        .discount-tag-mini { display: block; font-size: 0.6rem; color: #10b981; font-weight: 800; text-transform: uppercase; margin-top: 2px; }

        .travel-options-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .travel-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          min-height: 92px;
          min-width: 0;
          padding: 0.875rem 0.65rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background-color: var(--bg-page);
          color: var(--primary);
          cursor: pointer;
          text-align: center;
          transition: var(--transition);
          font-family: inherit;
        }

        .travel-option:hover {
          border-color: var(--accent);
          background-color: #fff;
        }

        .travel-option.selected {
          border-color: var(--accent);
          background-color: var(--accent-light);
          box-shadow: 0 0 0 1px var(--accent);
        }

        .travel-option-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.1rem;
          max-width: 100%;
          font-size: 0.8125rem;
          line-height: 1.12;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0;
          white-space: normal;
          word-break: normal;
          overflow-wrap: normal;
        }

        .travel-option strong {
          display: block;
          max-width: 100%;
          font-size: 1rem;
          line-height: 1.15;
          color: var(--primary);
          white-space: nowrap;
        }

        .discount-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background-color: var(--bg-page);
          color: var(--primary);
          font-weight: 700;
        }
        .discount-preview strong { color: var(--error); }

        .readonly-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: var(--bg-page);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: var(--text-main);
          font-weight: 600;
        }
        .readonly-box svg { color: var(--accent); }

        .payment-methods-grid-modern {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .method-btn-modern {
          padding: 1rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          text-align: center;
          transition: var(--transition);
          background-color: var(--bg-page);
        }

        .method-btn-modern:hover { border-color: var(--accent); }
        .method-btn-modern.selected { border-color: var(--accent); background-color: var(--accent-light); box-shadow: 0 0 0 1px var(--accent); }
        .method-btn-title { display: block; font-weight: 800; font-size: 0.8125rem; color: var(--primary); }
        .method-btn-sub { display: block; font-size: 0.65rem; color: var(--text-muted); margin-top: 1px; }

        @media (max-width: 992px) {
          .budget-builder-layout { grid-template-columns: 1fr; }
          .summary-column { order: 1; }
          .sticky-summary { position: relative; top: 0; }
          .travel-options-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 768px) {
          .payment-methods-grid-modern { grid-template-columns: 1fr; }
          .category-nav { flex-wrap: wrap; }
          .extra-hours-selector .flex { flex-direction: column; align-items: stretch; gap: 1rem; }
          .extra-hours-selector .flex > div:last-child { justify-content: space-between; width: 100%; }
        }

        @media (max-width: 520px) {
          .travel-options-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .travel-option { min-height: 88px; }
        }

        @media (max-width: 360px) {
          .travel-options-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ManualBudget;
