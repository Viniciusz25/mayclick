import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, Camera, ClipboardList, ArrowRight, Images } from 'lucide-react';
import { getPublicPortfolio } from '../lib/apiClient';
import PublicFooter from './PublicFooter';
import CookieBanner from './CookieBanner';
import useSettings from '../hooks/useSettings';

const PortfolioPage = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    (async () => {
      try {
        const data = await getPublicPortfolio();
        setCategories(data);
      } catch (err) {
        setError('Não foi possível carregar o portfólio. Tente novamente.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleNav = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="portfolio-page">
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
              <button onClick={() => handleNav('/portfolio')} className="drawer-sublink active-sub">Ver Tudo</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => handleNav(`/portfolio/${c.slug}`)} className="drawer-sublink">{c.title}</button>
              ))}
            </div>
          </div>
          <button onClick={() => handleNav('/sobre')} className="drawer-link">Sobre Nós</button>
          <button onClick={() => handleNav('/contato')} className="drawer-link">Contato</button>
        </nav>
      </aside>

      {/* Header */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="header-left">
            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <img src="/logo.jpg" alt="Logo" className="brand-logo" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="brand-text">
                <span className="brand-name">{businessSettings?.name || 'Mayclick Photography'}</span>
                <span className="brand-sub">Fotografia e filmagem para eventos sociais</span>
              </div>
            </div>
          </div>
          {/* Acesso Admin button hidden by user request */}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="portfolio-hero">
        <div className="portfolio-hero-bg" />
        <div className="container portfolio-hero-content">
          <span className="eyebrow-white">Nosso Trabalho</span>
          <h1>Portfólio Completo</h1>
          <p>Escolha uma categoria e explore nossas galerias exclusivas de fotografia</p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="portfolio-categories-section">
        <div className="container">
          {loading && (
            <div className="portfolio-loading">
              <div className="spinner" />
              <p>Carregando categorias...</p>
            </div>
          )}

          {error && (
            <div className="portfolio-error">
              <p>{error}</p>
              <button className="btn btn-accent" onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="portfolio-empty">
              <Images size={56} strokeWidth={1} />
              <h3>Portfólio em construção</h3>
              <p>Em breve nossos trabalhos estarão disponíveis aqui.</p>
              <button className="btn btn-accent" onClick={() => navigate('/')}>Voltar ao início</button>
            </div>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="categories-masonry">
              {categories.map((cat, index) => (
                <div
                  key={cat.id}
                  className={`cat-card ${index % 5 === 0 ? 'cat-card--tall' : ''} ${index % 7 === 3 ? 'cat-card--wide' : ''}`}
                  onClick={() => navigate(`/portfolio/${cat.slug}`)}
                >
                  <div className="cat-card-img">
                    <img
                      src={cat.cover_image_url || `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80`}
                      alt={cat.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="cat-card-overlay">
                    <div className="cat-card-info">
                      <h3>{cat.title}</h3>
                      {cat.description && <p>{cat.description}</p>}
                      <span className="cat-count">
                        {cat.photo_count > 0 ? `${cat.photo_count} foto${cat.photo_count !== 1 ? 's' : ''}` : 'Ver galeria'}
                      </span>
                      <div className="cat-cta">
                        Ver Galeria <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          {!loading && !error && (
            <div className="portfolio-cta-box">
              <div>
                <h3>Gostou do que viu?</h3>
                <p>Solicite um orçamento personalizado para o seu evento.</p>
              </div>
              <button className="btn btn-accent btn-lg" onClick={() => navigate('/formulario')}>
                <ClipboardList size={20} /> Solicitar Orçamento
              </button>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .portfolio-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-page);
        }

        /* === reuse from Home === */
        .main-header {
          background-color: rgba(250, 249, 246, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-inner { height: 90px; display: flex; justify-content: space-between; align-items: center; }
        .header-left { display: flex; align-items: center; gap: 1.5rem; }
        .menu-toggle-btn { background: none; border: none; cursor: pointer; color: var(--primary); padding: 0.5rem; display: flex; align-items: center; border-radius: var(--radius); transition: var(--transition); }
        .menu-toggle-btn:hover { background: var(--secondary-light); color: var(--accent); }
        .brand { display: flex; align-items: center; gap: 1.25rem; }
        .brand-logo { width: 50px; height: 50px; object-fit: cover; border-radius: 50%; border: 2px solid var(--accent); }
        .brand-text { display: flex; flex-direction: column; }
        .brand-name { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--primary); line-height: 1; }
        .brand-sub { font-size: 0.725rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; margin-top: 4px; }

        /* side drawer */
        .side-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 998; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .side-drawer-overlay.active { opacity: 1; pointer-events: auto; }
        .side-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 320px; background: #fff; z-index: 999; box-shadow: var(--shadow-lg); transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); display: flex; flex-direction: column; padding: 2rem; }
        .side-drawer.open { transform: translateX(0); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
        .drawer-title { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800; color: var(--primary); }
        .drawer-close { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; }
        .drawer-nav { display: flex; flex-direction: column; gap: 1.5rem; }
        .drawer-link { background: none; border: none; text-align: left; font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--primary); cursor: pointer; padding: 0.5rem 0; transition: var(--transition); }
        .drawer-link:hover { color: var(--accent); padding-left: 0.25rem; }
        .drawer-category { display: flex; flex-direction: column; gap: 0.5rem; }
        .category-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 800; }
        .category-links { display: flex; flex-direction: column; gap: 0.5rem; padding-left: 1rem; border-left: 2px solid var(--border); }
        .drawer-sublink { background: none; border: none; text-align: left; font-size: 1rem; font-weight: 600; color: var(--text-muted); cursor: pointer; padding: 0.25rem 0; transition: var(--transition); }
        .drawer-sublink:hover, .drawer-sublink.active-sub { color: var(--accent); }

        /* === Portfolio Hero === */
        .portfolio-hero {
          position: relative;
          height: 380px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .portfolio-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--primary) 0%, #2a1a00 60%, #1a0f00 100%);
        }
        .portfolio-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.15) 0%, transparent 60%);
        }
        .portfolio-hero-content {
          position: relative;
          z-index: 1;
          color: #fff;
          max-width: 700px;
        }
        .eyebrow-white {
          display: inline-block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 800;
          color: var(--accent);
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.25);
          padding: 0.4rem 1rem;
          border-radius: 999px;
          margin-bottom: 1.25rem;
        }
        .portfolio-hero-content h1 {
          font-size: 3.5rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          line-height: 1.05;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .portfolio-hero-content p {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.7);
          max-width: 520px;
        }

        /* === Categories Masonry Grid === */
        .portfolio-categories-section {
          padding: 5rem 0 6rem;
        }
        .categories-masonry {
          columns: 3;
          column-gap: 1.25rem;
          margin-bottom: 4rem;
        }
        .cat-card {
          break-inside: avoid;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          margin-bottom: 1.25rem;
          display: block;
        }
        .cat-card-img {
          width: 100%;
          overflow: hidden;
        }
        .cat-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .cat-card--tall .cat-card-img img { height: 520px; }
        .cat-card:not(.cat-card--tall) .cat-card-img img { height: 320px; }
        .cat-card:hover .cat-card-img img { transform: scale(1.06); }

        .cat-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,5,0,0.92) 0%, rgba(10,5,0,0.4) 45%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem;
          transition: background 0.4s;
        }
        .cat-card:hover .cat-card-overlay {
          background: linear-gradient(to top, rgba(10,5,0,0.97) 0%, rgba(10,5,0,0.6) 55%, rgba(10,5,0,0.1) 100%);
        }
        .cat-card-info { color: #fff; }
        .cat-card-info h3 {
          font-family: var(--font-heading), 'Outfit', sans-serif;
          color: #fff;
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.35rem;
          letter-spacing: -0.01em;
        }
        .cat-card-info p {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .cat-count {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent);
          background: rgba(212,175,55,0.15);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          margin-bottom: 0.75rem;
        }
        .cat-cta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s ease;
        }
        .cat-card:hover .cat-cta {
          opacity: 1;
          transform: translateY(0);
        }

        /* === States === */
        .portfolio-loading, .portfolio-empty, .portfolio-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          padding: 6rem 2rem;
          text-align: center;
          color: var(--text-muted);
        }
        .portfolio-empty h3, .portfolio-error h3 { font-size: 1.5rem; color: var(--primary); }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(212,175,55,0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* === CTA Box === */
        .portfolio-cta-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          background: linear-gradient(135deg, var(--primary) 0%, #1e1e1e 100%);
          border-radius: 20px;
          padding: 3rem 3.5rem;
          color: #fff;
          flex-wrap: wrap;
        }
        .portfolio-cta-box h3 { font-size: 1.75rem; font-family: 'Outfit', sans-serif; margin-bottom: 0.5rem; }
        .portfolio-cta-box p { color: rgba(255,255,255,0.7); }

        /* === Responsive === */
        @media (max-width: 1024px) {
          .categories-masonry { columns: 2; }
          .portfolio-hero-content h1 { font-size: 2.75rem; }
        }
        @media (max-width: 640px) {
          .categories-masonry { columns: 1; }
          .portfolio-hero { height: 280px; }
          .portfolio-hero-content h1 { font-size: 2.25rem; }
          .portfolio-cta-box { flex-direction: column; padding: 2rem; text-align: center; }
          .header-inner { height: 72px; }
        }
      `}</style>
    </div>
  );
};

export default PortfolioPage;
