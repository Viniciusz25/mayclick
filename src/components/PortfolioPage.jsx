import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Images } from 'lucide-react';
import { getPublicPortfolio } from '../lib/apiClient';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';
import CookieBanner from './CookieBanner';
import useSettings from '../hooks/useSettings';
import '../Home.css';

const PortfolioPage = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();
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

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505', color: '#c5a059' }}>Carregando Portfólio...</div>;
  }

  return (
    <div className="home-luxury-wrapper">
      <PublicHeader />
      <CookieBanner />

      <main className="luxury-inner-page">
        <div className="luxury-page-header">
          <h1 className="serif-title">Portfólio Completo</h1>
          <p>Escolha uma categoria e explore nossas galerias exclusivas de fotografia.</p>
        </div>

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '6rem' }}>
          {error && (
            <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '2rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
              <Images size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Nenhuma galeria publicada no momento.</p>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => navigate(`/portfolio/${cat.slug}`)}
                className="luxury-card"
                style={{
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, border-color 0.3s',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = '#222';
                }}
              >
                <div style={{ height: '240px', overflow: 'hidden' }}>
                  <img 
                    src={cat.cover_image_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'} 
                    alt={cat.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 className="serif-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--gold)' }}>{cat.title}</h3>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                    {cat.description || 'Veja os melhores momentos dessa categoria.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ver Galeria <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PortfolioPage;
