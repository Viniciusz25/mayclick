import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Heart, ArrowLeft } from 'lucide-react';
import PublicFooter from './PublicFooter';
import useSettings from '../hooks/useSettings';
import { getBlogPostBySlug, incrementBlogPostViews, likeBlogPost } from '../lib/apiClient';
import '../Home.css';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const { businessSettings } = useSettings();

  useEffect(() => {
    // Fetch post
    getBlogPostBySlug(slug)
      .then(data => {
        if (!data || data.error) throw new Error('Not found');
        setPost(data);
        setLoading(false);
        // Increment view
        incrementBlogPostViews(slug);
      })
      .catch(err => {
        console.error('Post not found', err);
        navigate('/blog');
      });
  }, [slug, navigate]);

  const handleLike = () => {
    if (liked || !post) return;
    
    likeBlogPost(slug)
      .then(data => {
        if (data && data.likes !== undefined) {
          setPost(prev => ({ ...prev, likes: data.likes }));
          setLiked(true);
        }
      })
      .catch(console.error);
  };

  return (
    <div className="home-luxury-wrapper">
      <header className="luxury-header">
        <div className="luxury-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={businessSettings?.logo_url || "/logo.jpg"} alt="MayClick Photography" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <span>MayClick</span>
        </div>
        <nav className="luxury-nav">
          <button onClick={() => navigate('/')} style={{background:'transparent', border:'none', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', letterSpacing:'0.1em'}}>INÍCIO</button>
          <button onClick={() => navigate('/blog')} style={{background:'transparent', border:'none', color:'var(--gold)', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', letterSpacing:'0.1em'}}>BLOG</button>
        </nav>
        <button className="btn-outline-gold" onClick={() => navigate('/formulario')}>Orçamento</button>
      </header>

      <main className="luxury-inner-page">
        {loading || !post ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Carregando...</div>
        ) : (
          <article className="luxury-blog-post">
            <button 
              onClick={() => navigate('/blog')}
              style={{ background: 'transparent', border: 'none', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}
            >
              <ArrowLeft size={16} /> Voltar para o Blog
            </button>
            
            <header className="luxury-blog-post-header">
              <span className="luxury-blog-post-category">{post.category}</span>
              <h1 className="luxury-blog-post-title">{post.title}</h1>
              <div className="luxury-blog-post-meta">
                <div className="luxury-blog-post-meta-item">
                  <Eye size={18} /> {post.views + 1}
                </div>
                <div className="luxury-blog-post-meta-item">
                  <Heart size={18} /> {post.likes}
                </div>
                <div className="luxury-blog-post-meta-item">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </header>

            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="luxury-blog-post-image" />
            )}

            <div 
              className="luxury-blog-post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="luxury-blog-post-actions">
              <button 
                className={`btn-like ${liked ? 'liked' : ''}`} 
                onClick={handleLike}
                disabled={liked}
              >
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Você curtiu' : 'Curtir este post'}
              </button>
            </div>
          </article>
        )}
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default BlogPost;
