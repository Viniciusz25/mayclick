import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, Heart, X, Save, ArrowLeft } from 'lucide-react';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, uploadImage } from '../lib/apiClient';
import ImageUploader from './ImageUploader';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../Home.css';

const AdminBlog = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'edit'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    cover_image_url: '',
    excerpt: '',
    content: ''
  });

  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    getBlogPosts()
      .then(data => {
        if (data) setPosts(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openEditor = (post = null) => {
    if (post) {
      setEditingPost(post.id);
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        category: post.category || '',
        cover_image_url: post.cover_image_url || '',
        excerpt: post.excerpt || '',
        content: post.content || ''
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        category: '',
        cover_image_url: '',
        excerpt: '',
        content: ''
      });
    }
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: !editingPost ? generateSlug(newTitle) : prev.slug
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      alert('O título e o slug são obrigatórios.');
      return;
    }
    
    try {
      if (editingPost) {
        await updateBlogPost(editingPost, formData);
      } else {
        await createBlogPost(formData);
      }
      setViewMode('list');
      loadPosts();
    } catch (err) {
      console.error('Error saving post', err);
      alert('Erro ao salvar postagem');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta postagem?')) {
      try {
        await deleteBlogPost(id);
        loadPosts();
      } catch (err) {
        console.error('Error deleting post', err);
        alert('Erro ao excluir postagem');
      }
    }
  };

  // NATIVE QUILL INITIALIZATION
  useEffect(() => {
    if (viewMode === 'edit' && editorRef.current && !quillInstance.current) {
      
      const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          if (file) {
            setImageUploading(true);
            try {
              const response = await uploadImage(file);
              if (response && response.url) {
                const quill = quillInstance.current;
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', response.url);
              } else {
                alert('Erro: não foi possível obter a URL da imagem.');
              }
            } catch (err) {
              console.error(err);
              alert('Erro ao fazer upload da imagem.');
            } finally {
              setImageUploading(false);
            }
          }
        };
      };

      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Escreva sua história aqui...',
        modules: {
          toolbar: {
            container: [
              [{ 'header': [2, 3, false] }],
              ['bold', 'italic', 'underline'],
              ['blockquote'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link', 'image'],
              ['clean']
            ],
            handlers: {
              image: imageHandler
            }
          }
        }
      });

      // Set initial value
      if (formData.content) {
        const delta = quillInstance.current.clipboard.convert({ html: formData.content });
        quillInstance.current.setContents(delta, 'silent');
      }

      // Listen for changes
      quillInstance.current.on('text-change', () => {
        setFormData(prev => ({
          ...prev,
          content: quillInstance.current.root.innerHTML
        }));
      });
    }

    // Cleanup when leaving edit mode
    return () => {
      if (viewMode !== 'edit' && quillInstance.current) {
        // Destroy quill instance if necessary, though react handles unmount
        quillInstance.current = null;
      }
    };
  }, [viewMode]); // We only re-run this if viewMode changes to 'edit'


  if (viewMode === 'edit') {
    return (
      <div className="admin-card" style={{ padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button className="icon-btn" onClick={() => setViewMode('list')} title="Voltar">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 style={{ margin: 0 }}>{editingPost ? 'Editar Postagem' : 'Nova Postagem'}</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Escreva ou edite sua matéria</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          {/* MAIN COLUMN (Editor) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Adicionar título" 
              value={formData.title}
              onChange={handleTitleChange}
              style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                border: 'none', 
                outline: 'none', 
                background: 'transparent', 
                color: 'var(--primary)', 
                width: '100%', 
                fontFamily: 'Playfair Display, serif',
                padding: '0.5rem 0'
              }}
            />

            <div style={{ borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
              {imageUploading && (
                <div style={{ padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
                  Enviando imagem, aguarde...
                </div>
              )}
              {/* Quill container */}
              <div ref={editorRef} style={{ height: '600px', fontFamily: 'inherit' }}></div>
            </div>
            
            <div className="form-group" style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-strong)' }}>
              <label style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1rem', display: 'block' }}>Resumo (Excerpt)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={formData.excerpt} 
                onChange={e => setFormData(prev => ({...prev, excerpt: e.target.value}))} 
                placeholder="Um breve resumo que aparecerá nos cards da listagem principal do blog."
                style={{ background: 'transparent' }}
              />
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
            
            <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Publicar</h3>
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.75rem' }} onClick={handleSave}>
                  <Save size={18} style={{ marginRight: '0.5rem' }} /> Salvar Postagem
                </button>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setViewMode('list')}>Cancelar</button>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Configurações</h3>
              <div className="form-group">
                <label>URL Amigável (Slug)</label>
                <input type="text" className="form-control" value={formData.slug} onChange={e => setFormData(prev => ({...prev, slug: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <input type="text" className="form-control" value={formData.category} onChange={e => setFormData(prev => ({...prev, category: e.target.value}))} placeholder="Ex: Casamentos" />
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Imagem de Capa</h3>
              <ImageUploader 
                label=""
                value={formData.cover_image_url}
                onChange={url => setFormData(prev => ({...prev, cover_image_url: url}))}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Esta imagem será exibida no topo do artigo e nos cards.</p>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Postagens do Blog</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Gerencie os artigos publicados no site.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openEditor()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Novo Post
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Views</th>
                <th>Curtidas</th>
                <th>Data</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 500 }}>{post.title}</td>
                  <td><span className="badge">{post.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666' }}>
                      <Eye size={14} /> {post.views}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666' }}>
                      <Heart size={14} /> {post.likes}
                    </div>
                  </td>
                  <td style={{ color: '#666' }}>{new Date(post.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="icon-btn" title="Editar" onClick={() => openEditor(post)} style={{ marginRight: '0.5rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" title="Excluir" onClick={() => handleDelete(post.id)} style={{ color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    Nenhuma postagem encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
