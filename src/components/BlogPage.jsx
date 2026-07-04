import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import PublicFooter from './PublicFooter';
import useSettings from '../hooks/useSettings';
import { getBlogPosts } from '../lib/apiClient';
import '../Home.css';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { businessSettings } = useSettings();

  useEffect(() => {
    getBlogPosts()
      .then(data => {
        if (data) setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load blog posts', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-luxury-wrapper">
      <header className="luxury-header">
        <div className="luxury-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={businessSettings?.logo_url || "/logo.jpg"} alt="MayClick Photography" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <span>MayClick</span>
        </div>
        <nav className="luxury-nav">
          <button onClick={() => navigate('/')} style={{background:'transparent', border:'none', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', letterSpacing:'0.1em'}}>INÍCIO</button>
          <button className="active" style={{background:'transparent', border:'none', color:'var(--gold)', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', letterSpacing:'0.1em'}}>BLOG</button>
        </nav>
        <button className="btn-outline-gold" onClick={() => navigate('/formulario')}>Orçamento</button>
      </header>

      <main className="luxury-inner-page">
        <div className="luxury-page-header">
          <h1>Diário Fotográfico</h1>
          <p>Dicas, bastidores e histórias reais contadas através de nossas lentes.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Carregando posts...</div>
        ) : (
          <div className="luxury-blog-grid">
            {posts.map(post => (
              <div key={post.id} className="luxury-blog-card" onClick={() => navigate(`/blog/${post.slug}`)}>
                <img src={post.cover_image_url} alt={post.title} className="luxury-blog-card-image" />
                <div className="luxury-blog-card-content">
                  <span className="luxury-blog-card-category">{post.category}</span>
                  <h3 className="luxury-blog-card-title">{post.title}</h3>
                  <p className="luxury-blog-card-excerpt">{post.excerpt}</p>
                  
                  <div className="luxury-blog-card-meta">
                    <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span><Eye size={16} /> {post.views}</span>
                      <span><Heart size={16} /> {post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {posts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '4rem' }}>
                Nenhuma postagem encontrada.
              </div>
            )}
          </div>
        )}
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default BlogPage;
