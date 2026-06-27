import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, ArrowRight, Camera } from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <div className="success-card fade-in">
        <div className="success-icon">
          <CheckCircle size={60} />
        </div>
        
        <h1 className="mb-2">Informações Recebidas!</h1>
        <p className="text-muted mb-4">
          Agradecemos por preencher sua ficha. Recebemos seus dados com sucesso e nossa equipe entrará em contato em breve para os próximos passos.
        </p>

        <div className="success-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <Home size={18} /> Voltar ao Início
          </button>
        </div>

        <div className="success-footer">
          <div className="brand-minimal">
            <Camera size={16} className="text-accent" />
            <span>Mayclick Photography</span>
          </div>
        </div>
      </div>

      <style>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-page);
          padding: 2rem;
        }
        
        .success-card {
          background-color: #fff;
          border-radius: var(--radius);
          padding: 4rem 2rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        
        .success-icon {
          width: 100px;
          height: 100px;
          background-color: var(--accent-light);
          color: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
        }
        
        .success-actions {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
        }
        
        .success-footer {
          margin-top: 4rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }
        
        .brand-minimal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;
