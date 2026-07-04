import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';
import '../Home.css';

const LegalPageLayout = ({ title, lastUpdated, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-luxury-wrapper">
      <PublicHeader />

      <main className="luxury-inner-page" style={{ paddingTop: '100px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#888', marginBottom: '2rem' }}>
            <Link to="/" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Home size={14} /> Início
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--gold)' }}>{title}</span>
          </div>

          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              background: 'none', border: 'none', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.5rem', 
              marginBottom: '2rem', cursor: 'pointer', fontSize: '0.9rem' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <article className="luxury-card">
            <header style={{ marginBottom: '3rem', borderBottom: '1px solid #222', paddingBottom: '2rem' }}>
              <h1 className="serif-title" style={{ fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>{title}</h1>
              {lastUpdated && <p style={{ color: '#666', fontSize: '0.9rem' }}>Última atualização: {lastUpdated}</p>}
            </header>

            <div className="legal-content-body" style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1rem' }}>
              {children}
            </div>
          </article>
        </div>
      </main>

      <PublicFooter />

      <style>{`
        .legal-content-body h1, .legal-content-body h2, .legal-content-body h3 {
          color: #fff;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-family: 'Playfair Display', serif;
        }
        .legal-content-body p {
          margin-bottom: 1.5rem;
        }
        .legal-content-body ul, .legal-content-body ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .legal-content-body li {
          margin-bottom: 0.5rem;
        }
        .legal-content-body a {
          color: var(--gold);
          text-decoration: none;
        }
        .legal-content-body a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LegalPageLayout;
