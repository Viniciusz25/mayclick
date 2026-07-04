import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Camera, ArrowLeft, User, Calendar,
  Package, CreditCard, Send, CheckCircle,
  Info, MapPin, AtSign, Phone, Star,
  ClipboardCheck, Clock, X, Check, PlusCircle
} from 'lucide-react';
import { createPublicSubmission, getPublicExtras, getPublicPackages } from '../lib/apiClient';
import { pricingData } from '../data/pricing';
import { normalizePackage, featureToDisplayText, safeArray, safeText } from '../lib/packages';
import PublicFooter from './PublicFooter';
import CookieBanner from './CookieBanner';

const PublicForm = () => {
  const navigate = useNavigate();
  const fallbackPackages = pricingData.packages || [];
  const [packages, setPackages] = useState([]);
  const [extras, setExtras] = useState([]);
  const [packagesNotice, setPackagesNotice] = useState('');
  const [extrasNotice, setExtrasNotice] = useState('');
  const [packagesSource, setPackagesSource] = useState('api');
  const [extrasSource, setExtrasSource] = useState('api');

  const [formData, setFormData] = useState({
    contractor: {
      fullName: '',
      cpf: '',
      rg: '',
      birthDate: '',
      civilStatus: '',
      profession: '',
      address: {
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
      },
      phone1: '',
      phone2: '',
      email: '',
    },
    witness: {
      name: '',
      cpf: ''
    },
    event: {
      type: '',
      celebrantsName: '',
      age: '',
      locationName: '',
      address: '',
      guestCount: '',
      date: '',
      startTime: '',
      endTime: '',
      instagram: '',
      theme: ''
    },
    selectedPackageId: '',
    selectedExtras: [],
    extraHours: 0,
    payment: {
      method: '',
      details: '',
      total: 0,
      installments: 1
    },
    observations: '',
    contractualConsent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalPackage, setModalPackage] = useState(null);
  const safeModalPackage = modalPackage ? normalizePackage(modalPackage) : null;
  const modalFeatures = safeArray(safeModalPackage?.features);
  const modalComparisonItems = safeArray(safeModalPackage?.comparison_items);
  const modalDescription = safeText(safeModalPackage?.description).trim();
  const modalCoverageSummary = [
    safeModalPackage?.coverage_time,
    safeModalPackage?.team,
  ].map(safeText).filter(Boolean).join(' ┬À ');
  const selectedPackage = packages.find((pkg) => pkg.id === formData.selectedPackageId);
  const packageBaseValue = Number(selectedPackage?.price || 0);
  const isExtraHour = (extra) => String(extra?.name || '').toLowerCase().includes('hora extra');
  const extraHourOption = extras.find(isExtraHour);
  const selectableExtras = extras.filter((extra) => !isExtraHour(extra));
  const selectedExtrasData = selectableExtras
    .filter((extra) => formData.selectedExtras.includes(extra.id))
    .map((extra) => ({
      id: extra.id,
      name: extra.name,
      description: extra.description || '',
      price: Number(extra.price || 0),
      quantity: 1,
      total: Number(extra.price || 0),
    }));
  const extraHoursQuantity = Math.max(0, Number(formData.extraHours || 0));
  const extraHourData = extraHourOption && extraHoursQuantity > 0
    ? [{
        id: extraHourOption.id,
        name: extraHourOption.name,
        description: extraHourOption.description || '',
        price: Number(extraHourOption.price || 0),
        quantity: extraHoursQuantity,
        total: Number(extraHourOption.price || 0) * extraHoursQuantity,
      }]
    : [];
  const selectedExtrasPayload = [...selectedExtrasData, ...extraHourData];
  const extrasTotal = selectedExtrasPayload.reduce((acc, extra) => acc + Number(extra.total || 0), 0);
  const packageValue = packageBaseValue + extrasTotal;
  const isPixCash = formData.payment.method === 'pix';
  const pixDiscountValue = isPixCash ? packageValue * 0.05 : 0;
  const finalPaymentValue = Math.max(0, packageValue - pixDiscountValue);
  const pixInstallmentEntry = packageValue * 0.3;
  const pixInstallmentBalance = packageValue * 0.7;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getPublicPackages();
        setPackages((Array.isArray(data) ? data : []).map(normalizePackage));
        setPackagesSource('api');
        setPackagesNotice('');
      } catch (error) {
        console.error('[PublicForm] Error fetching packages:', {
          status: error.status,
          endpoint: error.endpoint,
        });
        setPackages(fallbackPackages.map(normalizePackage));
        setPackagesSource('fallback');
        setPackagesNotice('Dados locais temporários. Não é possível enviar até reconectar ao servidor.');
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const data = await getPublicExtras();
        setExtras(Array.isArray(data) ? data : []);
        setExtrasSource('api');
        setExtrasNotice('');
      } catch (error) {
        console.error('[PublicForm] Error fetching extras:', {
          status: error.status,
          endpoint: error.endpoint,
        });
        setExtras([]);
        setExtrasSource('fallback');
        setExtrasNotice('Extras temporariamente indisponíveis. Tente novamente em instantes.');
      }
    };

    fetchExtras();
  }, []);

  // Auto-calculate total when package/extras change
  useEffect(() => {
    setFormData(prev => {
      if (Number(prev.payment.total || 0) === packageValue) return prev;
      return {
        ...prev,
        payment: { ...prev.payment, total: packageValue }
      };
    });
  }, [packageValue]);

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contractor: {
        ...prev.contractor,
        address: {
          ...prev.contractor.address,
          [field]: value
        }
      }
    }));
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            contractor: {
              ...prev.contractor,
              address: {
                ...prev.contractor.address,
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || ''
              }
            }
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      }
    }
  };

  const handlePaymentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
  };

  const handleToggleExtra = (extraId) => {
    setFormData(prev => {
      const exists = prev.selectedExtras.includes(extraId);
      return {
        ...prev,
        selectedExtras: exists
          ? prev.selectedExtras.filter(id => id !== extraId)
          : [...prev.selectedExtras, extraId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingWitnessFields = [
      !formData.witness.name.trim() ? 'nome da testemunha' : null,
      !formData.witness.cpf.trim() ? 'CPF da testemunha' : null,
    ].filter(Boolean);

    if (missingWitnessFields.length > 0) {
      alert(`Por favor, preencha ${missingWitnessFields.join(', ')}.`);
      return;
    }

    if (!formData.selectedPackageId) {
      alert("Por favor, selecione um pacote contratado.");
      return;
    }
    if (packagesSource !== 'api') {
      alert('Dados locais temporários. Não é possível enviar até reconectar ao servidor.');
      return;
    }
    if (!formData.payment.method) {
      alert("Por favor, selecione uma forma de pagamento.");
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        ...formData.event,
        type: formData.event.type || selectedPackage?.category || '',
        selectedExtras: selectedExtrasPayload,
      };
      const paymentData = {
        ...formData.payment,
        baseValue: packageValue,
        discountValue: pixDiscountValue,
        totalValue: finalPaymentValue,
        entryValue: formData.payment.method === 'pix_parcelado' ? pixInstallmentEntry : finalPaymentValue,
        balanceValue: formData.payment.method === 'pix_parcelado' ? pixInstallmentBalance : 0,
      };
      const payload = {
        contractor_data: formData.contractor,
        witness_data: formData.witness,
        event_data: eventData,
        selected_package_id: formData.selectedPackageId,
        selected_package_name: selectedPackage?.name || '',
        payment: paymentData,
        payment_method: formData.payment.method,
        contractual_consent: formData.contractualConsent,
        important_notes: formData.observations,
        observations: formData.observations,
        extras_data: selectedExtrasPayload,
        contractor: formData.contractor,
        witness: formData.witness,
        event: eventData,
        extras: selectedExtrasPayload,
        selectedPackageId: formData.selectedPackageId,
        contractualConsent: formData.contractualConsent,
      };
      await createPublicSubmission(payload);
      alert("Cadastro enviado com sucesso! Entraremos em contato em breve.");
      navigate('/obrigado');
    } catch (error) {
      console.error('[PublicForm] Submission failed', {
        status: error.status,
        endpoint: error.endpoint,
        selectedPackageId: formData.selectedPackageId,
      });

      alert("Erro ao enviar o formulário. Por favor, tente novamente ou entre em contato via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = [...new Set(packages.map(p => p.category))].filter(Boolean);
  const getCategoryLabel = (c) => {
    if (c === 'infantil') return '👶 Infantil';
    if (c === 'adulto') return '🧑 Adulto';
    if (c === 'debutante') return '👑 Debutante';
    if (c === 'casamento') return '💍 Casamento';
    return c.charAt(0).toUpperCase() + c.slice(1);
  };

  return (
    <div className="public-form-page">
      <CookieBanner />

      <header className="form-header">
        <div className="container header-inner">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Voltar ao Início
          </button>
          <div className="brand">
            <img src="/logo.jpg" alt="Logo" className="brand-logo" />
            <span className="brand-name">Mayclick</span>
          </div>
        </div>
      </header>

      <main className="form-content">
        <div className="container-narrow fade-in">
          <div className="form-intro text-center mb-4">
            <span className="badge badge-accent mb-1">Ficha Técnica</span>
            <h1>Cadastro de Cliente</h1>
            <p className="text-muted">
              Preencha as informações abaixo para a elaboração do seu contrato e organização do evento.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* SEÇÃO 1: CONTRATANTE */}
            <section className="form-card-block">
              <h2 className="section-title"><User size={22} className="text-accent" /> 1. Dados do Contratante</h2>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  required
                  className="form-control"
                  placeholder="Seu nome completo"
                  value={formData.contractor.fullName}
                  onChange={(e) => handleChange('contractor', 'fullName', e.target.value)}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>CPF *</label>
                  <input
                    required
                    className="form-control"
                    placeholder="000.000.000-00"
                    value={formData.contractor.cpf}
                    onChange={(e) => handleChange('contractor', 'cpf', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>RG / Ôrgão Emissor *</label>
                  <input
                    required
                    className="form-control"
                    placeholder="00.000.000-0"
                    value={formData.contractor.rg}
                    onChange={(e) => handleChange('contractor', 'rg', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Data de Nascimento *</label>
                <input
                  required
                  type="date"
                  className="form-control"
                  value={formData.contractor.birthDate}
                  onChange={(e) => handleChange('contractor', 'birthDate', e.target.value)}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Estado Civil</label>
                  <input
                    className="form-control"
                    placeholder="Ex: solteira, casada"
                    value={formData.contractor.civilStatus}
                    onChange={(e) => handleChange('contractor', 'civilStatus', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Profissão</label>
                  <input
                    className="form-control"
                    placeholder="Sua profissão"
                    value={formData.contractor.profession}
                    onChange={(e) => handleChange('contractor', 'profession', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ marginBottom: '1rem' }}>Endereço Residencial Completo *</label>
                
                <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
                  <input
                    required
                    className="form-control"
                    placeholder="CEP (somente números)"
                    value={formData.contractor.address?.cep || ''}
                    onChange={(e) => handleAddressChange('cep', e.target.value)}
                    onBlur={handleCepBlur}
                  />
                  <input
                    required
                    className="form-control"
                    placeholder="Bairro"
                    value={formData.contractor.address?.neighborhood || ''}
                    onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <input
                    required
                    className="form-control"
                    placeholder="Rua, Avenida, etc."
                    value={formData.contractor.address?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                </div>

                <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
                  <input
                    required
                    className="form-control"
                    placeholder="Número"
                    value={formData.contractor.address?.number || ''}
                    onChange={(e) => handleAddressChange('number', e.target.value)}
                  />
                  <input
                    className="form-control"
                    placeholder="Complemento"
                    value={formData.contractor.address?.complement || ''}
                    onChange={(e) => handleAddressChange('complement', e.target.value)}
                  />
                </div>

                <div className="grid grid-2">
                  <input
                    required
                    className="form-control"
                    placeholder="Cidade"
                    value={formData.contractor.address?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                  <input
                    required
                    className="form-control"
                    placeholder="Estado (UF)"
                    value={formData.contractor.address?.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>WhatsApp / Telefone 1 *</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      required
                      className="form-control"
                      placeholder="(00) 00000-0000"
                      value={formData.contractor.phone1}
                      onChange={(e) => handleChange('contractor', 'phone1', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Telefone Secundário (Opcional)</label>
                  <input
                    className="form-control"
                    placeholder="(00) 00000-0000"
                    value={formData.contractor.phone2}
                    onChange={(e) => handleChange('contractor', 'phone2', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>E-mail para Contato *</label>
                <div className="input-with-icon">
                  <AtSign size={18} className="input-icon" />
                  <input
                    required
                    type="email"
                    className="form-control"
                    placeholder="exemplo@email.com"
                    value={formData.contractor.email}
                    onChange={(e) => handleChange('contractor', 'email', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: TESTEMUNHA */}
            <section className="form-card-block">
              <h2 className="section-title"><Star size={22} className="text-accent" /> 2. Testemunha</h2>
              <p className="text-sm text-muted mb-4">Informe uma testemunha para o contrato.</p>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Nome da Testemunha *</label>
                  <input
                    required
                    className="form-control"
                    placeholder="Nome completo"
                    value={formData.witness.name}
                    onChange={(e) => handleChange('witness', 'name', e.target.value)}
                    onInvalid={(e) => e.currentTarget.setCustomValidity('Informe o nome da testemunha.')}
                    onInput={(e) => e.currentTarget.setCustomValidity('')}
                  />
                </div>
                <div className="form-group">
                  <label>CPF da Testemunha *</label>
                  <input
                    required
                    className="form-control"
                    placeholder="000.000.000-00"
                    value={formData.witness.cpf}
                    onChange={(e) => handleChange('witness', 'cpf', e.target.value)}
                    onInvalid={(e) => e.currentTarget.setCustomValidity('Informe o CPF da testemunha.')}
                    onInput={(e) => e.currentTarget.setCustomValidity('')}
                  />
                </div>
              </div>
            </section>

            {/* SEÇÃO 3: EVENTO */}
            <section className="form-card-block">
              <h2 className="section-title"><Calendar size={22} className="text-accent" /> 3. Dados do Evento</h2>
              <p className="text-sm text-muted mb-4">Informações sobre o dia da prestação de serviço.</p>

              <div className="form-group">
                <label>Nome dos Celebrantes / Casal / Aniversariante *</label>
                <input
                  required
                  className="form-control"
                  placeholder="Ex: Maria Clara / João e Ana"
                  value={formData.event.celebrantsName}
                  onChange={(e) => handleChange('event', 'celebrantsName', e.target.value)}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Tipo de Evento *</label>
                  <select
                    required
                    className="form-control"
                    value={formData.event.type}
                    onChange={(e) => {
                      handleChange('event', 'type', e.target.value);
                      handleChange(null, 'selectedPackageId', '');
                    }}
                  >
                    <option value="" disabled>Selecione o tipo de evento</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Idade / Motivo *</label>
                  <input
                    required
                    className="form-control"
                    placeholder="Ex: 15 anos / Casamento"
                    value={formData.event.age}
                    onChange={(e) => handleChange('event', 'age', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Data do Evento *</label>
                  <input
                    required
                    type="date"
                    className="form-control"
                    value={formData.event.date}
                    onChange={(e) => handleChange('event', 'date', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Quantidade de Convidados</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="Ex: 80"
                    value={formData.event.guestCount}
                    onChange={(e) => handleChange('event', 'guestCount', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Local do Evento *</label>
                <input
                  required
                  className="form-control"
                  placeholder="Nome do salão, buffet, cartório ou local"
                  value={formData.event.locationName}
                  onChange={(e) => handleChange('event', 'locationName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Local do Evento (Endereço Completo) *</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <textarea
                    required
                    className="form-control"
                    placeholder="Salão, Buffet ou Endereço"
                    value={formData.event.address}
                    onChange={(e) => handleChange('event', 'address', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Horário de Início *</label>
                  <div className="input-with-icon">
                    <Clock size={18} className="input-icon" />
                    <input
                      required
                      type="time"
                      className="form-control"
                      value={formData.event.startTime}
                      onChange={(e) => handleChange('event', 'startTime', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Horário de Término *</label>
                  <div className="input-with-icon">
                    <Clock size={18} className="input-icon" />
                    <input
                      required
                      type="time"
                      className="form-control"
                      value={formData.event.endTime}
                      onChange={(e) => handleChange('event', 'endTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Instagram para Marcação *</label>
                  <div className="input-with-icon">
                  <Camera size={18} className="input-icon" />
                    <input
                      required
                      className="form-control"
                      placeholder="@seu.perfil"
                      value={formData.event.instagram}
                      onChange={(e) => handleChange('event', 'instagram', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tema da Festa (Opcional)</label>
                  <input
                    className="form-control"
                    placeholder="Ex: Minimalista / Realeza"
                    value={formData.event.theme}
                    onChange={(e) => handleChange('event', 'theme', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* SEÇÃO 4: PACOTE */}
            <section className="form-card-block">
              <h2 className="section-title"><Package size={22} className="text-accent" /> 4. Pacote Contratado</h2>
              <p className="text-sm text-muted mb-4">Selecione o pacote acordado previamente.</p>
              {packagesNotice && <p className="text-sm text-muted mb-4">{packagesNotice}</p>}

              <div className="selection-list">
                {!formData.event.type ? (
                  <p className="text-muted" style={{ padding: '2rem 0', textAlign: 'center', background: 'var(--bg-page)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                    Por favor, selecione o <strong>Tipo de Evento</strong> na seção 3 para visualizar os pacotes disponíveis.
                  </p>
                ) : (
                  ['infantil', 'adulto', 'debutante', 'casamento'].filter(cat => cat === formData.event.type).map(cat => {
                  const catPackages = packages
                    .filter(p => p.category === cat)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                  
                  if (catPackages.length === 0) return null;

                  const getCatProps = (c) => {
                    if (c === 'infantil') return { title: '👶 Infantil', color: '#E4C26A', bg: 'rgba(200, 155, 60, 0.1)' };
                    if (c === 'adulto') return { title: '🧑 Adulto', color: '#F4E8C6', bg: 'rgba(230, 211, 163, 0.1)' };
                    if (c === 'debutante') return { title: '👑 Debutante', color: '#E4B8B2', bg: 'rgba(201, 140, 132, 0.1)' };
                    if (c === 'casamento') return { title: '💍 Casamento', color: '#F5D76E', bg: 'rgba(212, 175, 55, 0.1)' };
                    return { title: '📸 Outros', color: 'var(--accent)', bg: 'rgba(255, 255, 255, 0.05)' };
                  };
                  
                  const props = getCatProps(cat);

                  return (
                    <div key={cat} className="package-group" style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ 
                        color: props.color, 
                        marginBottom: '0.75rem', 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        borderBottom: `1px solid ${props.color}40`, 
                        paddingBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {props.title}
                      </h3>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {catPackages.map(pkg => {
                          const isSelected = formData.selectedPackageId === pkg.id;
                          return (
                            <label key={pkg.id || pkg.name} className={`selection-item ${isSelected ? 'selected' : ''}`} style={{
                              borderColor: isSelected ? props.color : `${props.color}60`,
                              backgroundColor: isSelected ? props.bg : 'var(--bg-page)',
                              marginBottom: 0
                            }}>
                              <input
                                type="radio"
                                name="package"
                                required
                                checked={isSelected}
                                disabled={packagesSource !== 'api'}
                                onChange={() => handleChange(null, 'selectedPackageId', pkg.id)}
                              />
                              <div className="selection-content">
                                <div className="selection-header">
                                  <span className="selection-name" style={{ color: isSelected ? props.color : 'var(--text)' }}>
                                    {pkg.name || 'Pacote'}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn-info-pkg"
                                    style={{ color: isSelected ? props.color : '' }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setModalPackage(pkg);
                                    }}
                                  >
                                    <Info size={16} /> Detalhes
                                  </button>
                                </div>
                                {pkg.description && <p className="selection-desc line-clamp-1">{pkg.description}</p>}
                              </div>
                              {isSelected && <CheckCircle size={20} className="selection-check" style={{ color: props.color }} />}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
                )}
              </div>
            </section>

            {/* SEÇÃO 5: EXTRAS */}
            <section className="form-card-block">
              <h2 className="section-title"><PlusCircle size={22} className="text-accent" /> 5. Extras e Ajustes</h2>
              <p className="text-sm text-muted mb-4">Selecione os adicionais que deseja incluir no orçamento.</p>
              {extrasNotice && <p className="text-sm text-muted mb-4">{extrasNotice}</p>}

              {extraHourOption && (
                <div className="extra-hour-card mb-4">
                  <div className="extra-card-main">
                    <div>
                      <span className="selection-name">{extraHourOption.name}</span>
                      {extraHourOption.description && <p className="selection-desc">{extraHourOption.description}</p>}
                    </div>
                    <strong>{Number(extraHourOption.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                  <label className="extra-quantity-control">
                    <span>Quantidade</span>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.extraHours}
                      disabled={extrasSource !== 'api'}
                      onChange={(e) => handleChange(null, 'extraHours', e.target.value)}
                    />
                  </label>
                </div>
              )}

              <div className="extras-selection-list">
                {selectableExtras.map((extra) => {
                  const selected = formData.selectedExtras.includes(extra.id);
                  return (
                    <label key={extra.id || extra.name} className={`selection-item extra-selection-item ${selected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={extrasSource !== 'api'}
                        onChange={() => handleToggleExtra(extra.id)}
                      />
                      <div className="selection-content">
                        <div className="selection-header">
                          <span className="selection-name">{extra.name}</span>
                          <strong className="extra-price">
                            {Number(extra.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </strong>
                        </div>
                        {extra.description && <p className="selection-desc">{extra.description}</p>}
                      </div>
                      {selected && <CheckCircle size={20} className="selection-check" />}
                    </label>
                  );
                })}
              </div>

              {extrasSource === 'api' && extras.length === 0 && (
                <p className="text-sm text-muted">Nenhum extra ativo disponível no momento.</p>
              )}
            </section>

            {/* SEÇÃO 6: PAGAMENTO */}
            <section className="form-card-block">
              <h2 className="section-title"><CreditCard size={22} className="text-accent" /> 6. Pagamento</h2>

              <div className="payment-values-grid mb-4">
                <div className="value-card highlighted">
                  <span className="value-label">Total com extras</span>
                  <span className="value-amount">R$ {finalPaymentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  {isPixCash && packageValue > 0 && (
                    <span className="text-sm text-muted">
                      Valor original: R$ {packageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ┬À 5% de desconto aplicado
                    </span>
                  )}
                </div>
                {isPixCash && packageValue > 0 && (
                  <div className="value-card">
                    <span className="value-label">Desconto aplicado</span>
                    <span className="value-amount">R$ {pixDiscountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {extrasTotal > 0 && (
                  <div className="value-card">
                    <span className="value-label">Extras selecionados</span>
                    <span className="value-amount">R$ {extrasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              <div className="form-group mb-4">
                <label>Forma de Pagamento *</label>
                <div className="selection-grid">
                  {[
                    {id: 'pix', label: 'Pix à Vista', desc: 'Integral no ato com 5% de desconto'},
                    {id: 'pix_parcelado', label: 'Pix Parcelado', desc: 'Entrada + parcelas'},
                    {id: 'cartao', label: 'Cartão / Link', desc: 'Taxas por conta do cliente'}
                  ].map(method => (
                    <label key={method.id} className={`selection-card ${formData.payment.method === method.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        required
                        checked={formData.payment.method === method.id}
                        onChange={() => handlePaymentChange('method', method.id)}
                      />
                      <div className="selection-card-content">
                        <span className="selection-card-label">{method.label}</span>
                        <span className="selection-card-desc">{method.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Detalhes do Acerto (Ex: 50% entrada + 50% no evento) *</label>
                <textarea
                  required
                  className="form-control"
                  rows="2"
                  placeholder="Descreva o que foi combinado sobre prazos e valores."
                  value={formData.payment.details}
                  onChange={(e) => handlePaymentChange('details', e.target.value)}
                />
              </div>
            </section>

            {/* SEÇÃO 7: OBSERVAÇ├òES */}
            <section className="form-card-block">
              <h2 className="section-title"><Info size={22} className="text-accent" /> 7. Observações</h2>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Deseja acrescentar alguma informação importante?"
                value={formData.observations}
                onChange={(e) => handleChange(null, 'observations', e.target.value)}
              />
            </section>

            <div className="form-submit-area">
              <div className="consent-check mb-4">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    required
                    checked={formData.contractualConsent}
                    onChange={(e) => handleChange(null, 'contractualConsent', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <p className="text-sm">
                    Li e concordo com o uso dos meus dados para elaboração do orçamento/contrato e atendimento pela Mayclick, conforme a <Link to="/politica-de-privacidade" target="_blank" className="text-accent">Política de Privacidade</Link> e os <Link to="/termos-de-uso" target="_blank" className="text-accent">Termos de Uso</Link>.
                  </p>
                </label>
              </div>

              <footer className="form-footer">
                <button
                  type="submit"
                  className="btn btn-accent btn-xl btn-full"
                  disabled={isSubmitting || packagesSource !== 'api'}
                >
                  {isSubmitting ? 'Enviando...' : 'FINALIZAR CADASTRO'}
                </button>
              </footer>
            </div>
          </form>
        </div>
      </main>

      <PublicFooter />

      {/* PACKAGE DETAILS MODAL */}
      {safeModalPackage && (
        <div className="modal-backdrop" onClick={() => setModalPackage(null)}>
          <div className="modal-content fade-up" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <div className="modal-header-icon">
                <Camera size={24} />
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setModalPackage(null)}>
                <X size={24} />
              </button>
            </header>

            <div className="modal-body">
              <div className="modal-pkg-header">
                <h3 className="modal-pkg-title">{safeModalPackage.name || 'Pacote'}</h3>
                <div className="modal-pkg-price-badge">
                  {safeModalPackage.price > 0
                    ? `R$ ${safeModalPackage.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "Valor sob consulta"}
                </div>
                {safeModalPackage.installment_text && (
                  <p className="block-text">{safeModalPackage.installment_text}</p>
                )}
              </div>

              <div className="modal-scroll-area">
                <div className="modal-info-block">
                  <h4 className="block-title"><Clock size={16} /> Cobertura e Equipe</h4>
                  {modalDescription && <p className="block-text">{modalDescription}</p>}
                  {modalCoverageSummary && (
                    <p className="block-text">
                      {modalCoverageSummary}
                    </p>
                  )}
                  {!modalDescription && !modalCoverageSummary && (
                    <p className="block-text">Informações detalhadas em atualização.</p>
                  )}
                </div>

                <div className="modal-info-block">
                  <h4 className="block-title"><CheckCircle size={16} /> O que está incluso</h4>
                  <ul className="modal-list">
                    {modalFeatures.length > 0 ? modalFeatures.map((f, i) => {
                      const text = featureToDisplayText(f);
                      return text ? (
                        <li key={i} className="modal-list-item">
                          <Check size={14} className="text-accent" />
                          <span>{text}</span>
                        </li>
                      ) : null;
                    }) : (
                      <li className="modal-list-item">Informações detalhadas em atualização.</li>
                    )}
                  </ul>
                </div>

                {modalComparisonItems.length > 0 && (
                  <div className="modal-info-block">
                    <h4 className="block-title"><ClipboardCheck size={16} /> Itens do pacote</h4>
                    <ul className="modal-list">
                      {modalComparisonItems.map((item, i) => {
                        const text = featureToDisplayText(item);
                        return text ? (
                          <li key={i} className="modal-list-item">
                            <Check size={14} className="text-accent" />
                            <span>{text}</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}

                {safeModalPackage.deliveries && (
                  <div className="modal-info-block">
                    <h4 className="block-title"><CheckCircle size={16} /> Entregas</h4>
                    <p className="block-text">{safeModalPackage.deliveries}</p>
                  </div>
                )}

                {safeModalPackage.observations && (
                  <div className="modal-info-block">
                    <h4 className="block-title"><Info size={16} /> Observações</h4>
                    <p className="block-text">{safeModalPackage.observations}</p>
                  </div>
                )}

                <div className="modal-info-block highlight-block">
                  <h4 className="block-title"><Star size={16} /> Diferencial Mayclick</h4>
                  <p className="block-text">{safeModalPackage.differential || 'Entrega de fotos em alta resolução, tratadas com nossa edição exclusiva e acesso vitalício à galeria online.'}</p>
                </div>
              </div>
            </div>

            <footer className="modal-footer">
              <button
                type="button"
                className="btn btn-accent btn-lg btn-full"
                onClick={() => {
                  if (packagesSource === 'api') {
                    setFormData(prev => ({ ...prev, selectedPackageId: safeModalPackage.id }));
                  }
                  setModalPackage(null);
                }}
                disabled={packagesSource !== 'api'}
              >
                SELECIONAR ESTE PACOTE
              </button>
            </footer>
          </div>
        </div>
      )}

            <style>{`
        .public-form-page {
          --bg-page: #050505;
          --bg-surface: #111111;
          --bg-surface-hover: #1a1a1a;
          --border: #333333;
          --primary: #ffffff;
          --text-muted: #888888;
          --text-soft: #aaaaaa;
          --accent: #c5a059;
          --accent-light: rgba(197, 160, 89, 0.15);
          --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.5);
          --shadow-sm: 0 1px 3px 0 rgba(0,0,0,0.5);

          background-color: var(--bg-page);
          min-height: 100vh;
          color: var(--primary);
        }

        .form-header {
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-inner {
          height: 70px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .brand-name {
          font-weight: 800;
          font-size: 1.125rem;
          color: var(--primary);
          letter-spacing: -0.02em;
        }

        .form-content {
          padding: 4rem 0;
        }

        .container-narrow {
          max-width: 840px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .main-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }

        .page-header { margin-bottom: 3rem; text-align: center; }
        .page-title { font-size: 2.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.75rem; letter-spacing: -0.03em; }
        .page-subtitle { font-size: 1.125rem; color: var(--text-muted); }

        .form-section { margin-bottom: 2.5rem; }
        .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
        .section-icon { color: var(--accent); }
        .section-title { font-size: 1.25rem; font-weight: 700; color: var(--primary); }

        .form-card-block {
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem;
          margin-bottom: 2.5rem;
        }

        .form-row { margin-bottom: 1.25rem; }
        .form-row:last-child { margin-bottom: 0; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }

        .form-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-control {
          width: 100%;
          padding: 0.875rem 1.125rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          font-size: 1rem;
          transition: var(--transition);
          background-color: var(--bg-page);
          color: var(--primary);
        }

        .form-control:focus {
          outline: none;
          border-color: var(--accent);
          background-color: var(--bg-surface-hover);
          box-shadow: 0 0 0 4px var(--accent-light);
        }

        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 1.125rem; top: 50%; transform: translateY(-50%); color: var(--text-soft); pointer-events: none; }
        .input-with-icon .form-control { padding-left: 3.25rem; }

        .selection-list { display: flex; flex-direction: column; gap: 1rem; }
        .selection-item { display: flex; align-items: center; padding: 1.25rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition); background-color: var(--bg-page); }
        .selection-item:hover, .selection-item.selected { border-color: var(--accent); background-color: var(--bg-surface-hover); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .selection-item input { display: none; }
        .selection-content { flex: 1; }
        .selection-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
        .selection-name { font-weight: 700; color: var(--primary); }
        .selection-desc { font-size: 0.8125rem; color: var(--text-muted); }
        .selection-check { color: var(--accent); margin-left: 1rem; }

        .btn-info-pkg { background: none; border: none; color: var(--accent); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 4px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: 0.2s; }
        .btn-info-pkg:hover { background: var(--accent-light); }

        .extras-selection-list { display: flex; flex-direction: column; gap: 0.875rem; }
        .extra-selection-item { align-items: flex-start; }
        .extra-price { color: var(--accent); font-size: 0.9375rem; white-space: nowrap; margin-left: 1rem; font-weight: bold; }
        .extra-hour-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-page);
          padding: 1.25rem;
        }
        .extra-card-main {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .extra-quantity-control {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 110px;
          gap: 1rem;
          align-items: center;
          margin: 0;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .extra-quantity-control .form-control { text-align: center; padding-left: 0.875rem; }

        .selection-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; }
        .selection-card { padding: 1rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; text-align: center; background-color: var(--bg-page); transition: var(--transition); }
        .selection-card:hover, .selection-card.selected { border-color: var(--accent); background-color: var(--bg-surface-hover); }
        .selection-card input { display: none; }
        .selection-card-label { display: block; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem; }
        .selection-card-desc { font-size: 0.75rem; color: var(--text-muted); }

        .payment-values-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .value-card { background-color: var(--bg-page); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 1.5rem; text-align: center; }
        .value-card.highlighted { border-color: var(--accent); background-color: var(--bg-surface-hover); box-shadow: var(--shadow-sm); }
        .value-label { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; }
        .value-amount { font-size: 1.5rem; font-weight: 800; color: var(--primary); }

        .form-submit-area { background-color: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 3rem; color: var(--primary); margin-top: 4rem; }
        .consent-check { display: flex; align-items: flex-start; text-align: left; }
        .checkbox-container { display: flex; align-items: flex-start; gap: 1rem; cursor: pointer; position: relative; }
        .checkbox-container input { display: none; }
        .checkmark { flex-shrink: 0; width: 22px; height: 22px; border: 2px solid var(--border); border-radius: 4px; position: relative; transition: 0.2s; margin-top: 2px; }
        .checkbox-container input:checked ~ .checkmark { background-color: var(--accent); border-color: var(--accent); }
        .checkmark:after { content: ""; position: absolute; display: none; left: 7px; top: 3px; width: 5px; height: 10px; border: solid #000; border-width: 0 2px 2px 0; transform: rotate(45deg); }
        .checkbox-container input:checked ~ .checkmark:after { display: block; }

        .btn-full { width: 100%; }
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
        .modal-content { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .modal-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
        .modal-header-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; }
        .btn-close-modal { background: none; border: none; color: var(--text-muted); cursor: pointer; }
        .modal-body { padding: 2rem; overflow-y: auto; flex: 1; color: var(--primary); }
        .modal-pkg-header { margin-bottom: 1.5rem; text-align: center; }
        .modal-pkg-title { font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem; }
        .modal-pkg-price-badge { display: inline-block; padding: 0.5rem 1rem; background: var(--accent); color: #000; border-radius: var(--radius-full); font-weight: 700; font-size: 0.875rem; }
        .modal-info-block { margin-bottom: 1.5rem; }
        .block-title { font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .block-text { font-size: 0.9375rem; line-height: 1.6; color: var(--primary); }
        .modal-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .modal-list-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: var(--primary); }

        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr; }
          .form-submit-area { padding: 1.5rem; }
          .selection-header, .extra-card-main { align-items: flex-start; flex-direction: column; }
          .extra-price { margin-left: 0; }
          .extra-quantity-control { grid-template-columns: 1fr; }
        }
      `}</style>

    </div>
  );
};

export default PublicForm;
