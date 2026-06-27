import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, Search, Filter, Download,
  Eye, Calendar, Plus, FileText, CheckCircle,
  Clock, XCircle, AlertCircle, MapPin
} from 'lucide-react';
import { getBudgets, getBudgetById, downloadGeneratedDocument, updateBudget } from '../lib/apiClient';
import { generateContractPdf, generateServiceContractPdf } from './ContractPdfGenerator';
import useSettings from '../hooks/useSettings';

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const safeText = (value, fallback = 'A definir') => {
  const text = value == null ? '' : String(value).trim();
  return text || fallback;
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const formatDateBR = (value, fallback = 'A confirmar') => {
  if (!value) return fallback;
  const text = String(value).trim();
  const isoDateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoDateOnly
    ? new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]))
    : new Date(text);

  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString('pt-BR');
};

const buildPackageSnapshot = (budget) => {
  const packageData = budget?.package_data && typeof budget.package_data === 'object'
    ? budget.package_data
    : {};

  return {
    ...packageData,
    id: safeText(budget?.selected_package_id, 'manual'),
    name: safeText(packageData.name || budget?.selected_package_name, 'Personalizado'),
    price: toNumber(packageData.price ?? budget?.package_price),
    description: safeText(packageData.description, 'Cobertura fotográfica profissional conforme acordado.'),
    features: safeArray(packageData.features),
  };
};

const buildSavedBudgetSubmission = (budget) => {
  const travelData = budget?.travel_data && typeof budget.travel_data === 'object'
    ? budget.travel_data
    : {};
  const discountData = budget?.discount_data && typeof budget.discount_data === 'object'
    ? budget.discount_data
    : {};
  const packageSnapshot = buildPackageSnapshot(budget);

  return {
    id: budget.id,
    budget_number: budget.budget_number,
    createdAt: budget.created_at || new Date().toISOString(),
    contractor: {
      fullName: safeText(budget.client_name, 'Cliente'),
      phone1: safeText(budget.client_phone, ''),
      email: safeText(budget.client_email, ''),
      address: '',
    },
    event: {
      type: safeText(budget.event_type, 'Fotografia'),
      celebrantsName: safeText(budget.client_name, 'Cliente'),
      date: budget.event_date || '',
      address: safeText(budget.event_location, 'A definir'),
      startTime: '',
      endTime: '',
    },
    selectedPackageId: safeText(budget.selected_package_id, 'manual'),
    package: packageSnapshot,
    extras: safeArray(budget.extras_data),
    extraHoursCount: toNumber(travelData.extraHours),
    extraHourPrice: toNumber(travelData.extraHourPrice || 190),
    transportValue: toNumber(travelData.amount ?? travelData.value),
    transportLabel: travelData.label || 'Deslocamento ida e volta',
    subtotal: toNumber(budget.subtotal),
    totalValue: toNumber(budget.total),
    discountData: {
      type: discountData.type || 'none',
      value: toNumber(discountData.value),
      amount: toNumber(discountData.amount),
    },
    discountValue: toNumber(discountData.amount),
    paymentMethod: budget.payment_data?.method || '',
    contractualConsent: true,
    importantNotes: 'Orçamento salvo gerado pela área administrativa.',
  };
};

const SavedBudgets = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyBudgetId, setBusyBudgetId] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, [statusFilter]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await getBudgets({ status: statusFilter });
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', {
        status: error.status,
        endpoint: error.endpoint,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = budgets.filter(b =>
    String(b.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(b.budget_number).includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="status-badge status-approved"><CheckCircle size={12} /> Aprovado</span>;
      case 'sent': return <span className="status-badge status-sent"><FileText size={12} /> Enviado</span>;
      case 'cancelled': return <span className="status-badge status-cancelled"><XCircle size={12} /> Cancelado</span>;
      case 'generated': return <span className="status-badge status-generated"><Download size={12} /> Gerado</span>;
      default: return <span className="status-badge status-draft"><Clock size={12} /> Rascunho</span>;
    }
  };

  const showSuccess = (message) => {
    setSuccessNotice(message);
    setErrorNotice('');
    setTimeout(() => setSuccessNotice(''), 3500);
  };

  const showError = (message) => {
    setErrorNotice(message);
    setSuccessNotice('');
  };

  const updateBudgetRow = (budgetId, changes) => {
    setBudgets(prev => prev.map(item => (
      item.id === budgetId ? { ...item, ...changes } : item
    )));
  };

  const handleDownload = async (budget) => {
    const docId = budget.pdf_document_id || budget.document_id;

    if (!docId) return;

    setBusyBudgetId(budget.id);
    try {
      await downloadGeneratedDocument(docId, budget.file_name || budget.pdf_path);
    } catch (error) {
      console.error('[SavedBudgets] Error downloading budget PDF:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
        budgetId: budget.id,
        documentId: docId,
      });
      if (error.status === 404) {
        updateBudgetRow(budget.id, {
          document_id: null,
          pdf_document_id: null,
          file_name: null,
          pdf_path: null,
        });
        showError('PDF não encontrado no servidor. Gere novamente este orçamento.');
      } else {
        showError('Não foi possível baixar o PDF deste orçamento.');
      }
    } finally {
      setBusyBudgetId(null);
    }
  };

  const handleDownloadContract = async (budget) => {
    if (!budget.contract_document_id) return;

    setBusyBudgetId(budget.id);
    try {
      const budgetNum = String(budget.budget_number || budget.id).padStart(5, '0');
      const fileName = `Contrato-${budgetNum}.pdf`;
      await downloadGeneratedDocument(budget.contract_document_id, fileName);
    } catch (error) {
      console.error('[SavedBudgets] Error downloading contract:', error);
      showError('Não foi possível baixar o PDF deste contrato.');
    } finally {
      setBusyBudgetId(null);
    }
  };

  const handleGenerateContract = async (budget) => {
    setBusyBudgetId(budget.id);
    try {
      const fullBudget = await getBudgetById(budget.id);
      
      const contractDoc = await generateServiceContractPdf({
        submission: fullBudget,
        budgetId: fullBudget.id,
        businessSettings
      });

      if (contractDoc && contractDoc.id) {
        await updateBudget(budget.id, { contract_document_id: contractDoc.id });
        updateBudgetRow(budget.id, { contract_document_id: contractDoc.id });
        setSuccessNotice('Contrato gerado com sucesso!');
      }
    } catch (error) {
      console.error('[SavedBudgets] Error generating contract:', error);
      showError('Não foi possível gerar o contrato automaticamente.');
    } finally {
      setBusyBudgetId(null);
    }
  };

  const handleGeneratePdf = async (budget) => {
    setBusyBudgetId(budget.id);
    setErrorNotice('');
    setSuccessNotice('');

    try {
      const fullBudget = await getBudgetById(budget.id);
      const submission = buildSavedBudgetSubmission(fullBudget);
      const savedDocument = await generateContractPdf({
        submission,
        budgetId: fullBudget.id,
        businessSettings,
      });

      const updated = await updateBudget(fullBudget.id, {
        status: fullBudget.status === 'draft' || !fullBudget.status ? 'generated' : fullBudget.status,
        pdf_document_id: savedDocument?.id,
      });

      updateBudgetRow(fullBudget.id, {
        ...fullBudget,
        ...updated,
        document_id: savedDocument?.id,
        pdf_document_id: savedDocument?.id,
        file_name: savedDocument?.file_name,
        pdf_path: savedDocument?.pdf_path,
      });
      showSuccess('PDF gerado com sucesso.');
    } catch (error) {
      console.error('[SavedBudgets] Error generating budget PDF:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
        details: error.details,
        budgetId: budget.id,
      });
      showError(error.pdfGenerated
        ? 'PDF gerado, mas não foi possível salvar em Documentos Gerados.'
        : 'Não foi possível gerar o PDF deste orçamento.'
      );
    } finally {
      setBusyBudgetId(null);
    }
  };

  return (
    <div className="saved-budgets-page fade-in">
      <header className="page-header mb-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="badge badge-accent mb-1">Administrativo</span>
            <h1>Arquivo de Orçamentos</h1>
            <p className="text-muted">Consulte e gerencie todos os orçamentos salvos na plataforma.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-accent" onClick={() => navigate('/app/orcamentos/novo')}>
              <Plus size={18} /> Novo Orçamento
            </button>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <div className="filters-bar card mb-4">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente ou número..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} className="text-muted" />
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="generated">Gerado</option>
            <option value="sent">Enviado</option>
            <option value="approved">Aprovado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {(successNotice || errorNotice) && (
        <div className={`budget-feedback ${successNotice ? 'success' : 'error'} mb-4`}>
          {successNotice ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{successNotice || errorNotice}</span>
        </div>
      )}

      <div className="card list-card">
        {loading ? (
          <div className="loading-state p-12 text-center">
            <div className="loader mb-4"></div>
            <p className="text-muted">Carregando orçamentos...</p>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="empty-state p-12 text-center">
            <Calculator size={48} className="text-muted" style={{opacity: 0.2, marginBottom: '1rem'}} />
            <h3>Nenhum orçamento encontrado</h3>
            <p className="text-muted">Não há orçamentos que correspondam aos seus critérios.</p>
            <button className="btn btn-outline mt-4" onClick={() => navigate('/app/orcamentos/novo')}>
              Criar Primeiro Orçamento
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Evento</th>
                  <th>Pacote / Total</th>
                  <th>Data Criação</th>
                  <th>Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map(budget => (
                  <tr key={budget.id}>
                    <td className="td-budget">
                      <span className="budget-num">#{String(budget.budget_number).padStart(5, '0')}</span>
                    </td>
                    <td className="td-client">
                      <div className="client-info">
                        <div className="client-avatar">{(budget.client_name || '?').charAt(0)}</div>
                        <div>
                          <div className="client-name">{budget.client_name}</div>
                          <div className="client-sub">{budget.client_phone || budget.client_email || '--'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-event">
                      <div className="event-info">
                        <span className="event-name">{budget.event_type || 'Fotografia'}</span>
                        <span className="event-date">
                          <Calendar size={12} />
                          Data da festa: {formatDateBR(budget.event_date)}
                        </span>
                        <span className="event-date">
                          <MapPin size={12} />
                          Local da festa: {budget.event_location || 'A definir'}
                        </span>
                      </div>
                    </td>
                    <td className="td-package">
                      <div className="pkg-info">
                        <span className="pkg-name">{budget.selected_package_name || 'Personalizado'}</span>
                        <span className="pkg-total">R$ {Number(budget.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td className="td-created">
                      <span className="date-main">{new Date(budget.created_at).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="td-status">
                      {getStatusBadge(budget.status)}
                    </td>
                    <td className="td-actions">
                      <div className="actions-flex">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/app/orcamentos/${budget.id}`)}
                          title="Ver Detalhes"
                        >
                          <Eye size={16} /> <span>Visualizar</span>
                        </button>
                        {(budget.pdf_document_id || budget.document_id) ? (
                          <button
                            className="btn btn-outline btn-sm btn-accent-soft"
                            onClick={() => handleDownload(budget)}
                            disabled={busyBudgetId === budget.id}
                            title="Baixar PDF"
                          >
                            <Download size={16} /> <span>{busyBudgetId === budget.id ? 'Baixando...' : 'Baixar PDF'}</span>
                          </button>
                        ) : (
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleGeneratePdf(budget)}
                            disabled={busyBudgetId === budget.id}
                            title="Gerar PDF"
                          >
                            <FileText size={16} /> <span>{busyBudgetId === budget.id ? 'Gerando...' : 'Gerar PDF'}</span>
                          </button>
                        )}
                        {budget.contract_document_id && budget.status === 'approved' && (
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleDownloadContract(budget)}
                            disabled={busyBudgetId === budget.id}
                            title="Baixar Contrato"
                          >
                            <Download size={16} /> <span>{busyBudgetId === budget.id ? 'Baixando...' : 'Baixar Contrato'}</span>
                          </button>
                        )}
                        {!budget.contract_document_id && budget.status === 'approved' && (
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleGenerateContract(budget)}
                            disabled={busyBudgetId === budget.id}
                            title="Gerar Contrato"
                          >
                            <FileText size={16} /> <span>{busyBudgetId === budget.id ? 'Gerando...' : 'Gerar Contrato'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .saved-budgets-page { padding-bottom: 2rem; }
        .filters-bar { display: flex; gap: 1rem; padding: 1rem; align-items: center; }
        .search-box { position: relative; flex: 1; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-box .form-control { padding-left: 2.75rem; background-color: var(--bg-page); }
        .filter-group { display: flex; align-items: center; gap: 0.5rem; }
        .filter-group select { width: 180px; background-color: var(--bg-page); }

        .list-card { padding: 0; overflow: hidden; }
        .budget-feedback { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; border-radius: var(--radius-sm); font-weight: 700; border: 1px solid transparent; }
        .budget-feedback.success { color: #047857; background: #ecfdf5; border-color: rgba(4, 120, 87, 0.16); }
        .budget-feedback.error { color: #991b1b; background: #fef2f2; border-color: rgba(153, 27, 27, 0.16); }
        .table-responsive { width: 100%; overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: collapse; text-align: left; }
        .premium-table th { padding: 1.25rem 1.5rem; background-color: var(--bg-page); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); border-bottom: 2px solid var(--border); }
        .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .premium-table tr:hover td { background-color: rgba(212, 175, 55, 0.02); }

        .budget-num { font-family: 'Courier New', monospace; font-weight: 800; color: var(--accent); background: var(--accent-light); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; }
        .client-info { display: flex; align-items: center; gap: 0.75rem; }
        .client-avatar { width: 32px; height: 32px; background-color: var(--accent-light); color: var(--accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
        .client-name { font-weight: 700; color: var(--primary); font-size: 0.9rem; }
        .client-sub { font-size: 0.75rem; color: var(--text-muted); }

        .event-info { display: flex; flex-direction: column; gap: 2px; }
        .event-name { font-weight: 600; font-size: 0.85rem; color: var(--primary); text-transform: capitalize; }
        .event-date { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }

        .pkg-info { display: flex; flex-direction: column; gap: 2px; }
        .pkg-name { font-weight: 600; font-size: 0.85rem; }
        .pkg-total { font-weight: 700; color: var(--accent); font-size: 0.9rem; }

        .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 50px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        .status-draft { background-color: #f3f4f6; color: #6b7280; }
        .status-generated { background-color: #ebf5ff; color: #3b82f6; }
        .status-sent { background-color: #fffbeb; color: #d97706; }
        .status-approved { background-color: #ecfdf5; color: #059669; }
        .status-cancelled { background-color: #fef2f2; color: #dc2626; }

        .actions-flex { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; min-width: 220px; }
        .actions-flex .btn { white-space: nowrap; }
        .btn-accent-soft { color: var(--accent); border-color: rgba(212, 175, 55, 0.2); }
        .btn-accent-soft:hover { background-color: var(--accent-light); border-color: var(--accent); }

        @media (max-width: 992px) {
          .filters-bar { flex-direction: column; align-items: stretch; }
          .filter-group select { width: 100%; }
          .actions-flex { justify-content: flex-start; }
          .actions-flex .btn { min-height: 44px; }
        }
      `}</style>
    </div>
  );
};

export default SavedBudgets;
