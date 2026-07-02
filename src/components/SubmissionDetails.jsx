import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, User, Calendar,
  MapPin, CreditCard, Clock, MessageSquare, Trash,
  ClipboardCheck, Camera, Star, AtSign, Phone, Package,
  Briefcase, Heart, Users, Map, Info, FileCheck,
  Edit2, Save, X
} from 'lucide-react';
import useSettings from '../hooks/useSettings';
import { generateContractPdf, generateFichaTecnicaPdf } from './ContractPdfGenerator';
import {
  getAdminSubmissionById, getGeneratedDocuments, downloadGeneratedDocument,
  getBudgets, createBudget, updateBudget, getPackages, deleteAdminSubmission, updateAdminSubmission
} from '../lib/apiClient';

const formatDateBR = (value, fallback = 'A confirmar') => {
  if (!value) return fallback;
  const text = String(value).trim();
  const isoDateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoDateOnly
    ? new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]))
    : new Date(text);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString('pt-BR');
};

const SubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessSettings } = useSettings();

  const [submission, setSubmission] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [packageLoadError, setPackageLoadError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fetchDocs = async () => {
    try {
      const data = await getGeneratedDocuments({ submissionId: id });
      setDocuments(data);
    } catch (err) {
      console.error('[SubmissionDetails] Error loading documents:', {
        status: err.status,
        endpoint: err.endpoint,
      });
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminSubmissionById(id);
        setSubmission(data);

        try {
          const packageData = await getPackages();
          setPackages(packageData);
          setPackageLoadError('');
        } catch (packageError) {
          console.error('[SubmissionDetails] Error loading packages:', {
            status: packageError.status,
            endpoint: packageError.endpoint,
            message: packageError.message,
          });
          setPackages([]);
          setPackageLoadError('Dados de pacotes indisponíveis no servidor. Não é possível gerar orçamento até reconectar.');
        }
      } catch (err) {
        console.error('[SubmissionDetails] Error:', {
          status: err.status,
          endpoint: err.endpoint,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
      fetchDocs();
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando detalhes...</div>;

  if (!submission) {
    return (
      <div className="container py-8 text-center">
        <div className="card max-w-lg mx-auto">
          <h2>Resposta não encontrada</h2>
          <p className="text-muted mt-2">O registro que você está procurando pode ter sido excluído.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/app/respostas')}>
            Voltar para a Lista
          </button>
        </div>
      </div>
    );
  }

  // Helper for data mapping
  const contractor = submission.contractor_data || submission.contractor || {};
  const event = submission.event_data || submission.event || {};
  const payment = submission.payment_data || submission.payment || {};
  const createdAt = submission.created_at || submission.createdAt;
  const pkgId = submission.selected_package_id || submission.selectedPackageId;
  const firstText = (...values) => {
    for (const value of values) {
      const text = value == null ? '' : String(value).trim();
      if (text && !['undefined', 'null'].includes(text.toLowerCase())) return text;
    }
    return '';
  };
  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  const normalizeExtras = (...sources) => (
    sources.flatMap(safeArray)
      .map((extra) => {
        const price = Number(extra?.price ?? extra?.amount ?? extra?.value ?? 0);
        const quantity = Number(extra?.quantity ?? 1);
        const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 1;
        return {
          id: firstText(extra?.id),
          name: firstText(extra?.name, extra?.label, extra?.title, extra?.description),
          description: firstText(extra?.description),
          price: Number.isFinite(price) ? price : 0,
          quantity: safeQuantity,
          total: Number.isFinite(Number(extra?.total)) ? Number(extra.total) : (Number.isFinite(price) ? price : 0) * safeQuantity,
        };
      })
      .filter((extra) => extra.name && extra.quantity > 0)
  );
  const normalizeWitnesses = (rawWitness = {}) => {
    const source = rawWitness || {};
    return {
      name: firstText(source.name, source.witness1?.name, source.first?.name),
      cpf: firstText(source.cpf, source.witness1?.cpf, source.first?.cpf),
    };
  };
  const eventType = firstText(event.eventType, event.type, event.event_type);
  const eventLocation = firstText(event.eventLocation, event.locationName, event.location, event.local, submission.event_location);
  const eventAddress = firstText(event.address, event.eventAddress, event.event_address, eventLocation);
  const guestCount = firstText(event.guestCount, event.guests, event.estimatedGuests, event.guest_count);
  const civilStatus = firstText(contractor.civilStatus, contractor.civil_status, contractor.maritalStatus);
  const profession = firstText(contractor.profession, contractor.occupation, contractor.jobTitle);
  const witnesses = normalizeWitnesses(submission.witness_data || submission.witness);
  const selectedExtras = normalizeExtras(
    submission.extras_data,
    submission.extras,
    event.selectedExtras,
    event.selected_extras
  );
  const importantNotes = firstText(submission.important_notes, submission.importantNotes, submission.observations);
  const extrasTotal = selectedExtras.reduce((acc, extra) => acc + Number(extra.total || 0), 0);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta resposta? Ela sairá da lista principal, mas documentos e orçamentos vinculados serão preservados.")) {
      return;
    }

    try {
      await deleteAdminSubmission(id);
      alert('Resposta excluída com sucesso.');
      navigate('/app/respostas');
    } catch (err) {
      console.error('[SubmissionDetails] Error deleting submission:', {
        status: err.status,
        endpoint: err.endpoint,
        details: err.details,
      });
      const apiMessage = err.details?.error || err.details?.message || err.message;
      alert(`Não foi possível excluir a resposta (${err.status || 'sem status'}). ${apiMessage || ''}`.trim());
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditData(null);
    } else {
      setEditData({
        contractor: {
          fullName: contractor.fullName || contractor.name || '',
          email: contractor.email || '',
          phone1: contractor.phone1 || contractor.phone || '',
          cpf: contractor.cpf || '',
          rg: contractor.rg || '',
          birthDate: contractor.birthDate || '',
          civilStatus: civilStatus || '',
          profession: profession || '',
        },
        address: typeof contractor.address === 'string' ? contractor.address : (contractor.address?.street ? `${contractor.address.street}, ${contractor.address.number || ''} ${contractor.address.complement || ''}` : ''),
        witnesses: {
          name: witnesses.name || '',
          cpf: witnesses.cpf || '',
        },
        event: {
          type: eventType || '',
          date: event.date || '',
          startTime: event.startTime || '',
          address: eventAddress || '',
          guestCount: guestCount || '',
          celebrantsName: event.celebrantsName || '',
        },
        importantNotes: importantNotes || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload = {
        contractor_data: { 
          ...contractor, 
          ...editData.contractor,
          address: editData.address
        },
        event_data: { ...event, ...editData.event, type: editData.event.type, date: editData.event.date, address: editData.event.address, guestCount: editData.event.guestCount },
        witness_data: { ...witnesses, ...editData.witnesses },
        important_notes: editData.importantNotes
      };
      
      const updatedSubmission = await updateAdminSubmission(id, payload);
      setSubmission(updatedSubmission);
      setIsEditing(false);
      setEditData(null);
      showSaved();
    } catch (error) {
      console.error('[SubmissionDetails] Error saving edit:', error);
      alert('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDocument = async () => {
    if (packageLoadError) {
      alert(packageLoadError);
      return;
    }

    try {
      // 1. Check if budget already exists for this submission
      const existingBudgets = await getBudgets({ submissionId: id });
      let currentBudgetId = existingBudgets.length > 0 ? existingBudgets[0].id : null;
      let currentBudgetNumber = existingBudgets.length > 0 ? existingBudgets[0].budget_number : submission.budget_number;

      const pkg = packages.find(p => p.id === pkgId) || null;
      const subtotal = Number(pkg?.price || 0)
        + extrasTotal
        + Number(submission.transportValue || 0);
      const discountAmount = Number(submission.discountValue || 0);

      const budgetData = {
        submission_id: id,
        source_type: 'submission',
        client_name: contractor.fullName,
        client_phone: contractor.phone1,
        client_email: contractor.email,
        event_type: eventType || pkg?.category,
        event_date: event.date,
        event_location: eventLocation || eventAddress,
        selected_package_id: pkgId,
        selected_package_name: pkg?.name || pkgId,
        package_price: pkg?.price || 0,
        package_data: pkg || {},
        extras_data: selectedExtras,
        travel_data: { value: submission.transportValue || 0 },
        discount_data: {
          type: discountAmount > 0 ? 'fixed' : 'none',
          value: discountAmount,
          amount: discountAmount,
        },
        payment_data: payment,
        subtotal,
        total: Number(payment.totalValue || 0),
        status: 'generated'
      };

      if (currentBudgetId) {
        await updateBudget(currentBudgetId, budgetData);
      } else {
        const newBudget = await createBudget(budgetData);
        currentBudgetId = newBudget.id;
        currentBudgetNumber = newBudget.budget_number;
      }

      // 2. Generate PDF with budget linkage
      await generateContractPdf({
        submission: {
          ...submission,
          contractor,
          witness: witnesses,
          event,
          payment,
          createdAt,
          selectedPackageId: pkgId,
          package: pkg,
          extras: selectedExtras,
          extras_data: selectedExtras,
          subtotal,
          totalValue: Number(payment.totalValue || 0),
          discountData: {
            type: discountAmount > 0 ? 'fixed' : 'none',
            value: discountAmount,
            amount: discountAmount,
          },
          budget_number: currentBudgetNumber
        },
        budgetId: currentBudgetId,
        businessSettings
      });

      // Refresh docs list
      setLoadingDocs(true);
      await fetchDocs();
    } catch (err) {
      console.error('[SubmissionDetails] Error in budget generation:', {
        status: err.status,
        endpoint: err.endpoint,
      });
      alert("Erro ao processar orçamento. Verifique os logs.");
    }
  };

  const handleGenerateFicha = async () => {
    try {
      const pkg = packages.find(p => p.id === pkgId) || null;
      const existingBudgets = await getBudgets({ submissionId: id });
      const linkedBudget = existingBudgets.length > 0 ? existingBudgets[0] : null;
      const linkedBudgetExtras = normalizeExtras(linkedBudget?.extras_data);
      await generateFichaTecnicaPdf({
        submission: {
          ...submission,
          contractor,
          witness: witnesses,
          event: {
            ...event,
            type: eventType || linkedBudget?.event_type,
            date: event.date || linkedBudget?.event_date,
            locationName: eventLocation || linkedBudget?.event_location,
            address: eventAddress || linkedBudget?.event_location,
            guestCount,
          },
          payment,
          createdAt,
          selectedPackageId: pkgId,
          package: pkg,
          budget: linkedBudget,
          event_type: eventType || linkedBudget?.event_type,
          event_date: event.date || linkedBudget?.event_date,
          event_location: eventLocation || linkedBudget?.event_location,
          extras_data: linkedBudgetExtras.length > 0 ? linkedBudgetExtras : selectedExtras,
          selected_package_name: pkg?.name || submission.selected_package_name,
        },
        businessSettings
      });
      // Refresh docs list
      setLoadingDocs(true);
      await fetchDocs();
    } catch (err) {
      alert("Não foi possível salvar a ficha técnica no sistema. O PDF não foi concluído.");
    }
  };

  return (
    <div className="submission-details-page fade-in">
      <header className="page-header mb-4">
        <div className="flex justify-between items-center">
          <button className="btn btn-outline" onClick={() => navigate('/app/respostas')}>
            <ArrowLeft size={18} /> Voltar para Respostas
          </button>
          <div className="submission-id-badge text-right">
            <span className="detail-label">Nº Orçamento</span>
            <div className="text-xl font-extrabold text-accent">
              #{submission.budget_number ? String(submission.budget_number).padStart(5, '0') : String(submission.id.slice(-5)).toUpperCase()}
            </div>
          </div>
          <div className="header-actions flex gap-2">
            {!isEditing ? (
              <button className="btn btn-outline" onClick={handleEditToggle}>
                <Edit2 size={18} /> Editar Informações
              </button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={handleEditToggle} disabled={saving}>
                  <X size={18} /> Cancelar
                </button>
                <button className="btn btn-accent" onClick={handleSaveEdit} disabled={saving}>
                  <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </>
            )}
            <button className="btn btn-outline" onClick={handleGenerateFicha}>
              <Download size={18} /> Ficha Técnica
            </button>
            <button className="btn btn-outline btn-danger-soft" onClick={handleDelete}>
              <Trash size={18} /> Excluir Registro
            </button>
            <button className="btn btn-accent" onClick={handleGenerateDocument} disabled={Boolean(packageLoadError)}>
              <FileText size={18} /> Gerar PDF do Orçamento
            </button>
          </div>
        </div>
        {packageLoadError && (
          <div className="alert alert-warning mt-4">
            {packageLoadError}
          </div>
        )}
      </header>

      <div className="details-layout">
        <div className="main-content">
          {/* SECTION: DADOS PESSOAIS */}
          <section className="card mb-4">
            <h2 className="section-title"><User size={22} className="text-accent" /> Dados Pessoais</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Nome Completo</span>
                {isEditing ? (
                  <input type="text" className="form-control" value={editData.contractor.fullName} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, fullName: e.target.value}})} />
                ) : (
                  <span className="detail-value">{contractor.fullName}</span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Documentos</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input type="text" className="form-control" placeholder="RG" value={editData.contractor.rg || ''} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, rg: e.target.value}})} />
                    <input type="text" className="form-control" placeholder="CPF" value={editData.contractor.cpf} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, cpf: e.target.value}})} />
                  </div>
                ) : (
                  <span className="detail-value">RG: {contractor.rg} | CPF: {contractor.cpf}</span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Nascimento / Estado Civil</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input type="date" className="form-control" value={editData.contractor.birthDate && !isNaN(new Date(editData.contractor.birthDate)) ? new Date(editData.contractor.birthDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, birthDate: e.target.value}})} />
                    <input type="text" className="form-control" placeholder="Estado Civil" value={editData.contractor.civilStatus} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, civilStatus: e.target.value}})} />
                  </div>
                ) : (
                  <span className="detail-value">
                    {contractor.birthDate ? new Date(contractor.birthDate).toLocaleDateString('pt-BR') : 'N/A'} | {civilStatus || 'N/A'}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Profissão</span>
                {isEditing ? (
                  <input type="text" className="form-control" value={editData.contractor.profession} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, profession: e.target.value}})} />
                ) : (
                  <span className="detail-value">{profession || 'Não informado'}</span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Contatos</span>
                {isEditing ? (
                  <input type="text" className="form-control" placeholder="Telefone" value={editData.contractor.phone1} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, phone1: e.target.value}})} />
                ) : (
                  <span className="detail-value">
                    <Phone size={14} /> {contractor.phone1} {contractor.phone2 ? ` / ${contractor.phone2}` : ''}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">E-mail / Instagram</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input type="email" className="form-control" placeholder="E-mail" value={editData.contractor.email} onChange={(e) => setEditData({...editData, contractor: {...editData.contractor, email: e.target.value}})} />
                  </div>
                ) : (
                  <span className="detail-value">
                    <AtSign size={14} /> {contractor.email} | <Camera size={14} /> {contractor.instagram}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="card mb-4">
            <h2 className="section-title"><Star size={22} className="text-accent" /> Testemunha</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Nome</span>
                {isEditing ? (
                  <input type="text" className="form-control" value={editData.witnesses.name} onChange={(e) => setEditData({...editData, witnesses: {...editData.witnesses, name: e.target.value}})} />
                ) : (
                  <span className="detail-value">{witnesses.name || 'Não informado'}</span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">CPF</span>
                {isEditing ? (
                  <input type="text" className="form-control" value={editData.witnesses.cpf} onChange={(e) => setEditData({...editData, witnesses: {...editData.witnesses, cpf: e.target.value}})} />
                ) : (
                  <span className="detail-value">{witnesses.cpf || 'Não informado'}</span>
                )}
              </div>
            </div>
          </section>

          {/* SECTION: ENDEREÇO */}
          <section className="card mb-4">
            <h2 className="section-title"><MapPin size={22} className="text-accent" /> Endereço Completo</h2>
            <div className="details-grid">
              <div className="detail-item span-2">
                <span className="detail-label">Endereço Fornecido</span>
                {isEditing ? (
                  <textarea 
                    className="form-control" 
                    rows={2}
                    value={editData.address || ''} 
                    onChange={(e) => setEditData({...editData, address: e.target.value})} 
                  />
                ) : (
                  <span className="detail-value">
                    {typeof contractor.address === 'string' ? contractor.address : (contractor.address?.street ? `${contractor.address.street}, ${contractor.address.number || ''} ${contractor.address.complement || ''} - ${contractor.address.neighborhood || ''} - ${contractor.address.city || ''}/${contractor.address.state || ''}` : 'Não informado')}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* SECTION: EVENTO */}
          <section className="card mb-4">
            <h2 className="section-title"><Calendar size={22} className="text-accent" /> Dados do Evento</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Tipo / Tema</span>
                {isEditing ? (
                  <input type="text" className="form-control" value={editData.event.type} onChange={(e) => setEditData({...editData, event: {...editData.event, type: e.target.value}})} />
                ) : (
                  <span className="detail-value">{eventType || 'N/A'} {event.theme ? ` | Tema: ${event.theme}` : ''}</span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Aniversariante / Casal / Debutante</span>
                {isEditing ? (
                  <input type="text" className="form-control" value={editData.event.celebrantsName || ''} onChange={(e) => setEditData({...editData, event: {...editData.event, celebrantsName: e.target.value}})} />
                ) : (
                  <span className="detail-value">{event.celebrantsName}</span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Data / Horário</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input type="date" className="form-control" value={editData.event.date && !isNaN(new Date(editData.event.date)) ? new Date(editData.event.date).toISOString().split('T')[0] : ''} onChange={(e) => setEditData({...editData, event: {...editData.event, date: e.target.value}})} />
                    <input type="time" className="form-control" value={editData.event.startTime || ''} onChange={(e) => setEditData({...editData, event: {...editData.event, startTime: e.target.value}})} />
                  </div>
                ) : (
                  <span className="detail-value">
                    {event.date ? formatDateBR(event.date) : 'A confirmar'} | {event.startTime} às {event.endTime}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Local e Endereço</span>
                {isEditing ? (
                  <input type="text" className="form-control" placeholder="Local/Endereço" value={editData.event.address} onChange={(e) => setEditData({...editData, event: {...editData.event, address: e.target.value}})} />
                ) : (
                  <span className="detail-value">
                    <strong>{eventLocation}</strong><br/>
                    {eventAddress}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">Quantidade de Convidados</span>
                {isEditing ? (
                  <input type="number" className="form-control" value={editData.event.guestCount} onChange={(e) => setEditData({...editData, event: {...editData.event, guestCount: e.target.value}})} />
                ) : (
                  <span className="detail-value flex items-center gap-2">
                    <Users size={16} /> {guestCount || 'Não informado'}
                  </span>
                )}
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">O que o cliente precisa (Observações)</span>
                {isEditing ? (
                  <textarea className="form-control" rows={3} value={editData.importantNotes || ''} onChange={(e) => setEditData({...editData, importantNotes: e.target.value})} />
                ) : (
                  <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{importantNotes || 'Nenhuma observação informada.'}</span>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="sidebar-content">
          {/* SECTION: PACOTE E PAGAMENTO */}
          <section className="card mb-4" style={{border: '1px solid var(--accent)'}}>
            <h2 className="section-title"><Package size={20} className="text-accent" /> Plano Contratado</h2>
            <div className="selection-summary">
              <div className="summary-block mb-4">
                <span className="detail-label">Pacote</span>
                <div className="pkg-highlight">{pkgId}</div>
                <div className="text-sm font-bold mt-1 text-accent">Total: R$ {Number(payment.totalValue || 0).toLocaleString('pt-BR')}</div>
              </div>

              {selectedExtras.length > 0 && (
                <div className="summary-block mb-4">
                  <span className="detail-label">Extras selecionados</span>
                  <div className="extras-summary-list">
                    {selectedExtras.map((extra, index) => (
                      <div key={extra.id || `${extra.name}-${index}`} className="extra-summary-row">
                        <span>
                          {extra.name}
                          {extra.quantity > 1 ? ` — ${extra.quantity} x R$ ${Number(extra.price || 0).toLocaleString('pt-BR')}` : ''}
                        </span>
                        <strong>R$ {Number(extra.total || 0).toLocaleString('pt-BR')}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold mt-2 text-accent">
                    Extras: R$ {extrasTotal.toLocaleString('pt-BR')}
                  </div>
                </div>
              )}

              <div className="summary-block mb-4">
                <span className="detail-label">Pagamento</span>
                <div className="payment-badge">
                  <CreditCard size={14} /> {payment.method || 'N/A'}
                </div>
                <div className="text-xs mt-2 text-muted">
                  Entrada: R$ {Number(payment.entryValue || 0).toLocaleString('pt-BR')}<br/>
                  Saldo: R$ {Number(payment.balanceValue || 0).toLocaleString('pt-BR')}
                </div>
                {payment.installments && (
                  <div className="text-xs mt-1 text-muted">
                    {payment.installments}x | Vencimentos: {payment.dueDates}
                  </div>
                )}
              </div>

              <div className="summary-block">
                <span className="detail-label">LGPD Consentimento</span>
                <div className={`consent-tag ${submission.contractual_consent || submission.contractualConsent ? 'success' : 'error'}`}>
                  <ClipboardCheck size={14} /> {(submission.contractual_consent || submission.contractualConsent) ? 'AUTORIZADO' : 'PENDENTE'}
                </div>
              </div>
            </div>
          </section>

          <section className="card mb-4">
            <h2 className="section-title"><FileCheck size={20} className="text-accent" /> Documentos Gerados</h2>
            <div className="documents-list">
              {loadingDocs ? (
                <p className="text-sm text-muted italic">Carregando documentos...</p>
              ) : documents.length > 0 ? (
                <div className="flex flex-column gap-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="doc-item flex justify-between items-center p-2 border rounded bg-light">
                      <div className="flex flex-column">
                        <span className="text-xs font-bold uppercase">{doc.document_type === 'technical_sheet' ? 'Ficha Técnica' : 'Orçamento'}</span>
                        <span className="text-xxs text-muted">{new Date(doc.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <button
                        className="btn btn-icon-sm"
                        title="Baixar PDF"
                        onClick={() => downloadGeneratedDocument(doc.id, doc.file_name)}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted italic">Nenhum documento gerado ainda.</p>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="section-title"><Info size={20} /> Observações</h2>
            <p className="text-sm italic text-muted">
              {submission.observations || "Nenhuma observação adicional."}
            </p>
          </section>
        </aside>
      </div>

      <style>{`
        .submission-details-page { padding-bottom: 3rem; }
        .details-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; align-items: start; }

        .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-item.span-2 { grid-column: span 2; }
        .detail-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
        .detail-value { font-size: 0.9375rem; font-weight: 500; color: var(--primary); }
        .detail-value svg { vertical-align: middle; color: var(--accent); margin-right: 4px; }

        .pkg-highlight { font-size: 1.5rem; font-weight: 800; color: var(--accent); line-height: 1.2; }
        .extras-summary-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
        .extra-summary-row {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.55rem 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.8125rem;
          color: var(--primary);
        }
        .extra-summary-row strong { white-space: nowrap; }
        .payment-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: var(--primary); color: #fff; border-radius: 8px; font-size: 0.875rem; font-weight: 600; margin-top: 0.5rem; }

        .consent-tag { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem; }
        .consent-tag.success { background-color: #E6FFFA; color: #319795; }
        .consent-tag.error { background-color: #FFF5F5; color: #E53E3E; }

        .documents-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .doc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }
        .text-xxs { font-size: 0.65rem; }
        .btn-icon-sm {
          padding: 0.4rem;
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-icon-sm:hover { background: #e9ecef; border-color: #ced4da; }

        @media (max-width: 992px) {
          .details-layout { grid-template-columns: 1fr; }
          .detail-item.span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
};

export default SubmissionDetails;
