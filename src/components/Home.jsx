import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, CheckCircle, Camera, MapPin, Heart, Clock, Mail, Star, Award, Folder } from 'lucide-react';
import useSettings from '../hooks/useSettings';
import PublicFooter from './PublicFooter';
import CookieBanner from './CookieBanner';
import { getPublicHomeData } from '../lib/apiClient';
import { useVisualEditor, VisualEditorProvider } from '../context/VisualEditorContext';
import VisualBuilderHeader from './visual-builder/VisualBuilderHeader';
import VisualBuilderSidebar from './visual-builder/VisualBuilderSidebar';
import EditableWrapper from './visual-builder/EditableWrapper';
import TopBanner from './TopBanner';
import '../Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { isEditMode, setIsEditMode, draftData, initializeDraft } = useVisualEditor();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setIsEditMode(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setIsEditMode]);

  const [currentSlide, setCurrentSlide] = useState(0);

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

  const carouselPhotos = (isEditMode && draftData ? draftData : homeData)?.heroCarouselPhotos || [];

  useEffect(() => {
    if (carouselPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselPhotos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselPhotos.length]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505', color: '#c5a059' }}>Carregando Mayclick...</div>;
  }

  const currentData = isEditMode && draftData ? draftData : homeData;
  const s = currentData?.settings || {};

  return (
    <div className={`home-luxury-wrapper ${isEditMode ? 'edit-mode-active' : ''}`}>
      {isEditMode && <VisualBuilderHeader />}
      {isEditMode && <VisualBuilderSidebar />}
      
      <TopBanner />
      
      <main>
        {/* HERO */}
        <section className="luxury-hero">
          <header className="luxury-header">
            <div className="luxury-logo">
              <img src={businessSettings?.logo_url || "/logo.jpg"} alt="MayClick Photography" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <span>MayClick</span>
            </div>
            <nav className="luxury-nav">
              <Link to="/" className="active">INÍCIO</Link>
              <a href="#sobre">SOBRE</a>
              <a href="#servicos">SERVIÇOS</a>
              <Link to="/portfolio">PORTFÓLIO</Link>
              <Link to="/depoimentos">DEPOIMENTOS</Link>
              <Link to="/blog">BLOG</Link>
              <a href="#contato">CONTATO</a>
            </nav>
            <button className="btn-outline-gold" onClick={() => navigate('/formulario')}>Orçamento</button>
          </header>

          <div className="luxury-hero-bg" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {carouselPhotos.length > 0 ? (
              carouselPhotos.map((photo, index) => (
                <img 
                  key={index} 
                  src={photo} 
                  alt={`Hero ${index}`} 
                  style={{ 
                    opacity: index === currentSlide ? 1 : 0, 
                    transition: 'opacity 1.5s ease-in-out',
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'
                  }} 
                />
              ))
            ) : (
              <img src={s.hero_image_url || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"} alt="Casal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <div className="luxury-hero-overlay"></div>
          
          <div className="luxury-social-bar">
            <a href="https://instagram.com/mayclick" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="mailto:contato@mayclick.com"><Mail size={20} /></a>
          </div>

          <div className="luxury-hero-content">
            <h2>
              <EditableWrapper field="hero_subtitle" label="Subtítulo Hero" section="hero">
                {s.hero_subtitle || "Transformamos momentos"}
              </EditableWrapper>
            </h2>
            <h1>
              <EditableWrapper field="hero_title" label="Título Hero" section="hero">
                {s.hero_title || "em memórias eternas."}
              </EditableWrapper>
            </h1>
            <p>
              <EditableWrapper field="hero_desc" label="Descrição Hero" type="textarea" section="hero">
                {s.hero_desc || "Fotografia e filmagem com alma, sensibilidade e excelência para eternizar o que realmente importa."}
              </EditableWrapper>
            </p>
            <div className="luxury-hero-actions">
              <button className="btn-gold" onClick={() => navigate('/formulario')}>Quero meu orçamento &rarr;</button>
              <Link to="/portfolio" className="hero-portfolio-link">
                <div className="btn-play"><Play size={16} fill="currentColor" /></div>
                Ver Portfólio
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="servicos" className="luxury-services-section" style={{ paddingTop: '5rem', background: 'var(--dark-bg)' }}>
          <div className="luxury-portfolio-header" style={{ padding: '0 4rem' }}>
            <div>
              <h4>Serviços</h4>
              <h2 className="serif-title">Nossas Especialidades</h2>
            </div>
            <button className="btn-outline-gold" onClick={() => navigate('/portfolio')}>Ver Mais Serviços</button>
          </div>
          <div className="luxury-services" style={{ marginTop: '2rem' }}>
            {(homeData?.categories || []).slice(0, 5).map(cat => (
              <div key={cat.id} className="luxury-service-card" onClick={() => navigate(`/portfolio/${cat.slug}`)}>
                <div className="luxury-service-bg"><img src={cat.cover_image_url || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop"} alt={cat.title} /></div>
                <div className="luxury-service-overlay">
                  <div className="luxury-service-icon">✨</div>
                  <h3>{cat.title}</h3>
                  <p>{cat.description || "Conheça nosso trabalho"}</p>
                </div>
              </div>
            ))}
            {(homeData?.categories?.length === 0 || !homeData?.categories) && (
              <div style={{ padding: '4rem', textAlign: 'center', width: '100%', color: '#888' }}>
                <p>Adicione categorias de portfólio no painel para exibi-las aqui.</p>
              </div>
            )}
          </div>
        </section>


        {/* ABOUT */}
        <section id="sobre" className="luxury-about">
          <div className="luxury-about-container">
            <div className="luxury-about-content">
              <h2 className="serif-title">
                <EditableWrapper field="about_title" label="Título Sobre" section="about">
                  {s.about_title || "Por que escolher a MayClick?"}
                </EditableWrapper>
              </h2>
              <p className="desc">
                <EditableWrapper field="institutional_text" label="Texto Sobre" type="textarea" section="about">
                  {s.institutional_text || "Mais que fotografias, entregamos experiências. Nossa missão é capturar sentimentos verdadeiros com criatividade, técnica e dedicação."}
                </EditableWrapper>
              </p>
              <ul className="luxury-about-list">
                {(s.about_bullets ? s.about_bullets.split('\n') : [
                  "Equipe especializada e apaixonada",
                  "Equipamentos de alta performance",
                  "Edição profissional e entrega rápida",
                  "Atendimento personalizado"
                ]).map((bullet, idx) => {
                  if (!bullet.trim()) return null;
                  return <li key={idx}><CheckCircle size={18} /> {bullet}</li>;
                })}
              </ul>
              <button className="btn-outline-gold" onClick={() => navigate('/sobre')} style={{borderColor: '#c5a059', color: '#c5a059'}}>
                {s.about_button_text || "Conheça nossa história"} &rarr;
              </button>
            </div>
            <div className="luxury-about-image">
              <img src={s.about_page_hero_image || s.about_parallax_image_url || "https://images.unsplash.com/photo-1554048665-8b3879f64c67?q=80&w=1000&auto=format&fit=crop"} alt="Equipe" />
            </div>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section className="luxury-portfolio">
          <div className="luxury-portfolio-header">
            <div>
              <h4>Portfólio</h4>
              <h2 className="serif-title">Momentos que falam por si.</h2>
            </div>
            <button className="btn-outline-gold" onClick={() => navigate('/portfolio')}>Ver Mais Fotos</button>
          </div>
          <div className="luxury-portfolio-marquee">
            <div className="luxury-portfolio-marquee-track">
              {(() => {
                let photos = (currentData?.featuredPhotos || []).map(p => p.image_url);
                // Fallback to category cover images if no featured photos
                if (photos.length === 0) {
                  photos = (currentData?.categories || []).map(c => c.cover_image_url).filter(url => url);
                }
                
                // Final fallback if absolutely nothing exists
                const displayPhotos = photos.length > 0 ? photos : [
                  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1518049362265-f5b249d01f52?q=80&w=800&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1544592233-157973c1fa26?q=80&w=800&auto=format&fit=crop"
                ];
                
                // Duplicate array to create seamless loop
                const doubledPhotos = [...displayPhotos, ...displayPhotos, ...displayPhotos, ...displayPhotos];
                return doubledPhotos.map((url, idx) => (
                  <div className="luxury-portfolio-item" key={idx} onClick={() => navigate('/portfolio')} style={{ cursor: 'pointer' }}>
                    <img src={url} alt={`Portfolio ${idx}`} />
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="luxury-stats">
          <div className="luxury-stat-item">
            <div className="luxury-stat-icon"><Camera size={32} /></div>
            <div className="luxury-stat-value">+380</div>
            <div className="luxury-stat-label">Eventos Registrados</div>
            <div className="luxury-stat-desc">Casamentos • Debutantes • Infantis</div>
          </div>
          <div className="luxury-stat-item">
            <div className="luxury-stat-icon"><Star size={32} /></div>
            <div className="luxury-stat-value">+15 mil pessoas</div>
            <div className="luxury-stat-label">Fotografadas</div>
            <div className="luxury-stat-desc"></div>
          </div>
          <div className="luxury-stat-item">
            <div className="luxury-stat-icon"><Heart size={32} /></div>
            <div className="luxury-stat-value">10 anos</div>
            <div className="luxury-stat-label">de Experiência</div>
            <div className="luxury-stat-desc">realizando sonhos em historias eternizadas</div>
          </div>
          <div className="luxury-stat-item">
            <div className="luxury-stat-icon"><Folder size={32} /></div>
            <div className="luxury-stat-value">+120 mil</div>
            <div className="luxury-stat-label">Fotos Entregues</div>
            <div className="luxury-stat-desc">Editadas em alta resolução</div>
          </div>
        </section>

      </main>
      
      <CookieBanner />
      <PublicFooter businessSettings={businessSettings} />
    </div>
  );
};

const HomeWrapper = () => (
  <VisualEditorProvider>
    <Home />
  </VisualEditorProvider>
);

export default HomeWrapper;
