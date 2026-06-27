import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calculator, User, Calendar,
  MapPin, Package, Download, Trash,
  CheckCircle, XCircle, FileText, Clock,
  Send, DollarSign, Info, ChevronRight
} from 'lucide-react';
import { getBudgetById, updateBudget, downloadGeneratedDocument } from '../lib/apiClient';
import { generateServiceContractPdf } from './ContractPdfGenerator';
import useSettings from '../hooks/useSettings';

const formatDateBR = (value, fallback = 'A confirmar') => {
  if (!value) return fallback;
  const text = String(value).trim();
  const isoDateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoDateOnly
    ? new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]))
    : new Date(text);

  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString('pt-BR');
};

const BudgetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessSettings } = useSettings();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBudget();
  }, [id]);

  const fetchBudget = async () => {
    try {
      const data = await getBudgetById(id);
      setBudget(data);
    } catch (error) {
      console.error('Error fetching budget:', {
        status: error.status,
        endpoint: error.endpoint,
      });
      alert('Orçamento não encontrado.');
      navigate('/app/orcamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      let contractDocId = budget.contract_document_id;
      
      if (newStatus === 'approved' && !contractDocId) {
        try {
          const contractDoc = await generateServiceContractPdf({
            submission: budget,
            budgetId: budget.id,
            businessSettings
          });
          if (contractDoc && contractDoc.id) {
            contractDocId = contractDoc.id;
            alert('Contrato gerado com sucesso!');
          }
        } catch (err) {
          console.error('[Contract] Error generating contract:', err);
          alert('Orçamento aprovado, mas não foi possível gerar o contrato automaticamente.');
        }
      }

      await updateBudget(id, { status: newStatus, contract_document_id: contractDocId });
      setBudget(prev => ({ ...prev, status: newStatus, contract_document_id: contractDocId }));
    } catch (error) {
      alert('Erro ao atualizar status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-12 text-center"><div className="loader"></div></div>;
  if (!budget) return null;

  const budgetNum = String(budget.budget_number).padStart(5, '0');
  const pdfDoc = budget.documents?.find(d => d.document_type === 'budget');

  return (
    <div className="budget-details fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-ghost p-2" onClick={() => navigate('/app/orcamentos')}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <span className="badge badge-accent mb-1">ORÇAMENTO #{budgetNum}</span>
          <h1 className="m-0">Detalhes do Orçamento</h1>
        </div>
      </div>

      <div className="grid grid-3-1">
        <div className="details-main">

          {/* CLIENT & EVENT */}
          <div className="grid grid-2 mb-6">
            <section className="card">
              <h2 className="section-title"><User size={20} className="text-accent" /> Cliente</h2>
              <div className="detail-row">
                <span className="detail-label">Nome:</span>
                <span className="detail-value">{budget.client_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">WhatsApp:</span>
                <span className="detail-value">{budget.client_phone || '--'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">E-mail:</span>
                <span className="detail-value">{budget.client_email || '--'}</span>
              </div>
            </section>

            <section className="card">
              <h2 className="section-title"><Calendar size={20} className="text-accent" /> Evento</h2>
              <div className="detail-row">
                <span className="detail-label">Tipo:</span>
                <span className="detail-value text-capitalize">{budget.event_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Data da festa:</span>
                <span className="detail-value">{formatDateBR(budget.event_date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Local da festa:</span>
                <span className="detail-value">{budget.event_location || 'A definir'}</span>
              </div>
            </section>
          </div>

          {/* PACKAGE & ITEMS */}
          <section className="card mb-6">
            <h2 className="section-title"><Package size={20} className="text-accent" /> Serviço Contratado</h2>
            <div className="pkg-header-detail p-4 bg-page rounded mb-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{budget.selected_package_name || 'Personalizado'}</span>
                <span className="text-accent font-bold text-xl">
                  R$ {Number(budget.package_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="items-list">
              <h3 className="text-sm font-bold text-muted uppercase mb-3">Adicionais e Ajustes</h3>
              {(budget.extras_data || []).map((extra, idx) => (
                <div key={idx} className="item-row">
                  <span>{extra.name}</span>
                  <span>R$ {Number(extra.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}

              {Number(budget.travel_data?.amount ?? budget.travel_data?.value ?? 0) > 0 && (
                <div className="item-row">
                  <span>{budget.travel_data?.label || 'Deslocamento ida e volta'}</span>
                  <span>R$ {Number(budget.travel_data?.amount ?? budget.travel_data?.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {Number(budget.discount_data?.amount || budget.discount_data?.value || 0) > 0 && (
                <div className="item-row text-error">
                  <span>Desconto</span>
                  <span>- R$ {Number(budget.discount_data.amount || budget.discount_data.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <div className="total-summary-detail mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-muted font-bold uppercase">Investimento Total</span>
                <span className="text-2xl font-black text-primary">
                  R$ {Number(budget.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          {/* PAYMENT */}
          <section className="card">
            <h2 className="section-title"><DollarSign size={20} className="text-accent" /> Condições de Pagamento</h2>
            <div className="grid grid-2">
              <div className="p-4 bg-page rounded border">
                <span className="text-xs font-bold text-muted uppercase block mb-1">Método Escolhido</span>
                <span className="font-bold">{budget.payment_data?.method || 'A definir'}</span>
              </div>
              <div className="p-4 bg-page rounded border">
                <span className="text-xs font-bold text-muted uppercase block mb-1">Status do Pagamento</span>
                <span className="font-bold text-muted">Aguardando Aprovação</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="details-sidebar">
          {/* STATUS CONTROL */}
          <section className="card mb-6">
            <h2 className="section-title text-sm">Status do Orçamento</h2>
            <div className="status-selector">
              {[
                { id: 'draft', label: 'Rascunho', color: 'gray' },
                { id: 'sent', label: 'Enviado ao Cliente', color: 'orange' },
                { id: 'approved', label: 'Aprovado', color: 'green' },
                { id: 'cancelled', label: 'Cancelado', color: 'red' }
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`status-opt ${budget.status === opt.id ? 'active' : ''} color-${opt.color}`}
                  disabled={updating}
                  onClick={() => handleStatusChange(opt.id)}
                >
                  {budget.status === opt.id && <CheckCircle size={14} />}
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* DOCUMENTS */}
          <section className="card mb-6">
            <h2 className="section-title text-sm">Documentos</h2>
            {(budget.pdf_document_id || budget.document_id) && (
              <button 
                className="btn btn-outline"
                onClick={() => handleDownload(budget.pdf_document_id || budget.document_id, budget.file_name || budget.pdf_path)}
              >
                <Download size={18} /> Baixar Orçamento PDF
              </button>
            )}
            
            {budget.contract_document_id && (
              <button 
                className="btn btn-accent"
                onClick={() => handleDownload(budget.contract_document_id, `Contrato-${budgetNum}.pdf`)}
              >
                <Download size={18} /> Baixar Contrato
              </button>
            )}
            {pdfDoc && !budget.contract_document_id ? (
              <div className="doc-item-card" onClick={() => downloadGeneratedDocument(pdfDoc.id, pdfDoc.file_name || pdfDoc.pdf_path)}>
                <FileText size={24} className="text-accent" />
                <div className="doc-info">
                  <span className="doc-name">PDF do Orçamento</span>
                  <span className="doc-date">{new Date(pdfDoc.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <Download size={18} className="text-muted" />
              </div>
            ) : !budget.contract_document_id && !(budget.pdf_document_id || budget.document_id) ? (
              <div className="empty-docs text-center p-4">
                <p className="text-xs text-muted">Nenhum PDF gerado ainda para este orçamento.</p>
                <button className="btn btn-outline btn-sm btn-full mt-2" onClick={() => navigate('/app/orcamentos')}>
                   Gerar via Orçamento Manual
                </button>
              </div>
            ) : null}
          </section>

          <div className="sidebar-info p-4 bg-accent-light rounded border border-accent">
            <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
              <Info size={16} /> Próximos Passos
            </h4>
            <p className="text-xs text-primary leading-relaxed">
              Após o cliente aprovar o orçamento, você pode converter este registro em um contrato oficial na aba "Contratos".
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        .grid-3-1 { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem; }
        .detail-label { color: var(--text-muted); font-weight: 600; }
        .detail-value { font-weight: 700; color: var(--primary); }
        .text-capitalize { text-transform: capitalize; }

        .item-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        .item-row:last-child { border-bottom: none; }

        .status-selector { display: flex; flex-direction: column; gap: 0.5rem; }
        .status-opt { padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: none; cursor: pointer; text-align: left; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; transition: var(--transition); }
        .status-opt:hover { background-color: var(--bg-page); }
        .status-opt.active { color: #fff; border-color: transparent; }
        .status-opt.active.color-gray { background-color: #6b7280; }
        .status-opt.active.color-orange { background-color: #d97706; }
        .status-opt.active.color-green { background-color: #059669; }
        .status-opt.active.color-red { background-color: #dc2626; }

        .doc-item-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition); }
        .doc-item-card:hover { border-color: var(--accent); background-color: var(--accent-light); }
        .doc-info { flex: 1; display: flex; flex-direction: column; }
        .doc-name { font-weight: 700; font-size: 0.85rem; color: var(--primary); }
        .doc-date { font-size: 0.75rem; color: var(--text-muted); }

        @media (max-width: 992px) {
          .grid-3-1 { grid-template-columns: 1fr; }
          .details-sidebar { order: -1; }
        }
      `}</style>
    </div>
  );
};

export default BudgetDetails;
