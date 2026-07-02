import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import useSettings from '../hooks/useSettings';
import CookieBanner from './CookieBanner';
import { getPublicHomeData } from '../lib/apiClient';

const AboutPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { businessSettings } = useSettings();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await getPublicHomeData();
        setHomeData(data);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleNav = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  if (loading) {
    return <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: 'var(--primary)' }}>Carregando História...</div>;
  }

  const s = homeData?.settings || {};

  return (
    <div className="about-split-page">
      <CookieBanner />

      {/* Side Drawer */}
      <div className={`side-drawer-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`side-drawer ${isSidebarOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">Menu Principal</span>
          <button className="drawer-close" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="drawer-nav">
          <button onClick={() => handleNav('/')} className="drawer-link">Início</button>
          <div className="drawer-category">
            <span className="category-label">Portfólio</span>
            <div className="category-links">
              <button onClick={() => handleNav('/portfolio')} className="drawer-sublink">Ver Tudo</button>
            </div>
          </div>
          <button onClick={() => handleNav('/sobre')} className="drawer-link active-sub" style={{ color: 'var(--accent)' }}>Quem Somos</button>
          <button onClick={() => handleNav('/formulario')} className="drawer-link">Contato</button>
        </nav>
      </aside>

      {/* Split Layout Container */}
      <div className="split-container">
        
        {/* Left/Top: Image Column */}
        <div className="split-image" style={{ 
          backgroundImage: `url(${s.about_page_hero_image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1920&q=80'})`
        }}>
          {/* Header over the image */}
          <header className="split-header">
            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} color="#fff" />
            </button>
            <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <img src="/logo.jpg" alt="Logo" className="brand-logo" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="brand-text">
                <span className="brand-name">{businessSettings?.name || s.company_name || 'Mayclick Photography'}</span>
              </div>
            </div>
          </header>
        </div>

        {/* Right/Bottom: Content Column */}
        <div className="split-content">
          <div className="split-text-box fade-in">
            <span className="eyebrow">Quem Somos</span>
            <h1>Nossa História</h1>
            <div className="story-text">
              {s.about_page_text ? (
                <p>{s.about_page_text}</p>
              ) : (
                <p>A história da empresa ainda não foi adicionada. Acesse o painel de administração para contar sua história!</p>
              )}
            </div>
            
            <button className="btn btn-accent btn-lg cta-btn mt-4" onClick={() => navigate('/formulario')}>
              Solicitar Orçamento <ArrowRight size={20} />
            </button>
          </div>
        </div>

      </div>

      <style>{`
        /* Global Reset for this page */
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden; /* Prevent scrolling */
        }

        .about-split-page {
          height: 100vh;
          width: 100vw;
          background-color: var(--bg-page);
          overflow: hidden;
        }

        .split-container {
          display: flex;
          height: 100vh;
          width: 100%;
        }

        /* --- Image Column --- */
        .split-image {
          flex: 1;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        /* Gradient overlay to make header visible */
        .split-image::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 150px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Header overlaid on image */
        .split-header {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          z-index: 10;
        }

        .menu-toggle-btn {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border-radius: var(--radius);
        }

        .menu-toggle-btn:hover {
          background: rgba(0,0,0,0.6);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
        }

        .brand-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          color: #fff;
        }

        .brand-name {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 1.2rem;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        /* --- Content Column --- */
        .split-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 4rem;
          background-color: var(--bg-page);
          overflow-y: auto; /* Allows scrolling only inside text if it's too long */
        }

        .split-text-box {
          max-width: 600px;
          width: 100%;
        }

        .eyebrow {
          color: var(--accent);
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          display: block;
        }

        .split-text-box h1 {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          color: var(--primary);
          margin-bottom: 2rem;
          line-height: 1.1;
        }

        .story-text {
          font-size: 1.1rem;
          color: var(--text-color);
          line-height: 1.8;
          white-space: pre-wrap; /* Preserves line breaks from the database */
          margin-bottom: 2.5rem;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .split-container {
            flex-direction: column;
          }
          
          .split-image {
            flex: 0 0 40vh; /* Takes 40% of height on mobile */
          }

          .split-content {
            flex: 1;
            padding: 2rem;
            justify-content: flex-start;
          }

          .split-text-box h1 {
            font-size: 2.5rem;
          }
          
          /* Allow scrolling on mobile since content might be too tall */
          html, body {
            overflow: auto;
          }
          .about-split-page {
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
        }

        /* Reusing sidebar styles from original file */
        .side-drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 999;
        }
        .side-drawer-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        .side-drawer {
          position: fixed;
          top: 0; left: -300px;
          width: 300px;
          height: 100vh;
          background: var(--bg-surface);
          z-index: 1000;
          transition: all 0.3s ease;
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }
        .side-drawer.open {
          left: 0;
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .drawer-title {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--primary);
        }
        .drawer-close {
          background: none; border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .drawer-nav {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .drawer-link {
          background: none; border: none;
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          color: var(--primary);
          cursor: pointer;
          border-radius: var(--radius);
          transition: all 0.2s ease;
        }
        .drawer-link:hover {
          background: var(--bg-hover);
        }
        .drawer-category {
          margin: 0.5rem 0;
        }
        .category-label {
          display: block;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .drawer-sublink {
          background: none; border: none;
          text-align: left;
          padding: 0.5rem 1rem 0.5rem 2rem;
          font-size: 0.95rem;
          color: var(--text-color);
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
        }
        .drawer-sublink:hover {
          color: var(--accent);
        }
        .mt-4 { margin-top: 1rem; }
      `}</style>
    </div>
  );
};

export default AboutPage;
