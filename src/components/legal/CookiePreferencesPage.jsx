import React, { useState, useEffect } from 'react';
import LegalPageLayout from '../LegalPageLayout';
import { Save, Shield, BarChart3, Target, Share2, Check } from 'lucide-react';

const CookiePreferencesPage = () => {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    thirdParty: false
  });
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('mayclick_cookie_consent');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    const updated = {
      ...preferences,
      essential: true, // Always true
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('mayclick_cookie_consent', JSON.stringify(updated));
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const toggle = (key) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <LegalPageLayout title="Preferências de Cookies">
      <p className="mb-6">
        Gerencie como utilizamos cookies e tecnologias semelhantes em nossa plataforma.
        Suas escolhas serão salvas neste navegador.
      </p>

      <div className="preferences-list">
        {/* ESSENTIAL */}
        <div className="pref-item essential">
          <div className="pref-icon">
            <Shield size={24} />
          </div>
          <div className="pref-info">
            <div className="pref-header">
              <h3>Cookies Essenciais</h3>
              <span className="badge badge-required">Sempre Ativos</span>
            </div>
            <p>Necessários para o funcionamento básico do site, segurança, gerenciamento de rede e acessibilidade. Sem estes cookies, o site não funciona corretamente.</p>
          </div>
          <div className="pref-toggle disabled">
            <div className="toggle-track active">
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className={`pref-item ${preferences.analytics ? 'active' : ''}`} onClick={() => toggle('analytics')}>
          <div className="pref-icon">
            <BarChart3 size={24} />
          </div>
          <div className="pref-info">
            <div className="pref-header">
              <h3>Cookies de Análise</h3>
              <span className="badge">Opcional</span>
            </div>
            <p>Ajudam-nos a entender como os visitantes interagem com o site, coletando e relatando informações anonimamente para melhorar nossa plataforma.</p>
          </div>
          <div className="pref-toggle">
            <div className={`toggle-track ${preferences.analytics ? 'active' : ''}`}>
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>

        {/* MARKETING */}
        <div className={`pref-item ${preferences.marketing ? 'active' : ''}`} onClick={() => toggle('marketing')}>
          <div className="pref-icon">
            <Target size={24} />
          </div>
          <div className="pref-info">
            <div className="pref-header">
              <h3>Cookies de Marketing</h3>
              <span className="badge">Opcional</span>
            </div>
            <p>Utilizados para rastrear visitantes em sites. A intenção é exibir anúncios relevantes e envolventes para o usuário individual.</p>
          </div>
          <div className="pref-toggle">
            <div className={`toggle-track ${preferences.marketing ? 'active' : ''}`}>
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>

        {/* THIRD PARTY */}
        <div className={`pref-item ${preferences.thirdParty ? 'active' : ''}`} onClick={() => toggle('thirdParty')}>
          <div className="pref-icon">
            <Share2 size={24} />
          </div>
          <div className="pref-info">
            <div className="pref-header">
              <h3>Cookies de Terceiros</h3>
              <span className="badge">Opcional</span>
            </div>
            <p>Cookies de serviços de terceiros (como mapas, vídeos incorporados ou widgets de redes sociais) que podem rastrear seu uso desses recursos.</p>
          </div>
          <div className="pref-toggle">
            <div className={`toggle-track ${preferences.thirdParty ? 'active' : ''}`}>
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>
      </div>

      <div className="pref-actions mt-8">
        <button
          className={`btn btn-accent btn-lg ${saveStatus === 'success' ? 'btn-success' : ''}`}
          onClick={handleSave}
        >
          {saveStatus === 'success' ? (
            <><Check size={20} /> Preferências Salvas!</>
          ) : (
            <><Save size={20} /> Salvar Minhas Preferências</>
          )}
        </button>
      </div>

      <style>{`
        .preferences-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .pref-item {
          display: flex;
          gap: 1.5rem;
          padding: 2rem;
          background-color: var(--bg-page);
          border-radius: 16px;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: var(--transition);
        }

        .pref-item:hover {
          border-color: var(--accent);
          background-color: #fff;
          box-shadow: var(--shadow-sm);
        }

        .pref-item.essential {
          cursor: default;
          background-color: #f9f9f9;
        }

        .pref-item.active {
          border-color: var(--accent);
          background-color: #fff;
        }

        .pref-icon {
          width: 54px;
          height: 54px;
          background-color: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .pref-info {
          flex: 1;
        }

        .pref-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .pref-header h3 {
          margin: 0 !important;
          font-size: 1.125rem !important;
        }

        .badge {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          background-color: #eee;
          padding: 3px 8px;
          border-radius: 6px;
          color: var(--text-muted);
        }

        .badge-required {
          background-color: var(--accent);
          color: var(--primary);
        }

        .pref-info p {
          font-size: 0.875rem !important;
          color: var(--text-muted);
          margin: 0 !important;
        }

        .pref-toggle {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .toggle-track {
          width: 48px;
          height: 24px;
          background-color: #ddd;
          border-radius: 12px;
          position: relative;
          transition: var(--transition);
        }

        .toggle-track.active {
          background-color: var(--accent);
        }

        .toggle-thumb {
          width: 18px;
          height: 18px;
          background-color: #fff;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: var(--transition);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .active .toggle-thumb {
          left: 27px;
        }

        .pref-toggle.disabled {
          opacity: 0.6;
        }

        .pref-actions {
          display: flex;
          justify-content: center;
        }

        .btn-success {
          background-color: #10b981 !important;
          border-color: #10b981 !important;
        }
      `}</style>
    </LegalPageLayout>
  );
};

export default CookiePreferencesPage;
