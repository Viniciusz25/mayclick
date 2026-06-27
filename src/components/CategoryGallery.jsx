import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Menu, X, LogIn, ClipboardList, ArrowLeft,
  ZoomIn, ChevronLeft, ChevronRight, Camera, Images
} from 'lucide-react';
import { getPublicCategoryGallery } from '../lib/apiClient';
import PublicFooter from './PublicFooter';
import CookieBanner from './CookieBanner';
import useSettings from '../hooks/useSettings';

/* ─── Lightbox ─── */
const Lightbox = ({ photos, index, onClose, onPrev, onNext }) => {
  const photo = photos[index];

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!photo) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}><X size={28} /></button>

      <button
        className="lightbox-nav lightbox-prev"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={index === 0}
      >
        <ChevronLeft size={36} />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={photo.image_url} alt={photo.title || 'Foto'} />
        {(photo.title || photo.description) && (
          <div className="lightbox-caption">
            {photo.title && <strong>{photo.title}</strong>}
            {photo.description && <p>{photo.description}</p>}
          </div>
        )}
      </div>

      <button
        className="lightbox-nav lightbox-next"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={index === photos.length - 1}
      >
        <ChevronRight size={36} />
      </button>

      <div className="lightbox-counter">{index + 1} / {photos.length}</div>
    </div>
  );
};

/* ─── Main Component ─── */
const CategoryGallery = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { businessSettings } = useSettings();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);   // { category, photos, allCategories }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);
    setError('');
    setData(null);
    getPublicCategoryGallery(slug)
      .then(setData)
      .catch((err) => {
        if (err.status === 404) setError('Categoria não encontrada.');
        else setError('Não foi possível carregar esta galeria.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const photos = data?.photos || [];
  const category = data?.category || {};
  const allCategories = data?.allCategories || [];

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex(i => Math.max(0, i - 1));
  const nextPhoto = () => setLightboxIndex(i => Math.min(photos.length - 1, i + 1));

  const handleNav = (path) => { setIsSidebarOpen(false); navigate(path); };

  return (
    <div className="gallery-page">
      <CookieBanner />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}

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
              {allCategories.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleNav(`/portfolio/${c.slug}`)}
                  className={`drawer-sublink ${c.slug === slug ? 'active-sub' : ''}`}
                >
                  {c.title}
                </button>
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

      {/* Category nav tabs */}
      {!loading && allCategories.length > 0 && (
        <nav className="category-tabs-bar">
          <div className="container category-tabs-inner">
            <button
              className={`cat-tab ${!slug ? 'active' : ''}`}
              onClick={() => navigate('/portfolio')}
            >
              Todas
            </button>
            {allCategories.map(c => (
              <button
                key={c.id}
                className={`cat-tab ${c.slug === slug ? 'active' : ''}`}
                onClick={() => navigate(`/portfolio/${c.slug}`)}
              >
                {c.title}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Gallery Hero */}
      {!loading && category.title && (
        <section className="gallery-hero" style={{ backgroundImage: category.cover_image_url ? `url(${category.cover_image_url})` : undefined }}>
          <div className="gallery-hero-overlay" />
          <div className="container gallery-hero-content">
            <button className="back-btn" onClick={() => navigate('/portfolio')}>
              <ArrowLeft size={18} /> Todos os Portfólios
            </button>
            <h1>{category.title}</h1>
            {category.description && <p>{category.description}</p>}
            <span className="gallery-count-badge">
              <Camera size={16} />
              {photos.length} foto{photos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </section>
      )}

      {/* Main Gallery */}
      <main className="gallery-main">
        <div className="container">
          {loading && (
            <div className="gallery-state">
              <div className="spinner" />
              <p>Carregando galeria...</p>
            </div>
          )}

          {error && (
            <div className="gallery-state">
              <Images size={52} strokeWidth={1} />
              <p style={{ color: '#ef4444' }}>{error}</p>
              <button className="btn btn-accent" onClick={() => navigate('/portfolio')}>
                Ver todos os portfólios
              </button>
            </div>
          )}

          {!loading && !error && photos.length === 0 && (
            <div className="gallery-state">
              <Camera size={56} strokeWidth={1} />
              <h3>Galeria em preparação</h3>
              <p>As fotos desta categoria serão adicionadas em breve.</p>
              <button className="btn btn-accent" onClick={() => navigate('/portfolio')}>
                Ver outros portfólios
              </button>
            </div>
          )}

          {!loading && !error && photos.length > 0 && (
            <div className="pinterest-grid">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="pin-card"
                  onClick={() => openLightbox(idx)}
                >
                  <div className="pin-img-wrap">
                    <img
                      src={photo.image_url}
                      alt={photo.title || category.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=75';
                      }}
                    />
                    <div className="pin-hover">
                      <ZoomIn size={28} />
                      {(photo.title || photo.description) && (
                        <div className="pin-info">
                          {photo.title && <span className="pin-title">{photo.title}</span>}
                          {photo.description && <span className="pin-desc">{photo.description}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {!loading && !error && (
            <div className="gallery-bottom-cta">
              <h3>Quer eternizar seus momentos assim?</h3>
              <p>Solicite um orçamento personalizado para o seu evento especial.</p>
              <button className="btn btn-accent btn-lg" onClick={() => navigate('/formulario')}>
                <ClipboardList size={20} /> Solicitar Orçamento
              </button>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />

      <style>{`
        .gallery-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-page);
        }

        /* shared header/drawer styles */
        .main-header { background: rgba(250,249,246,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
        .header-inner { height: 90px; display: flex; justify-content: space-between; align-items: center; }
        .header-left { display: flex; align-items: center; gap: 1.5rem; }
        .menu-toggle-btn { background: none; border: none; cursor: pointer; color: var(--primary); padding: 0.5rem; display: flex; border-radius: var(--radius); transition: var(--transition); }
        .menu-toggle-btn:hover { background: var(--secondary-light); color: var(--accent); }
        .brand { display: flex; align-items: center; gap: 1.25rem; }
        .brand-logo { width: 50px; height: 50px; object-fit: cover; border-radius: 50%; border: 2px solid var(--accent); }
        .brand-text { display: flex; flex-direction: column; }
        .brand-name { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--primary); line-height: 1; }
        .brand-sub { font-size: 0.725rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; margin-top: 4px; }
        .side-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 998; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .side-drawer-overlay.active { opacity: 1; pointer-events: auto; }
        .side-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 320px; background: #fff; z-index: 999; box-shadow: var(--shadow-lg); transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); display: flex; flex-direction: column; padding: 2rem; }
        .side-drawer.open { transform: translateX(0); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
        .drawer-title { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800; color: var(--primary); }
        .drawer-close { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; }
        .drawer-nav { display: flex; flex-direction: column; gap: 1.5rem; }
        .drawer-link { background: none; border: none; text-align: left; font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--primary); cursor: pointer; padding: 0.5rem 0; transition: var(--transition); }
        .drawer-link:hover { color: var(--accent); }
        .drawer-category { display: flex; flex-direction: column; gap: 0.5rem; }
        .category-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 800; }
        .category-links { display: flex; flex-direction: column; gap: 0.5rem; padding-left: 1rem; border-left: 2px solid var(--border); }
        .drawer-sublink { background: none; border: none; text-align: left; font-size: 1rem; font-weight: 600; color: var(--text-muted); cursor: pointer; padding: 0.25rem 0; transition: var(--transition); }
        .drawer-sublink:hover, .drawer-sublink.active-sub { color: var(--accent); }

        /* === Category Tab Bar === */
        .category-tabs-bar {
          background: #fff;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 90px;
          z-index: 90;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .category-tabs-inner {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0.75rem 0;
        }
        .category-tabs-inner::-webkit-scrollbar { display: none; }
        .cat-tab {
          white-space: nowrap;
          padding: 0.5rem 1.25rem;
          border-radius: 999px;
          border: 1.5px solid transparent;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-muted);
          background: none;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .cat-tab:hover { color: var(--primary); background: var(--secondary-light); }
        .cat-tab.active { color: var(--accent); border-color: var(--accent); background: var(--accent-light); }

        /* === Gallery Hero === */
        .gallery-hero {
          position: relative;
          min-height: 320px;
          background-color: var(--primary);
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          padding-bottom: 0;
          overflow: hidden;
        }
        .gallery-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,5,0,0.95) 0%, rgba(10,5,0,0.5) 50%, rgba(10,5,0,0.25) 100%);
        }
        .gallery-hero-content {
          position: relative;
          z-index: 1;
          color: #fff;
          padding-bottom: 3rem;
          padding-top: 2rem;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85);
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
        .gallery-hero-content h1 {
          font-family: var(--font-heading), 'Outfit', sans-serif;
          color: #fff;
          font-size: 3.25rem;
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .gallery-hero-content p {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.7);
          max-width: 560px;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }
        .gallery-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent);
          background: rgba(212,175,55,0.15);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 0.35rem 1rem;
          border-radius: 999px;
        }

        /* === Pinterest Masonry Grid === */
        .gallery-main { padding: 4rem 0 6rem; }

        .pinterest-grid {
          columns: 4;
          column-gap: 1rem;
          margin-bottom: 5rem;
        }
        .pin-card {
          break-inside: avoid;
          margin-bottom: 1rem;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          background: #f0ede8;
        }
        .pin-img-wrap { position: relative; display: block; }
        .pin-img-wrap img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .pin-card:hover .pin-img-wrap img { transform: scale(1.04); }

        .pin-hover {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,5,0,0.85) 0%, rgba(10,5,0,0.2) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #fff;
          padding: 1.25rem;
        }
        .pin-card:hover .pin-hover { opacity: 1; }
        .pin-hover svg { filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }

        .pin-info { text-align: center; }
        .pin-title { display: block; font-size: 0.95rem; font-weight: 700; margin-bottom: 0.25rem; }
        .pin-desc { display: block; font-size: 0.8rem; color: rgba(255,255,255,0.8); }

        /* === States === */
        .gallery-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          padding: 7rem 2rem;
          text-align: center;
          color: var(--text-muted);
        }
        .gallery-state h3 { font-size: 1.5rem; color: var(--primary); }
        .spinner { width: 48px; height: 48px; border: 4px solid rgba(212,175,55,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* === Bottom CTA === */
        .gallery-bottom-cta {
          text-align: center;
          padding: 5rem 2rem;
          background: linear-gradient(135deg, var(--primary) 0%, #1e1e1e 100%);
          border-radius: 24px;
          color: #fff;
        }
        .gallery-bottom-cta h3 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; }
        .gallery-bottom-cta p { color: rgba(255,255,255,0.7); font-size: 1.1rem; margin-bottom: 2rem; }

        /* === Lightbox === */
        .lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.96);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .lightbox-content {
          position: relative;
          max-width: min(90vw, 1200px);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .lightbox-content img {
          max-width: 100%;
          max-height: 82vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 80px rgba(0,0,0,0.8);
        }
        .lightbox-caption {
          margin-top: 1rem;
          text-align: center;
          color: rgba(255,255,255,0.85);
        }
        .lightbox-caption strong { font-size: 1rem; font-weight: 700; }
        .lightbox-caption p { font-size: 0.875rem; margin-top: 0.25rem; color: rgba(255,255,255,0.6); }
        .lightbox-close {
          position: fixed;
          top: 1.25rem;
          right: 1.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 2010;
        }
        .lightbox-close:hover { background: rgba(255,255,255,0.2); }
        .lightbox-nav {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 2010;
        }
        .lightbox-nav:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
        .lightbox-nav:disabled { opacity: 0.3; cursor: default; }
        .lightbox-prev { left: 1.5rem; }
        .lightbox-next { right: 1.5rem; }
        .lightbox-counter {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.6);
          font-size: 0.875rem;
          font-weight: 600;
          background: rgba(0,0,0,0.5);
          padding: 0.4rem 1rem;
          border-radius: 999px;
        }

        /* === Responsive === */
        @media (max-width: 1200px) { .pinterest-grid { columns: 3; } }
        @media (max-width: 768px) {
          .pinterest-grid { columns: 2; }
          .gallery-hero-content h1 { font-size: 2.5rem; }
          .category-tabs-bar { top: 72px; }
        }
        @media (max-width: 480px) {
          .pinterest-grid { columns: 2; column-gap: 0.5rem; }
          .pin-card { margin-bottom: 0.5rem; }
          .gallery-hero-content h1 { font-size: 2rem; }
          .lightbox-prev { left: 0.5rem; }
          .lightbox-next { right: 0.5rem; }
          .gallery-hero { min-height: 260px; }
        }
      `}</style>
    </div>
  );
};

export default CategoryGallery;
