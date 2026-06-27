import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import PublicFooter from './PublicFooter';

const LegalPageLayout = ({ title, lastUpdated, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-wrapper">
      <header className="legal-header">
        <div className="legal-nav-container">
          <Link to="/" className="brand-legal">
            <img src="/logo.jpg" alt="Logo" />
            <span>Mayclick Photography</span>
          </Link>
          <div className="breadcrumb">
            <Link to="/"><Home size={14} /> Início</Link>
            <ChevronRight size={14} />
            <span className="current">{title}</span>
          </div>
        </div>
      </header>

      <main className="legal-main">
        <div className="legal-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <article className="legal-card fade-in">
            <header className="legal-article-header">
              <h1>{title}</h1>
              {lastUpdated && <p className="last-updated">Última atualização: {lastUpdated}</p>}
            </header>

            <div className="legal-content-body">
              {children}
            </div>
          </article>
        </div>
      </main>

      <PublicFooter />

      <style>{`
        .legal-page-wrapper {
          background-color: #fafafa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .legal-header {
          background-color: #fff;
          border-bottom: 1px solid var(--border);
          padding: 1.5rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .legal-nav-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand-legal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--primary);
          font-weight: 800;
        }

        .brand-legal img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid var(--accent);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .breadcrumb a {
          color: inherit;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .breadcrumb .current {
          color: var(--accent);
          font-weight: 700;
        }

        .legal-main {
          flex: 1;
          padding: 3rem 0;
        }

        .legal-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .back-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: 2rem;
          transition: var(--transition);
        }

        .back-btn:hover {
          color: var(--accent);
          transform: translateX(-4px);
        }

        .legal-card {
          background-color: #fff;
          border-radius: 20px;
          padding: 4rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
        }

        .legal-article-header {
          margin-bottom: 3rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 2rem;
        }

        .legal-article-header h1 {
          font-size: 2.5rem;
          color: var(--primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .last-updated {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .legal-content-body {
          color: #444;
          line-height: 1.8;
          font-size: 1.0625rem;
        }

        .legal-content-body h3 {
          color: var(--primary);
          font-size: 1.25rem;
          margin: 2.5rem 0 1rem 0;
          font-weight: 800;
        }

        .legal-content-body p {
          margin-bottom: 1.5rem;
        }

        .legal-content-body ul {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }

        .legal-content-body li {
          margin-bottom: 0.75rem;
        }

        .legal-content-body strong {
          color: var(--primary);
        }

        .legal-content-body a {
          color: var(--accent);
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .legal-card {
            padding: 2.5rem 1.5rem;
          }
          .legal-article-header h1 {
            font-size: 1.875rem;
          }
          .legal-header {
            padding: 1rem 0;
          }
          .breadcrumb {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LegalPageLayout;
