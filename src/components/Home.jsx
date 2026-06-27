import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ClipboardList, LogIn, ChevronRight, ChevronLeft, Menu, X } from 'lucide-react';
import useSettings from '../hooks/useSettings';
import PublicFooter from './PublicFooter';
import CookieBanner from './CookieBanner';
import { getPublicHomeData } from '../lib/apiClient';
import { useVisualEditor, VisualEditorProvider } from '../context/VisualEditorContext';
import VisualBuilderHeader from './visual-builder/VisualBuilderHeader';
import VisualBuilderSidebar from './visual-builder/VisualBuilderSidebar';
import EditableWrapper from './visual-builder/EditableWrapper';
const Home = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { businessSettings } = useSettings();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { isEditMode, setIsEditMode, draftData, initializeDraft } = useVisualEditor();

  // Check for edit mode parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setIsEditMode(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setIsEditMode]);

  // Hero carousel state
  const [heroSlide, setHeroSlide] = useState(0);
  const heroTimerRef = useRef(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await getPublicHomeData();
        setHomeData(data);
        initializeDraft(data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
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

  const heroCarouselPhotos = homeData?.heroCarouselPhotos || [];

  // Auto-advance carousel (must be before early return)
  useEffect(() => {
    if (heroCarouselPhotos.length <= 1) return;
    heroTimerRef.current = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroCarouselPhotos.length);
    }, 4500);
    return () => clearInterval(heroTimerRef.current);
  }, [heroCarouselPhotos.length]);

  if (loading) {
    return <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: 'var(--primary)' }}>Carregando Mayclick...</div>;
  }

  // Use draftData if in edit mode, otherwise use homeData
  const currentData = isEditMode && draftData ? draftData : homeData;

  const s = currentData?.settings || {};
  const testimonials = currentData?.testimonials || [];
  const categories = currentData?.categories || [];
  const featuredPhotos = currentData?.featuredPhotos || [];
  const highlights = currentData?.highlights || [];

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const ytId = getYouTubeId(s?.about_video_url);

  const goToSlide = (idx) => {
    clearInterval(heroTimerRef.current);
    setHeroSlide(idx);
    if (heroCarouselPhotos.length > 1) {
      heroTimerRef.current = setInterval(() => {
        setHeroSlide(prev => (prev + 1) % heroCarouselPhotos.length);
      }, 4500);
    }
  };

  
  const renderHero = () => (
    <React.Fragment key="hero">
      {s.hero_active !== false && (
        <main className="hero-section">
          <div className="hero-background">
            {heroCarouselPhotos.length > 0 ? (
              <div className="hero-carousel">
                {/* Slides */}
                {heroCarouselPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className={`hero-slide ${idx === heroSlide ? 'active' : ''}`}
                  >
                    <img
                      src={url}
                      alt={`Slide ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                ))}
                
                <div className="hero-overlay"></div>

                {/* Prev / Next */}
                {heroCarouselPhotos.length > 1 && (
                  <>
                    <button
                      className="carousel-arrow carousel-prev"
                      onClick={() => goToSlide((heroSlide - 1 + heroCarouselPhotos.length) % heroCarouselPhotos.length)}
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      className="carousel-arrow carousel-next"
                      onClick={() => goToSlide((heroSlide + 1) % heroCarouselPhotos.length)}
                      aria-label="Próxima foto"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Dots */}
                {heroCarouselPhotos.length > 1 && (
                  <div className="carousel-dots">
                    {heroCarouselPhotos.map((_, idx) => (
                      <button
                        key={idx}
                        className={`carousel-dot ${idx === heroSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(idx)}
                        aria-label={`Ir para foto ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="single-hero-img">
                <img
                  src={s.hero_image_url || '/hero-main.jpg'}
                  alt="Histórias Eternizadas"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="hero-overlay"></div>
              </div>
            )}
          </div>

          <div className="container hero-inner">
            <div className="hero-content fade-in">
              <h1>
                <EditableWrapper field="hero_title" label="Título Principal" type="text" section="hero">
                  {s.hero_title || "Eternizando seus momentos mais especiais."}
                </EditableWrapper>
              </h1>

              <div className="hero-actions">
                <button className="btn btn-accent btn-lg" onClick={() => navigate(s.hero_btn_link || '/formulario')}>
                  <ClipboardList size={22} /> {s.hero_btn_text || "Solicitar Orçamento"}
                </button>
                <button className="btn btn-outline-white btn-lg btn-portfolio" onClick={() => navigate('/portfolio')} style={{ marginLeft: '1rem' }}>
                  <Camera size={22} /> Ver Portfólio
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </React.Fragment>
  );

  const renderPortfolio = () => (
    <React.Fragment key="portfolio">
      {/* Bloco Conheça Nosso Trabalho (Mosaico) */}
      <section className="portfolio-mosaico">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">
              <EditableWrapper field="portfolio_eyebrow" label="Tag Portfólio" section="portfolio">
                {s.portfolio_eyebrow || 'Nosso Portfólio'}
              </EditableWrapper>
            </span>
            <h2>
              <EditableWrapper field="portfolio_title" label="Título Portfólio" section="portfolio">
                {s.portfolio_title || 'Conheça Nosso Trabalho'}
              </EditableWrapper>
            </h2>
            <p>
              <EditableWrapper field="portfolio_description" label="Descrição Portfólio" type="textarea" section="portfolio">
                {s.portfolio_description || 'Selecione uma categoria para visualizar nossas galerias exclusivas'}
              </EditableWrapper>
            </p>
          </div>
          
          <div className="mosaico-grid">
            {categories.map((c, index) => {
              const isLarge = index === 0;
              const isWide = index === 6;
              const itemClass = `mosaico-item ${isLarge ? 'large' : ''} ${isWide ? 'wide' : ''}`;
              
              return (
                <div key={c.id} className={itemClass} onClick={() => navigate(`/portfolio/${c.slug}`)}>
                  <img src={c.cover_image_url || "/placeholder.jpg"} alt={c.title} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' }} />
                  <div className="mosaico-overlay">
                    <h3>{c.title}</h3>
                    <span>{c.description || "Visualizar Galeria"}</span>
                  </div>
                </div>
              );
            })}
            
            {categories.length === 0 && (
              <div className="no-items" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Nenhuma categoria cadastrada ainda. Configure no Painel Admin.
              </div>
            )}
          </div>
        </div>
      </section>
    </React.Fragment>
  );

  const renderHighlights = () => (
    <React.Fragment key="highlights">
      {/* Destaques Dinâmicos */}
      {highlights.map((h, index) => {
        // Alternar layout (imagem na esquerda ou direita)
        const isImageLeft = index % 2 === 0;
        
        return (
          <section key={h.id} className="destaque-debutantes" style={{ backgroundColor: isImageLeft ? '#fff' : 'var(--bg-page)' }}>
            <div className={`container destaque-inner ${!isImageLeft ? 'reverse' : ''}`}>
              <div className="destaque-image-wrapper">
                <EditableWrapper field="image_url" label="Imagem do Destaque" type="image" section="highlights" highlightId={h.id}>
                  <img 
                    src={h.image_url || "/placeholder.jpg"} 
                    alt={h.title} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80' }} 
                  />
                </EditableWrapper>
              </div>
              <div className="destaque-content">
                {h.eyebrow && (
                  <span className="eyebrow">
                    <EditableWrapper field="eyebrow" label="Tag" type="text" section="highlights" highlightId={h.id}>
                      {h.eyebrow}
                    </EditableWrapper>
                  </span>
                )}
                <h2>
                  <EditableWrapper field="title" label="Título do Destaque" type="text" section="highlights" highlightId={h.id}>
                    {h.title}
                  </EditableWrapper>
                </h2>
                {h.description && (
                  <p>
                    <EditableWrapper field="description" label="Descrição" type="textarea" section="highlights" highlightId={h.id}>
                      {h.description}
                    </EditableWrapper>
                  </p>
                )}
                {h.button_text && h.button_link && (
                  <button className="btn btn-accent btn-lg" onClick={() => navigate(h.button_link)}>
                    <EditableWrapper field="button_text" label="Texto do Botão" type="text" section="highlights" highlightId={h.id}>
                      {h.button_text}
                    </EditableWrapper>
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </React.Fragment>
  );

  const renderAbout = () => (
    <React.Fragment key="about">
      {/* Bloco Sobre a Mayclick (Parallax / Video) */}
      <EditableWrapper field="about_parallax_image_url" label="Imagem de Fundo (Parallax)" type="image" section="about">
        <section 
          className="sobre-mayclick-parallax" 
          style={{ 
            backgroundImage: !s.about_video_url ? `url(${s.about_parallax_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80'})` : 'none' 
          }}
        >
          {ytId ? (
            <iframe
              className="sobre-bg-video iframe-video"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&mute=1&controls=0&showinfo=0&rel=0&playlist=${ytId}&modestbranding=1`}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              tabIndex="-1"
            ></iframe>
          ) : s.about_video_url ? (
            <video 
              className="sobre-bg-video"
              autoPlay 
              loop 
              muted 
              playsInline
            >
              <source src={s.about_video_url} type="video/mp4" />
            </video>
          ) : null}
          <div className="sobre-parallax-overlay">
            <div className="container sobre-parallax-content">
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Quem Somos</span>
              <h2>
                <EditableWrapper field="about_title" label="Título Sobre" type="text" section="about">
                  {s.about_title || "A Mayclick Photography"}
                </EditableWrapper>
              </h2>
              <p>
                <EditableWrapper field="institutional_text" label="Texto Institucional" type="textarea" section="about">
                  {s.institutional_text || "A Mayclick Photography nasceu com o propósito de transformar momentos em memórias eternas. Trabalhamos com fotografia e filmagem profissional para eventos sociais, buscando excelência, organização e atendimento personalizado em cada projeto."}
                </EditableWrapper>
              </p>
              {s.about_button_text && s.about_button_link && (
                <button className="btn btn-accent btn-lg" onClick={() => navigate(s.about_button_link)} style={{ marginTop: '2rem' }}>
                  <EditableWrapper field="about_button_text" label="Texto do Botão" type="text" section="about">
                    {s.about_button_text}
                  </EditableWrapper>
                </button>
              )}
            </div>
          </div>
        </section>
      </EditableWrapper>
    </React.Fragment>
  );

  const renderTestimonials = () => (
    <React.Fragment key="testimonials">
      {/* Bloco Depoimentos (Carrossel / Grid) */}
      <section className="depoimentos-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">
              <EditableWrapper field="testimonials_eyebrow" label="Tag Depoimentos" section="testimonials">
                {s.testimonials_eyebrow || 'O Que Dizem'}
              </EditableWrapper>
            </span>
            <h2>
              <EditableWrapper field="testimonials_title" label="Título Depoimentos" section="testimonials">
                {s.testimonials_title || 'Depoimentos de Clientes'}
              </EditableWrapper>
            </h2>
          </div>
          <div className="depoimentos-grid">
            {testimonials.map((t) => (
              <div className="depoimento-card" key={t.id}>
                <div className="card-header">
                  {t.client_photo_url ? (
                    <img src={t.client_photo_url} alt={t.client_name} className="client-avatar" />
                  ) : (
                    <div className="client-avatar placeholder">{t.client_name.charAt(0)}</div>
                  )}
                  <div className="client-info">
                    <span className="author">{t.client_name}</span>
                    <div className="stars">{Array(t.stars || 5).fill('⭐').join('')}</div>
                  </div>
                </div>
                <p>"{t.content}"</p>
              </div>
            ))}
            
            {testimonials.length === 0 && (
              <div className="no-items" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Nenhum depoimento cadastrado no momento.
              </div>
            )}
          </div>
        </div>
      </section>
    </React.Fragment>
  );

  const renderInstagram = () => (
    <React.Fragment key="instagram">
      {/* Bloco Portfólio Instagram */}
      {s.instagram_active !== false && (
        <section className="instagram-banner" style={{ backgroundColor: 'var(--bg-page)', padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header-centered" style={{ marginBottom: '2rem' }}>
              <span className="eyebrow">
                <EditableWrapper field="instagram_eyebrow" label="Tag Instagram" section="instagram">
                  {s.instagram_eyebrow || 'Siga no Instagram'}
                </EditableWrapper>
              </span>
              <h2>
                <EditableWrapper field="instagram_title" label="Título Instagram" section="instagram">
                  {s.instagram_title || 'Acompanhe nosso trabalho em tempo real'}
                </EditableWrapper>
              </h2>
              <p>
                <EditableWrapper field="instagram_description" label="Descrição Instagram" type="textarea" section="instagram">
                  {s.instagram_description || 'Fique por dentro dos bastidores e novidades diárias'}
                </EditableWrapper>
              </p>
            </div>
            
            <a href={`https://instagram.com/${s.instagram_username || 'mayclick'}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              Seguir @{s.instagram_username || 'mayclick'}
            </a>
          </div>
        </section>
      )}
    </React.Fragment>
  );

  const renderCTA = () => (
    <React.Fragment key="cta">
      {/* Bloco Final CTA */}
      <section className="cta-final">
        <div className="container cta-inner">
          <h2>
            <EditableWrapper field="cta_title" label="Título CTA" section="cta">
              {s.cta_title || 'Vamos contar sua história?'}
            </EditableWrapper>
          </h2>
          <p>
            <EditableWrapper field="cta_text" label="Texto CTA" type="textarea" section="cta">
              {s.cta_text || 'Solicite seu orçamento e descubra como podemos eternizar seu momento especial.'}
            </EditableWrapper>
          </p>
          <button className="btn btn-accent btn-lg" onClick={() => navigate('/formulario')}>
            <EditableWrapper field="cta_button_text" label="Botão CTA" section="cta">
              {s.cta_button_text || 'Solicitar Orçamento'}
            </EditableWrapper>
          </button>
        </div>
      </section>
    </React.Fragment>
  );

  const layoutMap = {
    hero: renderHero,
    portfolio: renderPortfolio,
    highlights: renderHighlights,
    about: renderAbout,
    testimonials: renderTestimonials,
    instagram: renderInstagram,
    cta: renderCTA
  };

  const defaultLayout = ['hero', 'portfolio', 'highlights', 'about', 'testimonials', 'instagram', 'cta'];
  let currentLayout = defaultLayout;
  if (s.homepage_layout) {
      if (Array.isArray(s.homepage_layout)) {
          currentLayout = s.homepage_layout;
      } else if (typeof s.homepage_layout === 'string') {
          try {
              currentLayout = JSON.parse(s.homepage_layout);
          } catch(e) {}
      }
  }
  
  // Filter out any missing map entries
  currentLayout = currentLayout.filter(k => !!layoutMap[k]);

  return (
    <div className="home-page">
      <VisualBuilderHeader onSaveComplete={() => window.location.reload()} />
      <VisualBuilderSidebar />
      <CookieBanner />
      
      {/* Side Drawer */}
      <div className={`side-drawer-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`side-drawer ${isSidebarOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">Menu Principal</span>
          <button className="drawer-close" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="drawer-nav">
          <button onClick={() => navigate('/')} className="drawer-link active-sub" style={{ color: 'var(--accent)' }}>Início</button>
          <div className="drawer-category">
            <span className="category-label">Portfólio</span>
            <div className="category-links">
              <button onClick={() => navigate('/portfolio')} className="drawer-sublink">Ver Tudo</button>
            </div>
          </div>
          <button onClick={() => navigate('/sobre')} className="drawer-link">Quem Somos</button>
          <button onClick={() => navigate('/formulario')} className="drawer-link">Contato</button>
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

      {currentLayout.map(sectionId => layoutMap[sectionId]())}

      <PublicFooter />

      <style>{`
        .home-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-page);
        }

        .credibility-block {
          background-color: #fff;
          padding: 3rem 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .credibility-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .credibility-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-page);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          transition: var(--transition);
        }

        .credibility-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
          border-color: var(--accent);
        }

        .credibility-icon {
          font-size: 2rem;
        }

        .credibility-info h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .credibility-info p {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 992px) {
          .credibility-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .credibility-grid {
            grid-template-columns: 1fr;
          }
        }

        .main-header {
          background-color: rgba(250, 249, 246, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
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

        /* Side Drawer Styles */
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
          letter-spacing: -0.01em;
        }

        .drawer-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
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
        }

        .category-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 800;
        }

        .category-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-left: 1rem;
          border-left: 2px solid var(--border);
        }

        .drawer-sublink {
          background: none;
          border: none;
          text-align: left;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem 0;
          transition: var(--transition);
        }

        .drawer-sublink:hover {
          color: var(--accent);
          padding-left: 0.25rem;
        }

        .header-inner {
          height: 90px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .brand-logo {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid var(--accent);
          box-shadow: var(--shadow-sm);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
          letter-spacing: -0.01em;
        }

        .brand-sub {
          font-size: 0.725rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 4px;
        }

        .hero-section {
          position: relative;
          min-height: calc(100vh - 90px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45); /* Dark overlay */
          z-index: 2;
        }

        .hero-inner {
          position: relative;
          z-index: 10;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          padding: 0.5rem 1.25rem;
          background-color: rgba(212, 175, 55, 0.2);
          color: #fff;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2rem;
          border: 1px solid rgba(212, 175, 55, 0.5);
          backdrop-filter: blur(4px);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-content h1 {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          color: #fff;
          line-height: 1.1;
          text-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .hero-content p {
          font-size: 1.25rem;
          color: #f5f5f5;
          margin-bottom: 3rem;
          line-height: 1.6;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-outline-white {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(4px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-weight: 700;
          transition: var(--transition);
        }
        .btn-outline-white:hover {
          background: #fff;
          color: var(--primary);
        }

        .btn-lg {
          padding: 1.375rem 2.75rem;
          font-size: 1.125rem;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-accent);
        }

        .hero-note {
          margin-top: 3rem;
          padding: 1.25rem;
          background-color: rgba(0,0,0,0.5);
          border-radius: var(--radius);
          border-left: 4px solid var(--accent);
          max-width: 540px;
          color: #fff;
          backdrop-filter: blur(6px);
          display: inline-block;
          text-align: left;
        }
        .hero-note p { margin-bottom: 0; text-shadow: none; font-size: 0.9rem; }

        /* Fullscreen Hero Images */
        .single-hero-img, .hero-carousel {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 0;
          border: none;
          box-shadow: none;
          aspect-ratio: auto;
          background-color: #111;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .hero-slide.active {
          opacity: 1;
          z-index: 2;
        }

        .single-hero-img img,
        .hero-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.4);
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .hero-carousel:hover .carousel-arrow {
          opacity: 1;
        }

        .carousel-arrow:hover {
          background: rgba(255,255,255,0.4);
        }

        .carousel-prev { left: 1rem; }
        .carousel-next { right: 1rem; }

        .carousel-dots {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 10;
          background: rgba(0,0,0,0.2);
          padding: 0.4rem 0.6rem;
          border-radius: 999px;
          backdrop-filter: blur(4px);
        }

        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s;
        }

        .carousel-dot.active {
          background: #fff;
          transform: scale(1.3);
        }

        .main-footer {
          padding: 3rem 0;
          border-top: 1px solid var(--border);
          background-color: #fff;
        }

        .footer-inner {
          text-align: center;
        }

        /* Novas Seções */
        .section-header-centered {
          text-align: center;
          margin-bottom: 4rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .section-header-centered h2 {
          font-size: 2.5rem;
          color: var(--primary);
          margin: 0.5rem 0 1rem;
        }

        .section-header-centered p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        /* Mosaico Portfólio */
        .portfolio-mosaico {
          padding: 6rem 0;
          background-color: var(--bg-page);
        }

        .mosaico-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 280px;
          gap: 1.5rem;
        }

        .mosaico-item {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--border);
        }

        .mosaico-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mosaico-item:hover img {
          transform: scale(1.05);
        }

        .mosaico-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem;
          color: #fff;
          transition: var(--transition);
        }

        .mosaico-overlay h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          font-family: var(--font-heading), 'Outfit', sans-serif;
          color: #fff;
        }

        .mosaico-overlay span {
          font-size: 0.875rem;
          opacity: 0.85;
          letter-spacing: 0.05em;
        }

        .mosaico-item.large {
          grid-column: span 2;
          grid-row: span 2;
        }

        .mosaico-item.wide {
          grid-column: span 2;
        }

        /* Destaque Debutantes */
        .destaque-debutantes {
          padding: 6rem 0;
          background-color: #fff;
        }

        .destaque-inner {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 5rem;
          align-items: center;
        }

        .destaque-inner.reverse {
          grid-template-columns: 1fr 1.2fr;
        }
        
        .destaque-inner.reverse .destaque-image-wrapper {
          order: 2;
        }
        
        .destaque-inner.reverse .destaque-content {
          order: 1;
        }

        .destaque-image-wrapper {
          border-radius: var(--radius);
          overflow: hidden;
          height: 480px;
          border: 1px solid var(--border);
        }

        .destaque-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .destaque-content h2 {
          font-size: 2.75rem;
          color: var(--primary);
          margin: 0.5rem 0 1.5rem;
        }

        .destaque-content p {
          font-size: 1.15rem;
          line-height: 1.7;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
        }

        /* Sobre a Mayclick Parallax / Video */
        .sobre-mayclick-parallax {
          position: relative;
          min-height: 80vh;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .sobre-bg-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translateX(-50%) translateY(-50%);
          z-index: 0;
          object-fit: cover;
        }

        .iframe-video {
          width: 100vw;
          height: 56.25vw; /* 16:9 aspect ratio */
          min-height: 100vh;
          min-width: 177.77vh; /* 16:9 aspect ratio */
          pointer-events: none; /* prevent clicks */
        }

        .sobre-parallax-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 5, 0, 0.75);
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sobre-parallax-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          padding: 4rem 2rem;
          color: #fff;
        }

        .sobre-parallax-content h2 {
          font-size: 3.5rem;
          color: #fff;
          margin: 0.5rem 0 1.5rem;
        }

        .sobre-parallax-content p {
          font-size: 1.25rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1.5rem;
        }

        /* Depoimentos */
        .depoimentos-section {
          padding: 6rem 0;
          background-color: #fff;
        }

        .depoimentos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .depoimento-card {
          background-color: var(--bg-page);
          padding: 2.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          text-align: left;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: transform 0.2s ease;
        }

        .depoimento-card:hover {
          transform: translateY(-5px);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .client-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
        }

        .client-avatar.placeholder {
          background-color: var(--accent);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-heading), 'Outfit', sans-serif;
        }

        .client-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .depoimento-card .author {
          font-size: 1.1rem;
          color: var(--primary);
          font-weight: 700;
          font-family: var(--font-heading), 'Outfit', sans-serif;
        }

        .depoimento-card .stars {
          font-size: 0.9rem;
        }

        .depoimento-card p {
          font-size: 1.05rem;
          font-style: italic;
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0;
        }

        /* Instagram */
        .instagram-feed {
          padding: 6rem 0;
          background-color: var(--bg-page);
          text-align: center;
        }

        .insta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .insta-post {
          aspect-ratio: 1;
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .insta-post img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .insta-post:hover img {
          transform: scale(1.05);
        }

        .insta-action {
          display: flex;
          justify-content: center;
        }

        /* CTA Final */
        .cta-final {
          padding: 8rem 0;
          background: linear-gradient(135deg, var(--primary) 0%, #1e1e1e 100%);
          color: #fff;
          text-align: center;
        }

        .cta-inner {
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-final h2 {
          font-size: 3rem;
          color: #fff;
          margin-bottom: 1rem;
        }

        .cta-final p {
          font-size: 1.25rem;
          opacity: 0.85;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 992px) {
          .mosaico-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 240px;
          }
          .mosaico-item.large, .mosaico-item.wide {
            grid-column: span 2;
          }
          .hero-content h1 {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 3rem 0;
            min-height: calc(100vh - 80px);
          }
          .hero-content h1 {
            font-size: 2.5rem;
          }
          .hero-actions {
            flex-direction: column;
          }
          .hero-actions .btn-portfolio {
            margin-left: 0 !important;
          }
          .carousel-arrow {
            width: 36px;
            height: 36px;
          }
          .carousel-prev { left: 0.5rem; }
          .carousel-next { right: 0.5rem; }
          .destaque-inner {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .destaque-inner.reverse .destaque-image-wrapper,
          .destaque-inner.reverse .destaque-content {
            order: unset;
          }
          .destaque-image-wrapper {
            height: 350px;
          }
          .depoimentos-grid {
            grid-template-columns: 1fr;
          }
          .insta-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .mosaico-grid {
            grid-template-columns: 1fr;
            grid-auto-rows: 200px;
          }
          .mosaico-item.large, .mosaico-item.wide {
            grid-column: span 1;
            grid-row: span 1;
          }
          .sobre-parallax-content h2 {
            font-size: 2.5rem;
          }
          .sobre-parallax-content p {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 992px) {
          .hero-inner { grid-template-columns: 1fr; text-align: center; gap: 4rem; }
          .hero-content h1 { font-size: 3rem; }
          .hero-content p { margin: 0 auto 3rem; }
          .hero-note { margin: 4rem auto 0; text-align: left; }
          .hero-actions { display: flex; justify-content: center; }
          .single-hero-img { max-width: 500px; margin: 0 auto; aspect-ratio: 1; }
          .header-inner { height: 80px; }
        }
      `}</style>
    </div>
  );
};

const HomeWrapper = () => (
  <VisualEditorProvider>
    <Home />
  </VisualEditorProvider>
);

export default HomeWrapper;
