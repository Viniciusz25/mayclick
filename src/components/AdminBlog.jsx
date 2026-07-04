import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Heart, X, Save } from 'lucide-react';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../lib/apiClient';
import '../Home.css';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    cover_image_url: '',
    excerpt: '',
    content: ''
  });

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

  const openModal = (post = null) => {
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
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
    setFormData({
      ...formData,
      title: newTitle,
      slug: !editingPost ? generateSlug(newTitle) : formData.slug
    });
  };

  const handleSave = async () => {
    try {
      if (editingPost) {
        await updateBlogPost(editingPost, formData);
      } else {
        await createBlogPost(formData);
      }
      closeModal();
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

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Postagens do Blog</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Gerencie os artigos publicados no site.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    <button className="icon-btn" title="Editar" onClick={() => openModal(post)} style={{ marginRight: '0.5rem' }}>
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

      {isModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3>{editingPost ? 'Editar Postagem' : 'Nova Postagem'}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-group">
                <label>Título</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.title} 
                  onChange={handleTitleChange} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Slug (URL amigável)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    placeholder="Ex: Casamentos"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>URL da Imagem de Capa</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.cover_image_url} 
                  onChange={e => setFormData({...formData, cover_image_url: e.target.value})} 
                />
                {formData.cover_image_url && (
                  <img src={formData.cover_image_url} alt="Preview" style={{ marginTop: '0.5rem', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
              </div>
              <div className="form-group">
                <label>Resumo (Excerpt)</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  value={formData.excerpt} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Conteúdo (HTML suportado)</label>
                <textarea 
                  className="form-control" 
                  rows="8" 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Salvar Postagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
