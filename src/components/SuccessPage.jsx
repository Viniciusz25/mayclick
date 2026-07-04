import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Camera } from 'lucide-react';
import PublicHeader from './PublicHeader';
import CookieBanner from './CookieBanner';
import '../Home.css';

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-luxury-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <CookieBanner />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 2rem 4rem' }}>
        <div className="luxury-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '4rem 3rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '100px', height: '100px', 
              borderRadius: '50%', 
              background: 'rgba(197, 160, 89, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold)'
            }}>
              <CheckCircle size={50} />
            </div>
          </div>
          
          <h1 className="serif-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Informações Recebidas!</h1>
          
          <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '3rem' }}>
            Agradecemos por preencher sua ficha. Recebemos seus dados com sucesso e nossa equipe entrará em contato em breve para os próximos passos.
          </p>

          <button className="btn-outline-gold" onClick={() => navigate('/')} style={{ padding: '0.8rem 2rem', fontSize: '0.9rem' }}>
            <Home size={18} style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'text-bottom' }} /> 
            Voltar ao Início
          </button>
        </div>
      </main>

    </div>
  );
};

export default SuccessPage;
