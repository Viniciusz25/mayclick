import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import useSettings from '../hooks/useSettings';
import PublicFooter from './PublicFooter';
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
    window.scrollTo(0, 0);
  }, []);

  const handleNav = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: 'var(--primary)' }}>Carregando História...</div>;
  }

  const s = homeData?.settings || {};
  const ytId = getYouTubeId(s.about_video_url);

  return (
    <div className="about-page">
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
                <span className="brand-name">{businessSettings?.name || s.company_name || 'Mayclick Photography'}</span>
                <span className="brand-sub">Fotografia e filmagem para eventos sociais</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ABOUT HERO */}
      <section className="about-hero" style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${s.about_page_hero_image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1920&q=80'})`
      }}>
        <div className="container">
          <h1>Nossa História</h1>
          <p>
            Conheça mais sobre a {businessSettings?.name || s.company_name || "Mayclick Photography"} e nossa paixão por eternizar momentos inesquecíveis.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="about-main">
        <div className="container" style={{ maxWidth: '900px' }}>
          
          {/* THE STORY */}
          <div className="about-story">
            {s.about_page_text ? (
              <div className="about-text-content">
                {s.about_page_text}
              </div>
            ) : (
              <div className="about-empty">
                A história da empresa ainda não foi adicionada. Acesse o painel de administração para contar sua história!
              </div>
            )}
          </div>

          {/* VIDEO SECTION */}
          {(ytId || s.about_video_url) && (
            <div className="about-video">
              {ytId ? (
                <div className="video-responsive">
                  <iframe 
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
                    title="Apresentação" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
              ) : s.about_video_url ? (
                <video 
                  src={s.about_video_url}
                  controls
                  style={{ width: '100%', display: 'block' }}
                />
              ) : null}
            </div>
          )}

          {/* GALLERY SECTION */}
          {(s.about_page_gallery_1 || s.about_page_gallery_2 || s.about_page_gallery_3) && (
            <div className="about-gallery">
              <div className="section-header-centered">
                <span className="eyebrow">Bastidores</span>
                <h2>Nossa Equipe em Ação</h2>
              </div>
              <div className="about-gallery-grid">
                {s.about_page_gallery_1 && (
                  <img src={s.about_page_gallery_1} alt="Bastidores 1" />
                )}
                {s.about_page_gallery_2 && (
                  <img src={s.about_page_gallery_2} alt="Bastidores 2" />
                )}
                {s.about_page_gallery_3 && (
                  <img src={s.about_page_gallery_3} alt="Bastidores 3" />
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CTA Final */}
      <section className="about-cta">
        <div className="container cta-inner">
          <h2>Vamos contar a SUA história?</h2>
          <p>
            Solicite seu orçamento e descubra como podemos eternizar seu momento especial.
          </p>
          <button className="btn btn-accent btn-lg cta-btn" onClick={() => navigate('/formulario')}>
            Solicitar Orçamento <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .about-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-page);
        }

        /* --- Header & Sidebar --- */
        .main-header {
          background-color: rgba(250, 249, 246, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .menu-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--primary);
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          border-radius: var(--radius);
        }

        .menu-toggle-btn:hover {
          background-color: var(--secondary-light);
          color: var(--accent);
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
          border: 2px solid var(--accent);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .brand-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Side Drawer */
        .side-drawer-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .side-drawer-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        .side-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 320px;
          background-color: #fff;
          z-index: 999;
          box-shadow: var(--shadow-lg);
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          padding: 2rem;
        }

        .side-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }

        .drawer-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
        }

        .drawer-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 0.25rem;
          transition: var(--transition);
        }

        .drawer-close:hover {
          color: var(--primary);
        }

        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .drawer-link {
          background: none;
          border: none;
          text-align: left;
          font-family: 'Outfit', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary);
          cursor: pointer;
          padding: 0.5rem 0;
          transition: var(--transition);
          border-bottom: 1px solid transparent;
        }

        .drawer-link:hover {
          color: var(--accent);
          padding-left: 0.25rem;
        }

        .drawer-category {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .category-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .category-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-left: 0.5rem;
        }

        .drawer-sublink {
          background: none;
          border: none;
          text-align: left;
          font-size: 1rem;
          color: var(--text-main);
          cursor: pointer;
          padding: 0.25rem 0;
          transition: var(--transition);
          font-weight: 500;
        }

        .drawer-sublink:hover, .drawer-sublink.active-sub {
          color: var(--accent);
        }

        /* --- About Page Specifics --- */
        .about-hero {
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          padding: 8rem 0 6rem;
          text-align: center;
          color: #fff;
        }

        .about-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          font-weight: bold;
          font-family: 'Outfit', sans-serif;
          color: #ffffff;
        }

        .about-hero p {
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto;
          opacity: 0.9;
          color: #ffffff;
        }

        .about-main {
          padding: 5rem 0;
        }

        .about-story {
          margin-bottom: 5rem;
        }

        .about-text-content {
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-color);
          white-space: pre-wrap;
          text-align: justify;
        }

        .about-empty {
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-color);
          text-align: center;
          font-style: italic;
        }

        .about-video {
          margin-bottom: 5rem;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .video-responsive {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
        }

        .video-responsive iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .about-gallery {
          margin-bottom: 4rem;
        }

        .section-header-centered {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header-centered .eyebrow {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .section-header-centered h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          color: var(--primary);
        }

        .about-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .about-gallery-grid img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 0.75rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }

        .about-gallery-grid img:hover {
          transform: scale(1.02);
        }

        .about-cta {
          padding: 6rem 0;
          background-color: var(--primary);
          color: #fff;
          text-align: center;
        }

        .about-cta h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-family: 'Outfit', sans-serif;
          color: #ffffff;
        }

        .about-cta p {
          font-size: 1.2rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
          color: #ffffff;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          padding: 1rem 2.5rem;
        }

        @media (max-width: 768px) {
          .about-hero h1 { font-size: 2.5rem; }
          .about-hero p { font-size: 1.1rem; }
          .about-cta h2 { font-size: 2rem; }
          .about-gallery-grid img { height: 250px; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
