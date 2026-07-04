import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettings from '../hooks/useSettings';
import CookieBanner from './CookieBanner';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { getPublicHomeData } from '../lib/apiClient';
import '../Home.css';

const AboutPage = () => {
  const navigate = useNavigate();
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

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505', color: '#c5a059' }}>Carregando História...</div>;
  }

  const s = homeData?.settings || {};

  return (
    <div className="home-luxury-wrapper">
      <PublicHeader />
      <CookieBanner />

      <main className="luxury-inner-page">
        <div className="luxury-page-header">
          <h1 className="serif-title">Nossa História</h1>
          <p>Conheça a essência por trás das nossas lentes.</p>
        </div>

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '6rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '4rem', alignItems: 'stretch' }}>
            <div style={{ position: 'relative', minHeight: '400px', borderRadius: '4px', overflow: 'hidden' }}>
              <img 
                src={s.about_page_hero_image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1920&q=80'} 
                alt="Sobre a Empresa" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
              />
            </div>
            
            <div className="luxury-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="serif-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--gold)' }}>Quem Somos</h2>
              <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#ddd', whiteSpace: 'pre-wrap' }}>
                {s.about_page_text ? (
                  s.about_page_text
                ) : (
                  "A história da empresa ainda não foi adicionada. Acesse o painel de administração para contar sua história!"
                )}
              </div>
              <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                <button className="btn-gold" onClick={() => navigate('/formulario')}>Solicitar Orçamento &rarr;</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default AboutPage;
