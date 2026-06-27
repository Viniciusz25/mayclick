import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Settings, User, ArrowRight,
  Camera, Clock, Calculator, ClipboardList,
  CheckCircle, PlusCircle
} from 'lucide-react';

import { getAdminSubmissions, getBudgetsStats } from '../lib/apiClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = React.useState([]);
  const [budgetStats, setBudgetStats] = React.useState({ total: 0, active: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsData, statsData] = await Promise.all([
          getAdminSubmissions(),
          getBudgetsStats()
        ]);
        setSubmissions(subsData);
        setBudgetStats(statsData);
      } catch (err) {
        console.error('[Dashboard] Error fetching:', {
          status: err.status,
          endpoint: err.endpoint,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentSubmissions = submissions.slice(0, 5);
  const submissionsToday = submissions.filter(s => {
    const date = s.created_at || s.createdAt;
    return new Date(date).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="dashboard-content fade-in">
      <header className="dashboard-header mb-4">
        <div className="welcome-area">
          <span className="badge badge-accent mb-1">Painel Administrativo</span>
          <h1>Bem-vindo ao Painel</h1>
          <p className="text-muted">Acompanhe as respostas dos seus clientes e gerencie seu negócio.</p>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="stats-grid mb-4">
        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-olive">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Respostas</span>
            <span className="stat-value">{submissions.length}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-gold">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Recebidas Hoje</span>
            <span className="stat-value">{submissionsToday}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper bg-dark">
            <Calculator size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Orçamentos Ativos</span>
            <span className="stat-value">{budgetStats.active}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* RECENT SUBMISSIONS */}
        <section className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title" style={{margin: 0, border: 'none'}}>
              <Clock size={20} className="text-accent" /> Respostas Recentes
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/respostas')}>
              Ver Todas <ArrowRight size={14} />
            </button>
          </div>

          <div className="recent-list">
            {recentSubmissions.length === 0 ? (
              <div className="empty-state">
                <FileText size={40} className="text-muted" style={{opacity: 0.3}} />
                <p className="text-muted mt-2">Nenhuma resposta recebida ainda.</p>
              </div>
            ) : (
              recentSubmissions.map(sub => {
                const contractor = sub.contractor_data || sub.contractor || {};
                const createdAt = sub.created_at || sub.createdAt;
                const pkgId = sub.selected_package_id || sub.selectedPackageId;

                return (
                  <div key={sub.id} className="recent-item" onClick={() => navigate(`/app/respostas/${sub.id}`)}>
                    <div className="recent-avatar">
                      {(contractor.fullName || '?').charAt(0)}
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{contractor.fullName || 'Sem nome'}</span>
                      <span className="recent-meta">
                        {new Date(createdAt).toLocaleDateString('pt-BR')} • {pkgId}
                      </span>
                    </div>
                    <ArrowRight size={16} className="recent-arrow" />
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="card">
          <h2 className="section-title">
            <Settings size={20} className="text-accent" /> Atalhos Rápidos
          </h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/app/orcamentos')}>
              <div className="action-icon"><PlusCircle size={24} /></div>
              <div className="action-text">
                <span className="action-title">Novo Orçamento</span>
                <span className="action-desc">Cálculo manual e PDF</span>
              </div>
            </button>

            <button className="action-btn" onClick={() => navigate('/app/respostas')}>
              <div className="action-icon"><FileText size={24} /></div>
              <div className="action-text">
                <span className="action-title">Ver Respostas</span>
                <span className="action-desc">Fichas enviadas</span>
              </div>
            </button>

            <button className="action-btn" onClick={() => navigate('/app/configuracoes-negocio')}>
              <div className="action-icon"><Settings size={24} /></div>
              <div className="action-text">
                <span className="action-title">Editar Valores</span>
                <span className="action-desc">Pacotes e serviços</span>
              </div>
            </button>

            <button className="action-btn" onClick={() => navigate('/')}>
              <div className="action-icon"><Camera size={24} /></div>
              <div className="action-text">
                <span className="action-title">Visualizar Site</span>
                <span className="action-desc">Home pública</span>
              </div>
            </button>
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-header {
          padding: 1.5rem 0;
          margin-bottom: 2.5rem;
        }

        .welcome-area h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .stat-card {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.75rem;
          border-radius: var(--radius);
        }

        .stat-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 8px 15px rgba(0,0,0,0.05);
        }

        .bg-olive { background-color: var(--secondary); }
        .bg-gold { background-color: var(--accent); }
        .bg-dark { background-color: var(--primary); }

        .stat-label {
          display: block;
          font-size: 0.8125rem;
          text-transform: uppercase;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-bottom: 0.375rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }

        /* Recent List */
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recent-item {
          padding: 1.25rem;
          background-color: var(--bg-page);
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .recent-item:hover {
          background-color: #fff;
          border-color: var(--accent);
          transform: translateX(6px);
          box-shadow: var(--shadow-md);
        }

        .recent-avatar {
          width: 48px;
          height: 48px;
          background-color: var(--accent-light);
          color: var(--accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          text-transform: uppercase;
        }

        .recent-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .recent-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--primary);
        }

        .recent-meta {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .recent-arrow {
          color: var(--text-muted);
          opacity: 0.4;
        }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
        }

        /* Quick Actions */
        .actions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        .action-btn {
          background-color: var(--bg-page);
          border: 1px solid var(--border);
          padding: 1.5rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          width: 100%;
        }

        .action-btn:hover {
          background-color: #fff;
          border-color: var(--accent);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .action-icon {
          width: 54px;
          height: 54px;
          background-color: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .action-title {
          display: block;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--primary);
          margin-bottom: 2px;
        }

        .action-desc {
          display: block;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        @media (max-width: 992px) {
          .stats-grid { grid-template-columns: 1fr; gap: 1.25rem; }
          .stat-card { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
