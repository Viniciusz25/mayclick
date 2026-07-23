import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { getPublicAlbumGallery } from '../lib/apiClient';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';
import CookieBanner from './CookieBanner';
import '../Home.css';

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
      <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={index === 0}>
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
      <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }} disabled={index === photos.length - 1}>
        <ChevronRight size={36} />
      </button>
      <div className="lightbox-counter">{index + 1} / {photos.length}</div>
    </div>
  );
};

/* ─── Main Component ─── */
const AlbumGallery = () => {
  const { catSlug, albumSlug } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);
    setError('');
    setData(null);
    getPublicAlbumGallery(catSlug, albumSlug)
      .then(setData)
      .catch((err) => {
        if (err.status === 404) setError('Álbum não encontrado.');
        else setError('Não foi possível carregar esta galeria.');
      })
      .finally(() => setLoading(false));
  }, [catSlug, albumSlug]);

  const photos = data?.photos || [];
  const album = data?.album || {};
  const category = data?.category || {};
  const allCategories = data?.allCategories || [];

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex(i => Math.max(0, i - 1));
  const nextPhoto = () => setLightboxIndex(i => Math.min(photos.length - 1, i + 1));

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505', color: 'var(--gold)' }}>Carregando Evento...</div>;
  }

  return (
    <div className="home-luxury-wrapper">
      <PublicHeader />
      <CookieBanner />

      <main className="luxury-inner-page" style={{ paddingTop: '75px' }}>
        
        {/* Album Hero */}
        <section style={{
          position: 'relative',
          minHeight: '300px',
          backgroundImage: `url(${album.cover_image_url || category.cover_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.3) 100%)' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '3rem', paddingTop: '4rem', width: '100%' }}>
            <button 
              onClick={() => navigate(`/portfolio/${category.slug}`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px',
                fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem'
              }}
            >
              <ArrowLeft size={16} /> Voltar para {category.title || 'Categoria'}
            </button>
            <h1 className="serif-title" style={{ fontSize: '3.5rem', color: '#fff', marginBottom: '1rem' }}>{album.title || 'Evento'}</h1>
          </div>
        </section>

        {/* Tab Bar (Category Nav) */}
        <div style={{ background: '#0a0a0a', borderBottom: '1px solid #222', position: 'sticky', top: 0, zIndex: 90 }}>
          <div className="container" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 2rem', scrollbarWidth: 'none' }}>
            <button 
              className="cat-tab"
              onClick={() => navigate('/portfolio')}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
            >
              Ver Tudo
            </button>
            {allCategories.map(c => (
              <button 
                key={c.id}
                onClick={() => navigate(`/portfolio/${c.slug}`)}
                style={{
                  background: c.slug === catSlug ? 'rgba(197, 160, 89, 0.1)' : 'none',
                  border: `1px solid ${c.slug === catSlug ? 'var(--gold)' : 'transparent'}`,
                  color: c.slug === catSlug ? 'var(--gold)' : '#888',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap',
                  transition: 'all 0.3s'
                }}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <section className="container" style={{ padding: '4rem 2rem' }}>
          {error && <div style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</div>}
          
          {!loading && !error && photos.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', padding: '4rem 0' }}>Nenhuma foto adicionada neste evento.</div>
          )}

          <div style={{ columns: window.innerWidth > 992 ? 4 : window.innerWidth > 768 ? 3 : 2, columnGap: '1rem' }}>
            {photos.map((photo, idx) => (
              <div 
                key={photo.id}
                onClick={() => openLightbox(idx)}
                style={{
                  breakInside: 'avoid', marginBottom: '1rem', cursor: 'pointer',
                  position: 'relative', borderRadius: '4px', overflow: 'hidden'
                }}
                onMouseEnter={(e) => e.currentTarget.querySelector('.pin-hover').style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.querySelector('.pin-hover').style.opacity = 0}
              >
                <img 
                  src={photo.image_url} 
                  alt={photo.title || 'Foto'} 
                  style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.5s' }}
                />
                <div 
                  className="pin-hover"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    opacity: 0, transition: 'opacity 0.3s',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem',
                    color: '#fff'
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--gold)' }}>{photo.title}</h4>
                  {photo.description && <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#ccc' }}>{photo.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {lightboxIndex !== null && (
        <Lightbox 
          photos={photos} 
          index={lightboxIndex} 
          onClose={closeLightbox} 
          onPrev={prevPhoto} 
          onNext={nextPhoto} 
        />
      )}

      <PublicFooter />

      <style>{`
        /* Lightbox specific CSS */
        .lightbox-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.96); z-index: 2000;
          display: flex; alignItems: center; justify-content: center; padding: 1rem;
        }
        .lightbox-content { position: relative; max-width: min(90vw, 1200px); max-height: 90vh; display: flex; flex-direction: column; align-items: center; }
        .lightbox-content img { max-width: 100%; max-height: 82vh; object-fit: contain; border-radius: 4px; box-shadow: 0 20px 80px rgba(0,0,0,0.8); }
        .lightbox-caption { margin-top: 1rem; text-align: center; color: #fff; }
        .lightbox-caption strong { font-size: 1rem; font-weight: 700; color: var(--gold); }
        .lightbox-caption p { font-size: 0.875rem; margin-top: 0.25rem; color: #ccc; }
        .lightbox-close, .lightbox-nav {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff;
          border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s; z-index: 2010;
        }
        .lightbox-close { position: fixed; top: 1.5rem; right: 1.5rem; width: 48px; height: 48px; }
        .lightbox-nav { position: fixed; top: 50%; transform: translateY(-50%); width: 56px; height: 56px; }
        .lightbox-prev { left: 1.5rem; }
        .lightbox-next { right: 1.5rem; }
        .lightbox-nav:hover:not(:disabled), .lightbox-close:hover { background: rgba(255,255,255,0.2); }
        .lightbox-nav:disabled { opacity: 0.3; cursor: default; }
        .lightbox-counter { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.6); font-size: 0.875rem; background: rgba(0,0,0,0.5); padding: 0.4rem 1rem; border-radius: 999px; }
      `}</style>
    </div>
  );
};

export default AlbumGallery;
