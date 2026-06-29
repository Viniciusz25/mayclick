import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Eye, Trash, Search,
  Calendar, User, Package, ChevronRight,
  Filter, Download
} from 'lucide-react';

import { deleteAdminSubmission, getAdminSubmissions } from '../lib/apiClient';

const formatDateBR = (value, fallback = 'A confirmar') => {
  if (!value) return fallback;
  const text = String(value).trim();
  const isoDateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoDateOnly
    ? new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]))
    : new Date(text);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString('pt-BR');
};

const Respostas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubmissions = React.useCallback(async () => {
    try {
      const data = await getAdminSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('[Respostas] Error fetching submissions:', {
        status: err.status,
        endpoint: err.endpoint,
        details: err.details,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filteredSubmissions = submissions.filter(sub =>
    (sub.contractor_data?.fullName || sub.contractor?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.selected_package_id || sub.selectedPackageId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir a resposta de "${name}"? Ela sairá da lista principal, mas o histórico vinculado será preservado.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteAdminSubmission(id);
      setSubmissions(prev => prev.filter(s => s.id !== id));
      await fetchSubmissions();
      alert('Resposta excluída com sucesso.');
    } catch (err) {
      console.error('[Respostas] Error deleting submission:', {
        status: err.status,
        endpoint: err.endpoint,
        details: err.details,
      });
      const apiMessage = err.details?.error || err.details?.message || err.message;
      alert(`Não foi possível excluir a resposta (${err.status || 'sem status'}). ${apiMessage || ''}`.trim());
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="respostas-page fade-in">
      <header className="page-header mb-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="badge badge-accent mb-1">Administrativo</span>
            <h1>Respostas do Formulário</h1>
            <p className="text-muted">Gerencie as informações enviadas pelos clientes via site.</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nome ou pacote..."
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="card list-card">
        {filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <Search size={48} className="text-muted" style={{opacity: 0.2, marginBottom: '1rem'}} />
            <h3>Nenhuma resposta encontrada</h3>
            <p className="text-muted">Tente ajustar sua busca ou aguarde novos envios.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Nº Orçamento</th>
                  <th>Recebimento</th>
                  <th>Cliente</th>
                  <th>Evento</th>
                  <th>Pacote Selecionado</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(sub => {
                  const contractor = sub.contractor_data || sub.contractor || {};
                  const event = sub.event_data || sub.event || {};
                  const createdAt = sub.created_at || sub.createdAt;
                  const pkgId = sub.selected_package_id || sub.selectedPackageId;
                  const fullName = contractor.fullName || 'Sem nome';

                  return (
                    <tr key={sub.id}>
                      <td className="td-budget">
                        <span className="budget-num">#{sub.budget_number ? String(sub.budget_number).padStart(5, '0') : String(sub.id.slice(-5)).toUpperCase()}</span>
                      </td>
                      <td className="td-date">
                        <span className="date-main">{new Date(createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="date-sub">{new Date(createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="td-client">
                        <div className="client-info">
                          <div className="client-avatar">{(fullName || '?').charAt(0)}</div>
                          <div>
                            <div className="client-name">{fullName}</div>
                            <div className="client-phone">{contractor.phone1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="td-event">
                        <div className="event-info">
                          <span className="event-name">{event.celebrantsName || 'Não informado'}</span>
                          <span className="event-date">
                            <Calendar size={12} />
                            {formatDateBR(event.date)}
                          </span>
                        </div>
                      </td>
                      <td className="td-package">
                        <span className="package-tag">{pkgId}</span>
                      </td>
                      <td className="td-actions">
                        <div className="actions-flex">
                          <button
                            className="btn btn-outline btn-sm"
                            title="Ver Detalhes"
                            onClick={() => navigate(`/app/respostas/${sub.id}`)}
                          >
                            <Eye size={16} /> Detalhes
                          </button>
                          <button
                            className="btn btn-outline btn-sm btn-danger-soft"
                            title="Excluir"
                            onClick={() => handleDelete(sub.id, fullName)}
                            disabled={deletingId === sub.id}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .respostas-page {
          padding-bottom: 2rem;
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-box .form-control {
          padding-left: 3rem;
          background-color: #fff;
        }

        .list-card {
          padding: 0;
          overflow: hidden;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .premium-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .premium-table th {
          padding: 1.25rem 1.5rem;
          background-color: var(--bg-page);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          border-bottom: 2px solid var(--border);
        }

        .premium-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .premium-table tr:last-child td {
          border-bottom: none;
        }

        .premium-table tr:hover td {
          background-color: rgba(212, 175, 55, 0.02);
        }

        /* TD Customizations */
        .budget-num { font-family: 'Courier New', monospace; font-weight: 800; color: var(--accent); background: var(--accent-light); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; }

        .td-date { display: flex; flex-direction: column; gap: 0.25rem; }
        .date-main { font-weight: 700; color: var(--primary); font-size: 0.9375rem; }
        .date-sub { font-size: 0.75rem; color: var(--text-muted); }

        .client-info { display: flex; align-items: center; gap: 0.75rem; }
        .client-avatar {
          width: 36px;
          height: 36px;
          background-color: var(--accent-light);
          color: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        .client-name { font-weight: 700; color: var(--primary); }
        .client-phone { font-size: 0.8rem; color: var(--text-muted); }

        .event-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .event-name { font-weight: 600; font-size: 0.875rem; }
        .event-date { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem; }

        .package-tag {
          padding: 0.25rem 0.75rem;
          background-color: var(--primary);
          color: #fff;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .actions-flex { display: flex; justify-content: center; gap: 0.5rem; }
        .btn-danger-soft { color: var(--error); border-color: rgba(197, 48, 48, 0.2); }
        .btn-danger-soft:hover { background-color: #FFF5F5; border-color: var(--error); }

        .empty-state { padding: 4rem 2rem; text-align: center; }

        @media (max-width: 768px) {
          .header-actions { margin-top: 1rem; width: 100%; }
          .search-box { width: 100%; }
          .flex.justify-between.items-end { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};

export default Respostas;
