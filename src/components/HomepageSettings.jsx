import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Save, Plus, Trash, Globe, Image, 
  List, Layout, BarChart, Upload, CheckCircle,
  AlertCircle, Loader, Filter, X, FolderOpen,
  GripVertical, ChevronUp, ChevronDown, ArrowUpDown, FileText
} from 'lucide-react';
import { 
  getBusinessSettings, updateBusinessSettings,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getPortfolioCategories, createPortfolioCategory, updatePortfolioCategory, deletePortfolioCategory,
  reorderCategories,
  getPortfolioPhotos, createPortfolioPhoto, updatePortfolioPhoto, deletePortfolioPhoto,
  uploadImagesBulk,
  getHomeHighlights, createHomeHighlight, updateHomeHighlight, deleteHomeHighlight
} from '../lib/apiClient';
import ImageUploader from './ImageUploader';

const HomepageSettings = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ client_name: '', client_photo_url: '', content: '', stars: 5, active: true });

  // Categories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ slug: '', title: '', description: '', cover_image_url: '', active: true });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState(null);

  // Drag-and-drop reorder state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [reorderSaved, setReorderSaved] = useState(false);

  // Photos
  const [photos, setPhotos] = useState([]);
  const [newPhoto, setNewPhoto] = useState({ category_id: '', image_url: '', is_cover: false, is_featured_home: false, active: true });

  // Highlights
  const [highlights, setHighlights] = useState([]);
  const [newHighlight, setNewHighlight] = useState({ eyebrow: '', title: '', description: '', button_text: '', button_link: '', image_url: '', sort_order: 0, active: true });

  // Bulk upload
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkIsFeatured, setBulkIsFeatured] = useState(false);
  const [bulkQueue, setBulkQueue] = useState([]); // [{ name, status: 'pending'|'uploading'|'done'|'error', url, error }]
  const [isDragging, setIsDragging] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [filterCatId, setFilterCatId] = useState('all');
  const bulkFileRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const s = await getBusinessSettings();
      setSettings(s);
      
      const t = await getTestimonials();
      setTestimonials(t);

      const c = await getPortfolioCategories();
      setCategories(c);

      const p = await getPortfolioPhotos();
      setPhotos(p);

      const h = await getHomeHighlights();
      setHighlights(h);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateBusinessSettings(settings);
      setSettings(updated);
      showSaved();
    } catch (err) {
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    try {
      const created = await createTestimonial(newTestimonial);
      setTestimonials([...testimonials, created]);
      setNewTestimonial({ client_name: '', client_photo_url: '', content: '', stars: 5, active: true });
    } catch (err) {
      alert('Erro ao salvar depoimento.');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Deseja excluir este depoimento?')) return;
    try {
      await deleteTestimonial(id);
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err) {
      alert('Erro ao excluir depoimento.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const created = await createPortfolioCategory(newCategory);
      setCategories([...categories, created]);
      setNewCategory({ slug: '', title: '', description: '', cover_image_url: '', active: true });
    } catch (err) {
      alert('Erro ao criar categoria.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Deseja excluir esta categoria?')) return;
    try {
      await deletePortfolioCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert('Erro ao excluir categoria.');
    }
  };

  const handleUpdateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingCategoryId || !editingCategoryData) return;
    try {
      const updated = await updatePortfolioCategory(editingCategoryId, editingCategoryData);
      setCategories(categories.map(c => c.id === editingCategoryId ? updated : c));
      setEditingCategoryId(null);
      setEditingCategoryData(null);
    } catch (err) {
      alert('Erro ao atualizar categoria.');
    }
  };

  // ─── Drag-and-drop handlers ───
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...categories];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const withOrder = reordered.map((c, i) => ({ ...c, sort_order: i }));
    setCategories(withOrder);
    setDragIndex(null);
    setDragOverIndex(null);
    persistOrder(withOrder);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const moveCategory = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    const withOrder = reordered.map((c, i) => ({ ...c, sort_order: i }));
    setCategories(withOrder);
    persistOrder(withOrder);
  };

  const persistOrder = async (ordered) => {
    setReorderSaving(true);
    setReorderSaved(false);
    try {
      const payload = ordered.map((c, i) => ({ id: c.id, sort_order: i }));
      await reorderCategories(payload);
      setReorderSaved(true);
      setTimeout(() => setReorderSaved(false), 2500);
    } catch (err) {
      alert('Erro ao salvar ordem. Tente novamente.');
    } finally {
      setReorderSaving(false);
    }
  };

  const handleCreatePhoto = async (e) => {
    e.preventDefault();
    try {
      const created = await createPortfolioPhoto(newPhoto);
      setPhotos([...photos, created]);
      setNewPhoto({ category_id: '', image_url: '', is_cover: false, is_featured_home: false, active: true });
    } catch (err) {
      alert('Erro ao adicionar foto.');
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!confirm('Deseja excluir esta foto?')) return;
    try {
      await deletePortfolioPhoto(id);
      setPhotos(photos.filter(p => p.id !== id));
    } catch (err) {
      alert('Erro ao excluir foto.');
    }
  };

  const handleCreateHighlight = async (e) => {
    e.preventDefault();
    try {
      const created = await createHomeHighlight(newHighlight);
      setHighlights([...highlights, created]);
      setNewHighlight({ eyebrow: '', title: '', description: '', button_text: '', button_link: '', image_url: '', sort_order: 0, active: true });
    } catch (err) {
      alert('Erro ao criar destaque.');
    }
  };

  const handleDeleteHighlight = async (id) => {
    if (!confirm('Deseja excluir este destaque?')) return;
    try {
      await deleteHomeHighlight(id);
      setHighlights(highlights.filter(h => h.id !== id));
    } catch (err) {
      alert('Erro ao excluir destaque.');
    }
  };

  const handleUpdateHighlightOrder = async (id, highlight, newOrder) => {
    try {
      const updated = await updateHomeHighlight(id, { ...highlight, sort_order: newOrder });
      setHighlights(highlights.map(h => h.id === id ? updated : h).sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      alert('Erro ao atualizar a ordem do destaque.');
    }
  };

  const handleHighlightDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleHighlightDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...highlights];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    
    const withOrder = reordered.map((h, i) => ({ ...h, sort_order: i + 1 }));
    setHighlights(withOrder);
    setDragIndex(null);
    setDragOverIndex(null);
    
    try {
      await Promise.all(withOrder.map(h => updateHomeHighlight(h.id, h)));
    } catch (err) {
      console.error("Erro ao salvar ordem arrastada:", err);
    }
  };

  // Bulk upload handlers
  const addFilesToQueue = useCallback((files) => {
    const newItems = Array.from(files).map(f => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      file: f,
      status: 'pending',
      url: null,
      error: null,
      preview: URL.createObjectURL(f),
    }));
    setBulkQueue(prev => [...prev, ...newItems]);
  }, []);

  const handleBulkDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) addFilesToQueue(files);
  }, [addFilesToQueue]);

  const handleBulkDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleBulkDragLeave = () => setIsDragging(false);

  const removeFromQueue = (id) => {
    setBulkQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearDoneFromQueue = () => {
    setBulkQueue(prev => prev.filter(item => item.status !== 'done'));
  };

  const handleBulkUpload = async () => {
    const pending = bulkQueue.filter(item => item.status === 'pending');
    if (pending.length === 0) return;
    setIsBulkUploading(true);

    // Mark all pending as 'uploading'
    setBulkQueue(prev => prev.map(item =>
      item.status === 'pending' ? { ...item, status: 'uploading' } : item
    ));

    try {
      const files = pending.map(item => item.file);
      const result = await uploadImagesBulk(files);
      const uploaded = result.uploaded || [];

      // Save each photo to DB
      const savedPhotos = [];
      for (let i = 0; i < uploaded.length; i++) {
        const uploadedFile = uploaded[i];
        try {
          const created = await createPortfolioPhoto({
            category_id: bulkCategoryId || null,
            image_url: uploadedFile.url,
            is_cover: false,
            is_featured_home: bulkIsFeatured,
            active: true,
          });
          savedPhotos.push(created);
        } catch (dbErr) {
          console.error('DB save failed for', uploadedFile.originalName, dbErr);
        }
      }

      // Update queue status
      setBulkQueue(prev => {
        const updatedPending = [...pending];
        return prev.map(item => {
          if (item.status !== 'uploading') return item;
          const idx = updatedPending.findIndex(p => p.id === item.id);
          if (idx === -1) return { ...item, status: 'error', error: 'Não enviado' };
          const up = uploaded[idx];
          if (up) {
            return { ...item, status: 'done', url: up.url };
          }
          return { ...item, status: 'error', error: 'Falha ao salvar' };
        });
      });

      if (savedPhotos.length > 0) {
        setPhotos(prev => [...prev, ...savedPhotos]);
      }
    } catch (err) {
      setBulkQueue(prev => prev.map(item =>
        item.status === 'uploading' ? { ...item, status: 'error', error: err.message || 'Erro' } : item
      ));
    } finally {
      setIsBulkUploading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Carregando configurações...</div>;
  }

  return (
    <div className="homepage-settings-container">
      <header className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Página Inicial</h2>
          <p>Personalize todos os textos, imagens, depoimentos e categorias do seu site público</p>
        </div>
        <div>
          <button 
            className="btn btn-accent" 
            onClick={() => window.open('/?edit=true', '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Layout size={18} />
            Editor Visual
          </button>
        </div>
      </header>

      <div className="settings-tabs">
        <button className={activeTab === 'hero' ? 'active' : ''} onClick={() => setActiveTab('hero')}><Layout size={18} /> Hero & Quem Somos</button>
        <button className={activeTab === 'aboutpage' ? 'active' : ''} onClick={() => setActiveTab('aboutpage')}><FileText size={18} /> Página Sobre</button>
        <button className={activeTab === 'formpage' ? 'active' : ''} onClick={() => setActiveTab('formpage')}><FileText size={18} /> Página Formulário</button>
        <button className={activeTab === 'highlights' ? 'active' : ''} onClick={() => setActiveTab('highlights')}><Globe size={18} /> Destaques</button>
        <button className={activeTab === 'portfolio' ? 'active' : ''} onClick={() => setActiveTab('portfolio')}><List size={18} /> Categorias Portfólio</button>
        <button className={activeTab === 'photos' ? 'active' : ''} onClick={() => setActiveTab('photos')}><Image size={18} /> Destaques & Fotos</button>
        <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}><BarChart size={18} /> Estatísticas & Depoimentos</button>
        <button className={activeTab === 'seo' ? 'active' : ''} onClick={() => setActiveTab('seo')}><Globe size={18} /> Instagram & SEO</button>
        <button className={activeTab === 'customization' ? 'active' : ''} onClick={() => setActiveTab('customization')}><Layout size={18} /> Personalização</button>
      </div>

      <div className="settings-content-card">
        {activeTab === 'hero' && (
          <form onSubmit={handleSaveSettings}>
            <div className="section-title">
              <h3>Banner Principal (Hero)</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.hero_active} 
                  onChange={(e) => setSettings({ ...settings, hero_active: e.target.checked })} 
                />
                Ativar Banner
              </label>
            </div>
            
            <div className="form-grid">
              <label className="wide">
                Título Principal
                <input 
                  type="text" 
                  value={settings.hero_title || ''} 
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} 
                  placeholder="em memórias eternas."
                />
              </label>
              
              <label className="wide">
                Subtítulo / Apresentação (Eyebrow)
                <input 
                  type="text" 
                  value={settings.hero_subtitle || ''} 
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} 
                  placeholder="Transformamos momentos"
                />
              </label>

              <label className="wide">
                Descrição do Banner
                <textarea 
                  rows="3"
                  value={settings.hero_desc || ''} 
                  onChange={(e) => setSettings({ ...settings, hero_desc: e.target.value })} 
                  placeholder="Fotografia e filmagem com alma..."
                />
              </label>
              
              <label>
                Texto do Botão
                <input 
                  type="text" 
                  value={settings.hero_btn_text || ''} 
                  onChange={(e) => setSettings({ ...settings, hero_btn_text: e.target.value })} 
                  placeholder="Quero meu orçamento"
                />
              </label>

              <label>
                Link do Botão
                <input 
                  type="text" 
                  value={settings.hero_btn_link || ''} 
                  onChange={(e) => setSettings({ ...settings, hero_btn_link: e.target.value })} 
                  placeholder="/formulario"
                />
              </label>

              <div style={{ gridColumn: 'span 2', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '0.5rem' }}>✨ Novo Gerenciador de Hero</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  A imagem de fundo e o carrossel animado agora são configurados em uma área exclusiva. 
                  Acesse <strong>"Hero Principal"</strong> no menu lateral para gerenciar as fotos do topo do seu site.
                </p>
              </div>
            </div>

            <hr />

            <div className="section-title">
              <h3>Seção Quem Somos (Home)</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Configure o bloco "Por que escolher a MayClick?" que aparece na página inicial.</p>
            </div>
            <div className="form-grid">
              <label className="wide">
                Título
                <input 
                  type="text" 
                  value={settings.about_title || ''} 
                  onChange={(e) => setSettings({ ...settings, about_title: e.target.value })} 
                  placeholder="Por que escolher a MayClick?"
                />
              </label>
              <label className="wide">
                Texto Institucional
                <textarea 
                  rows="3"
                  value={settings.institutional_text || ''} 
                  onChange={(e) => setSettings({ ...settings, institutional_text: e.target.value })} 
                  placeholder="Mais que fotografias, entregamos experiências..."
                />
              </label>
              <label className="wide">
                Checklist de Vantagens (1 por linha)
                <textarea 
                  rows="5"
                  value={settings.about_bullets || ''} 
                  onChange={(e) => setSettings({ ...settings, about_bullets: e.target.value })} 
                  placeholder="Equipe especializada e apaixonada&#10;Equipamentos de alta performance&#10;Edição profissional..."
                />
              </label>

              <label>
                Texto do Botão
                <input 
                  type="text" 
                  value={settings.about_button_text || ''} 
                  onChange={(e) => setSettings({ ...settings, about_button_text: e.target.value })} 
                  placeholder="Conheça nossa história"
                />
              </label>
              <div style={{ gridColumn: 'span 2' }}>
                <ImageUploader
                  label="Imagem da Seção"
                  value={settings.about_parallax_image_url || ''}
                  onChange={(url) => setSettings({ ...settings, about_parallax_image_url: url })}
                  placeholder="URL da imagem com o selo de anos"
                />
              </div>
            </div>

            <hr />

            <div className="section-title">
              <h3>Estatísticas (Números de Rodapé)</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Altere os números de destaque exibidos no final da página inicial.</p>
            </div>
            <div className="form-grid">
              <label>
                Eventos Realizados
                <input 
                  type="text" 
                  value={settings.stat_events || ''} 
                  onChange={(e) => setSettings({ ...settings, stat_events: e.target.value })} 
                  placeholder="Ex: 500+"
                />
              </label>
              <label>
                Clientes Satisfeitos
                <input 
                  type="text" 
                  value={settings.stat_clients || ''} 
                  onChange={(e) => setSettings({ ...settings, stat_clients: e.target.value })} 
                  placeholder="Ex: 98%"
                />
              </label>
              <label>
                Prêmios Recebidos
                <input 
                  type="text" 
                  value={settings.stat_stories || ''} 
                  onChange={(e) => setSettings({ ...settings, stat_stories: e.target.value })} 
                  placeholder="Ex: 15+"
                />
              </label>
              <label>
                Anos de Experiência
                <input 
                  type="text" 
                  value={settings.stat_experience || ''} 
                  onChange={(e) => setSettings({ ...settings, stat_experience: e.target.value })} 
                  placeholder="Ex: 7"
                />
              </label>
            </div>

            <button className="btn btn-accent" type="submit" disabled={saving}>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'aboutpage' && (
          <form onSubmit={handleSaveSettings}>
            <div className="section-title">
              <h3>Página Exclusiva "Sobre a Empresa"</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Configure o conteúdo completo da página /sobre, onde você contará a história detalhada da empresa.</p>
            </div>
            
            <div className="form-grid">
              <div style={{ gridColumn: 'span 2' }}>
                <ImageUploader
                  label="Foto Principal do Cabeçalho (Hero)"
                  value={settings.about_page_hero_image || ''}
                  onChange={(url) => setSettings({ ...settings, about_page_hero_image: url })}
                  placeholder="Imagem bem larga para o topo da página"
                />
              </div>

              <label className="wide">
                A História da Empresa
                <p style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  Escreva um texto bonito e inspirador. As quebras de linha serão respeitadas na exibição.
                </p>
                <textarea 
                  rows="10"
                  value={settings.about_page_text || ''} 
                  onChange={(e) => setSettings({ ...settings, about_page_text: e.target.value })} 
                  placeholder="Nossa jornada começou em..."
                />
              </label>

              <div className="section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <h4>Galeria de Bastidores / Equipe</h4>
                <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Adicione até 3 fotos extras para ilustrar sua história.</p>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <ImageUploader
                  label="Foto 1"
                  value={settings.about_page_gallery_1 || ''}
                  onChange={(url) => setSettings({ ...settings, about_page_gallery_1: url })}
                />
                <ImageUploader
                  label="Foto 2"
                  value={settings.about_page_gallery_2 || ''}
                  onChange={(url) => setSettings({ ...settings, about_page_gallery_2: url })}
                />
                <ImageUploader
                  label="Foto 3"
                  value={settings.about_page_gallery_3 || ''}
                  onChange={(url) => setSettings({ ...settings, about_page_gallery_3: url })}
                />
              </div>
            </div>

            <button className="btn btn-accent" type="submit" disabled={saving} style={{ marginTop: '2rem' }}>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'formpage' && (
          <form onSubmit={handleSaveSettings}>
            <div className="section-title">
              <h3>Página Exclusiva do Formulário</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Configure a imagem que aparecerá no lado esquerdo da página de contato/orçamento.</p>
            </div>
            
            <div className="form-grid">
              <div style={{ gridColumn: 'span 2' }}>
                <ImageUploader
                  label="Foto Lateral do Formulário (Recomendado: Vertical/Retrato)"
                  value={settings.form_page_image_url || ''}
                  onChange={(url) => setSettings({ ...settings, form_page_image_url: url })}
                  placeholder="URL ou Upload da Imagem"
                />
              </div>
            </div>

            <button className="btn btn-accent" type="submit" disabled={saving} style={{ marginTop: '2rem' }}>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'highlights' && (
          <div>
            <div className="section-title">
              <h3>Destaques Dinâmicos</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Esses blocos aparecem abaixo do portfólio na página inicial. Eles alternam entre imagem na esquerda e na direita automaticamente.</p>
            </div>

            <form onSubmit={handleCreateHighlight} className="creation-box">
              <h4 style={{ marginBottom: '1rem', color: '#44403c' }}>Adicionar Novo Destaque</h4>
              <div className="form-grid">
                <label>
                  Sobretítulo (Eyebrow)
                  <input type="text" value={newHighlight.eyebrow} onChange={e => setNewHighlight({...newHighlight, eyebrow: e.target.value})} placeholder="Ex: Destaque" />
                </label>
                <label>
                  Título Principal
                  <input type="text" value={newHighlight.title} onChange={e => setNewHighlight({...newHighlight, title: e.target.value})} placeholder="Ex: Sonhos de 15 Anos" required />
                </label>
                <label className="wide">
                  Descrição Curta
                  <textarea rows="2" value={newHighlight.description} onChange={e => setNewHighlight({...newHighlight, description: e.target.value})} placeholder="Breve texto sobre o destaque..." />
                </label>
                <label>
                  Texto do Botão
                  <input type="text" value={newHighlight.button_text} onChange={e => setNewHighlight({...newHighlight, button_text: e.target.value})} placeholder="Ex: Ver Galeria" />
                </label>
                <label>
                  Link do Botão
                  <input type="text" value={newHighlight.button_link} onChange={e => setNewHighlight({...newHighlight, button_link: e.target.value})} placeholder="Ex: /portfolio/debutantes" />
                </label>
                <label style={{ width: '100px' }}>
                  Ordem
                  <input type="number" value={newHighlight.sort_order} onChange={e => setNewHighlight({...newHighlight, sort_order: parseInt(e.target.value)})} />
                </label>
                <div style={{ gridColumn: 'span 2' }}>
                  <ImageUploader
                    label="Imagem do Destaque"
                    value={newHighlight.image_url}
                    onChange={(url) => setNewHighlight({ ...newHighlight, image_url: url })}
                    placeholder="URL ou Upload da Imagem"
                  />
                </div>
              </div>
              <button className="btn btn-accent" type="submit" style={{ marginTop: '1rem' }}>
                <Plus size={18} /> Adicionar Destaque
              </button>
            </form>

            <table className="settings-table">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Imagem</th>
                  <th>Título / Sobretítulo</th>
                  <th>Botão</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {highlights.map((h, index) => (
                  <tr 
                    key={h.id}
                    draggable
                    onDragStart={(e) => handleHighlightDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleHighlightDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={dragOverIndex === index ? 'drag-over' : ''}
                    style={{ cursor: 'move' }}
                  >
                    <td style={{ width: '100px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GripVertical size={16} style={{ color: '#a8a29e' }} />
                        <input 
                          type="number" 
                          value={h.sort_order} 
                          onChange={(e) => setHighlights(highlights.map(item => item.id === h.id ? { ...item, sort_order: parseInt(e.target.value) || 0 } : item))}
                          onBlur={(e) => handleUpdateHighlightOrder(h.id, h, parseInt(e.target.value))}
                          style={{ width: '60px', padding: '0.25rem' }}
                        />
                      </div>
                    </td>
                    <td>
                      {h.image_url && <img src={h.image_url} alt={h.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                    </td>
                    <td>
                      <strong>{h.title}</strong><br/>
                      <span style={{ fontSize: '0.8rem', color: '#78716c' }}>{h.eyebrow}</span>
                    </td>
                    <td>
                      {h.button_text && <span style={{ fontSize: '0.85rem' }}>{h.button_text} <br/> <code>{h.button_link}</code></span>}
                    </td>
                    <td>
                      <span className={`status-badge ${h.active ? 'active' : 'inactive'}`}>
                        {h.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="icon-button danger" onClick={() => handleDeleteHighlight(h.id)}>
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {highlights.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#a8a29e' }}>Nenhum destaque criado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <div className="section-title">
              <h3>Gerenciar Categorias de Portfólio</h3>
              <span className="section-badge">{categories.length} categoria{categories.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Form criar categoria */}
            <form onSubmit={handleCreateCategory} className="creation-box form-grid">
              <label>
                Nome
                <input
                  type="text"
                  required
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                  placeholder="Ex: Debutantes"
                />
              </label>
              <label>
                Identificador (Slug)
                <input
                  type="text"
                  required
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="ex: debutantes"
                />
              </label>
              <label className="wide">
                Descrição Curta
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Descrição exibida no site"
                />
              </label>
              <div style={{ gridColumn: 'span 2' }}>
                <ImageUploader
                  label="Imagem de Capa da Categoria"
                  value={newCategory.cover_image_url}
                  onChange={(url) => setNewCategory({ ...newCategory, cover_image_url: url })}
                  placeholder="https://..."
                />
              </div>
              <button className="btn btn-accent" type="submit">
                <Plus size={18} /> Adicionar Categoria
              </button>
            </form>

            {/* ── Drag-and-drop reorder list ── */}
            <div className="reorder-section">
              <div className="reorder-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ArrowUpDown size={18} />
                  <span>Arrastar para reordenar</span>
                </div>
                <div className="reorder-status">
                  {reorderSaving && <><Loader size={14} className="spinning" /> Salvando...</>}
                  {reorderSaved && !reorderSaving && <><CheckCircle size={14} style={{ color: '#16a34a' }} /> Ordem salva!</>}
                  {!reorderSaving && !reorderSaved && <span style={{ color: '#a8a29e', fontSize: '0.8rem' }}>Arraste os itens para reordenar</span>}
                </div>
              </div>

              <div className="sortable-list">
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className={`sortable-item
                      ${dragIndex === index ? 'dragging' : ''}
                      ${dragOverIndex === index && dragIndex !== index ? 'drag-over' : ''}
                    `}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Position number */}
                    <span className="sort-position">{index + 1}</span>

                    {editingCategoryId === cat.id ? (
                      <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editingCategoryData.title}
                          onChange={(e) => setEditingCategoryData({ ...editingCategoryData, title: e.target.value })}
                          placeholder="Título"
                          style={{ flex: 1, padding: '0.5rem' }}
                        />
                        <input
                          type="text"
                          value={editingCategoryData.slug}
                          onChange={(e) => setEditingCategoryData({ ...editingCategoryData, slug: e.target.value })}
                          placeholder="Slug"
                          style={{ flex: 1, padding: '0.5rem' }}
                        />
                        <input
                          type="text"
                          value={editingCategoryData.cover_image_url || ''}
                          onChange={(e) => setEditingCategoryData({ ...editingCategoryData, cover_image_url: e.target.value })}
                          placeholder="URL da Imagem (Capa)"
                          style={{ flex: 2, padding: '0.5rem' }}
                        />
                        <button type="button" className="btn btn-accent" style={{ padding: '0.5rem' }} onClick={handleUpdateCategorySubmit}>Salvar</button>
                        <button type="button" className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => setEditingCategoryId(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <>
                        <span className="sort-handle" title="Arraste para reordenar">
                          <GripVertical size={20} />
                        </span>

                        {cat.cover_image_url && (
                          <img src={cat.cover_image_url} alt={cat.title} className="sort-thumb"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        )}

                        <div className="sort-info">
                          <strong>{cat.title}</strong>
                          <code>/portfolio/{cat.slug}</code>
                        </div>

                        <span className={`sort-badge ${cat.active ? 'active' : 'inactive'}`}>
                          {cat.active ? 'Ativo' : 'Inativo'}
                        </span>

                        <div className="sort-arrows">
                          <button
                            type="button"
                            className="arrow-btn"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditingCategoryData({ ...cat });
                            }}
                            title="Editar Categoria"
                            style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="arrow-btn"
                            onClick={() => moveCategory(index, -1)}
                            disabled={index === 0}
                            title="Mover para cima"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            className="arrow-btn"
                            onClick={() => moveCategory(index, 1)}
                            disabled={index === categories.length - 1}
                            title="Mover para baixo"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="icon-button danger"
                          onClick={() => handleDeleteCategory(cat.id)}
                          title="Excluir categoria"
                        >
                          <Trash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="sortable-empty">
                    Nenhuma categoria cadastrada. Adicione uma acima.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            {/* ===== BULK UPLOAD SECTION ===== */}
            <div className="section-title">
              <h3>Upload em Massa — Portfólio</h3>
              <span className="section-badge">{photos.length} foto{photos.length !== 1 ? 's' : ''} cadastrada{photos.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Bulk Options */}
            <div className="bulk-options-row">
              <label className="bulk-option-label">
                <FolderOpen size={16} />
                Categoria para todas:
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  className="bulk-select"
                >
                  <option value="">Nenhuma (Destaque geral)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
              <label className="checkbox-label bulk-featured-label">
                <input
                  type="checkbox"
                  checked={bulkIsFeatured}
                  onChange={(e) => setBulkIsFeatured(e.target.checked)}
                />
                Destacar na Home
              </label>
            </div>

            {/* Drop Zone */}
            <div
              className={`bulk-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDrop={handleBulkDrop}
              onDragOver={handleBulkDragOver}
              onDragLeave={handleBulkDragLeave}
              onClick={() => bulkFileRef.current?.click()}
            >
              <Upload size={36} />
              <p className="drop-main">Arraste as fotos aqui ou clique para selecionar</p>
              <p className="drop-sub">JPG, PNG, WEBP ou GIF · Até 50 fotos por vez · Máx. 10MB cada</p>
              <input
                ref={bulkFileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.length) addFilesToQueue(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Queue */}
            {bulkQueue.length > 0 && (
              <div className="bulk-queue">
                <div className="bulk-queue-header">
                  <span>{bulkQueue.length} arquivo{bulkQueue.length !== 1 ? 's' : ''} na fila</span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="queue-action-btn" onClick={clearDoneFromQueue}>
                      Limpar concluídos
                    </button>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={handleBulkUpload}
                      disabled={isBulkUploading || bulkQueue.filter(i => i.status === 'pending').length === 0}
                    >
                      {isBulkUploading
                        ? <><Loader size={16} className="spinning" /> Enviando...</>
                        : <><Upload size={16} /> Enviar {bulkQueue.filter(i => i.status === 'pending').length} foto{bulkQueue.filter(i => i.status === 'pending').length !== 1 ? 's' : ''}</>
                      }
                    </button>
                  </div>
                </div>

                <div className="bulk-queue-list">
                  {bulkQueue.map((item) => (
                    <div key={item.id} className={`queue-item status-${item.status}`}>
                      <img src={item.preview} alt={item.name} className="queue-thumb" />
                      <div className="queue-item-info">
                        <span className="queue-filename">{item.name}</span>
                        {item.status === 'pending' && <span className="queue-status">Aguardando...</span>}
                        {item.status === 'uploading' && <span className="queue-status uploading"><Loader size={12} className="spinning" /> Enviando...</span>}
                        {item.status === 'done' && <span className="queue-status done"><CheckCircle size={12} /> Salvo!</span>}
                        {item.status === 'error' && <span className="queue-status error"><AlertCircle size={12} /> {item.error}</span>}
                      </div>
                      {item.status !== 'uploading' && (
                        <button type="button" className="queue-remove" onClick={() => removeFromQueue(item.id)}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PHOTO GALLERY ===== */}
            <div className="section-title" style={{ marginTop: '3rem' }}>
              <h3>Fotos Cadastradas</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Filter size={16} />
                <select
                  value={filterCatId}
                  onChange={(e) => setFilterCatId(e.target.value)}
                  className="bulk-select"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="">Sem categoria</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="photos-grid">
              {photos
                .filter(p => {
                  if (filterCatId === 'all') return true;
                  if (filterCatId === '') return !p.category_id;
                  return p.category_id === filterCatId;
                })
                .map((p) => {
                  const category = categories.find(c => c.id === p.category_id);
                  return (
                    <div className="photo-card" key={p.id}>
                      <img src={p.image_url} alt="Portfólio" onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Erro'; }} />
                      <div className="photo-card-body">
                        <span className="photo-cat">{category ? category.title : 'Destaque Geral'}</span>
                        <div className="photo-badges">
                          {p.is_featured_home && <span className="badge featured">Destaque</span>}
                          {p.is_cover && <span className="badge cover">Capa</span>}
                        </div>
                        <button className="icon-button danger" onClick={() => handleDeletePhoto(p.id)}>
                          <Trash size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  );
                })
              }
              {photos.filter(p => {
                if (filterCatId === 'all') return true;
                if (filterCatId === '') return !p.category_id;
                return p.category_id === filterCatId;
              }).length === 0 && (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                  Nenhuma foto encontrada para este filtro.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <form onSubmit={handleSaveSettings}>
              <div className="section-title">
                <h3>Estatísticas / Números</h3>
              </div>
              <div className="form-grid">
                <label>
                  Eventos Realizados (Ex: 500+)
                  <input 
                    type="text" 
                    value={settings.stats_events || ''} 
                    onChange={(e) => setSettings({ ...settings, stats_events: e.target.value })} 
                    placeholder="500+"
                  />
                </label>
                <label>
                  Clientes Satisfeitos (Ex: 98%)
                  <input 
                    type="text" 
                    value={settings.stats_clients || ''} 
                    onChange={(e) => setSettings({ ...settings, stats_clients: e.target.value })} 
                    placeholder="98%"
                  />
                </label>
                <label>
                  Anos de Experiência (Ex: 7 ANOS)
                  <input 
                    type="text" 
                    value={settings.stats_experience || ''} 
                    onChange={(e) => setSettings({ ...settings, stats_experience: e.target.value })} 
                    placeholder="7 ANOS"
                  />
                </label>
                <label>
                  Localização (Ex: SÃO PAULO)
                  <input 
                    type="text" 
                    value={settings.stats_location || ''} 
                    onChange={(e) => setSettings({ ...settings, stats_location: e.target.value })} 
                    placeholder="SÃO PAULO"
                  />
                </label>
              </div>
              <button className="btn btn-accent" type="submit" disabled={saving}>
                <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Estatísticas'}
              </button>
            </form>

            <hr />

            <div className="section-title">
              <h3>Depoimentos de Clientes</h3>
            </div>

            <form onSubmit={handleCreateTestimonial} className="creation-box form-grid">
              <label>
                Nome do Cliente
                <input 
                  type="text" 
                  required
                  value={newTestimonial.client_name} 
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, client_name: e.target.value })}
                  placeholder="Ex: Ana Paula"
                />
              </label>
              <div>
                <ImageUploader
                  label="Foto do Cliente (Opcional)"
                  value={newTestimonial.client_photo_url || ''}
                  onChange={(url) => setNewTestimonial({ ...newTestimonial, client_photo_url: url })}
                  placeholder="URL ou Upload da foto"
                />
              </div>
              <label>
                Estrelas (1 a 5)
                <input 
                  type="number" 
                  min="1" 
                  max="5"
                  required
                  value={newTestimonial.stars} 
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, stars: parseInt(e.target.value) })}
                />
              </label>
              <label className="wide">
                Texto do Depoimento
                <textarea 
                  rows="3"
                  required
                  value={newTestimonial.content} 
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                  placeholder="O que o cliente disse..."
                />
              </label>
              <button className="btn btn-accent" type="submit">
                <Plus size={18} /> Cadastrar Depoimento
              </button>
            </form>

            <table className="settings-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Foto</th>
                  <th>Depoimento</th>
                  <th>Nota</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.client_name}</strong></td>
                    <td>
                      {t.client_photo_url ? (
                        <img src={t.client_photo_url} alt={t.client_name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <span style={{ color: '#a8a29e' }}>Sem foto</span>
                      )}
                    </td>
                    <td>{t.content}</td>
                    <td>{Array(t.stars).fill('⭐').join('')}</td>
                    <td>
                      <button className="icon-button danger" onClick={() => handleDeleteTestimonial(t.id)}>
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'seo' && (
          <form onSubmit={handleSaveSettings}>
            <div className="section-title">
              <h3>Integração com Instagram</h3>
            </div>
            <div className="form-grid">
              <label>
                Usuário do Instagram (sem @)
                <input 
                  type="text" 
                  value={settings.instagram_username || ''} 
                  onChange={(e) => setSettings({ ...settings, instagram_username: e.target.value })} 
                  placeholder="mayclick"
                />
              </label>
              <div className="check-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.instagram_active}
                    onChange={(e) => setSettings({ ...settings, instagram_active: e.target.checked })}
                  />
                  Mostrar banner do Instagram na Home
                </label>
              </div>
            </div>

            <hr />

            <div className="section-title">
              <h3>Otimização de Motores de Busca (SEO)</h3>
            </div>
            <div className="form-grid">
              <label className="wide">
                Título do Site (Title Tag)
                <input 
                  type="text" 
                  value={settings.seo_title || ''} 
                  onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })} 
                  placeholder="Mayclick Photography | Eternizando seus momentos"
                />
              </label>
              <label className="wide">
                Meta Descrição
                <textarea 
                  rows="3"
                  value={settings.seo_description || ''} 
                  onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })} 
                  placeholder="Descrição exibida no Google sobre sua empresa..."
                />
              </label>
              <label className="wide">
                Palavras-chave (Separadas por vírgula)
                <input 
                  type="text" 
                  value={settings.seo_keywords || ''} 
                  onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })} 
                  placeholder="fotografo sao paulo, debutantes, casamentos"
                />
              </label>
              <div style={{ gridColumn: 'span 2' }}>
                <ImageUploader
                  label="Imagem de Compartilhamento (og:image)"
                  value={settings.seo_og_image || ''}
                  onChange={(url) => setSettings({ ...settings, seo_og_image: url })}
                  placeholder="URL de imagem para o Facebook/WhatsApp"
                />
              </div>
            </div>

            <button className="btn btn-accent" type="submit" disabled={saving}>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'customization' && (
          <form onSubmit={handleSaveSettings}>
            <div className="section-title">
              <h3>Cores e Identidade Visual</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Personalize as cores principais que afetam botões, destaques e fundos do site público.</p>
            </div>
            
            <div className="form-grid">
              <label>
                Cor Primária (Textos Principais, Botões Escuros)
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={settings.color_primary || '#1A1A1A'} 
                    onChange={(e) => setSettings({ ...settings, color_primary: e.target.value })} 
                    style={{ padding: '0', width: '50px', height: '40px', cursor: 'pointer', border: 'none' }}
                  />
                  <input 
                    type="text" 
                    value={settings.color_primary || '#1A1A1A'} 
                    onChange={(e) => setSettings({ ...settings, color_primary: e.target.value })} 
                    style={{ flex: 1 }}
                  />
                </div>
              </label>

              <label>
                Cor de Destaque / Accent (Botões Principais, Detalhes)
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={settings.color_accent || '#D4AF37'} 
                    onChange={(e) => setSettings({ ...settings, color_accent: e.target.value })} 
                    style={{ padding: '0', width: '50px', height: '40px', cursor: 'pointer', border: 'none' }}
                  />
                  <input 
                    type="text" 
                    value={settings.color_accent || '#D4AF37'} 
                    onChange={(e) => setSettings({ ...settings, color_accent: e.target.value })} 
                    style={{ flex: 1 }}
                  />
                </div>
              </label>
            </div>

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e7e5e4' }} />

            <div className="section-title">
              <h3>Tipografia (Fontes do Google)</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', marginTop: '0.5rem' }}>Escolha as fontes utilizadas para os títulos e para os textos normais do site.</p>
            </div>

            <div className="form-grid">
              <label>
                Fonte dos Títulos (Headings)
                <select 
                  value={settings.font_heading || 'Outfit'} 
                  onChange={(e) => setSettings({ ...settings, font_heading: e.target.value })}
                >
                  <option value="Outfit">Outfit</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Lora">Lora</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Cinzel">Cinzel</option>
                  <option value="Cormorant Garamond">Cormorant Garamond</option>
                </select>
              </label>

              <label>
                Fonte dos Textos (Body)
                <select 
                  value={settings.font_body || 'Inter'} 
                  onChange={(e) => setSettings({ ...settings, font_body: e.target.value })}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </label>
            </div>

            <button className="btn btn-accent" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .homepage-settings-container {
          padding: 2rem;
          background: #fafaf9;
          min-height: 100vh;
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .settings-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e7e5e4;
          padding-bottom: 0.5rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .settings-tabs::-webkit-scrollbar {
          height: 6px;
        }
        
        .settings-tabs::-webkit-scrollbar-thumb {
          background: #d6d3d1;
          border-radius: 4px;
        }

        .settings-tabs button {
          background: none;
          border: none;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #78716c;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          border-radius: 6px;
          white-space: nowrap;
        }

        .settings-tabs button.active {
          color: #d4af37;
          background-color: #fefcf0;
        }

        .settings-content-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e7e5e4;
          padding: 2.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #f5f5f4;
          padding-bottom: 1rem;
        }

        .section-title h3 {
          font-size: 1.25rem;
          color: #1c1917;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-grid label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #44403c;
        }

        .form-grid label.wide {
          grid-column: span 2;
        }

        .form-grid input, .form-grid textarea, .form-grid select {
          padding: 0.75rem 1rem;
          border: 1px solid #d6d3d1;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
        }

        .form-grid input:focus, .form-grid textarea:focus {
          border-color: #d4af37;
        }

        .creation-box {
          background: #fcfbf9;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .settings-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .settings-table th, .settings-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e7e5e4;
        }

        .settings-table th {
          background-color: #faf9f6;
          font-weight: 700;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .photo-card {
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }

        .photo-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .photo-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .photo-cat {
          font-size: 0.75rem;
          font-weight: 700;
          color: #78716c;
          text-transform: uppercase;
        }

        .photo-badges {
          display: flex;
          gap: 0.25rem;
        }

        .badge {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
        }

        .badge.featured {
          background-color: #fef3c7;
          color: #d97706;
        }

        .badge.cover {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          cursor: pointer;
        }

        .check-group {
          display: flex;
          gap: 1.5rem;
          grid-column: span 2;
        }

        hr {
          border: 0;
          border-top: 1px solid #e7e5e4;
          margin: 2rem 0;
        }

        /* --- ImageUploader --- */
        .image-uploader {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .image-uploader-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #44403c;
        }

        .image-uploader-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .uploader-tab {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.9rem;
          border: 1px solid #d6d3d1;
          border-radius: 6px;
          background: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          color: #78716c;
          cursor: pointer;
          transition: all 0.2s;
        }

        .uploader-tab.active {
          background: #d4af37;
          border-color: #d4af37;
          color: #fff;
        }

        .image-uploader-url-row {
          display: flex;
          gap: 0.5rem;
        }

        .image-uploader-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #d6d3d1;
          border-radius: 8px;
          outline: none;
          font-size: 0.95rem;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .image-uploader-input:focus {
          border-color: #d4af37;
        }

        .image-drop-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
          border: 2px dashed #d6d3d1;
          border-radius: 10px;
          cursor: pointer;
          color: #78716c;
          font-size: 0.875rem;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
          background: #fafaf9;
        }

        .image-drop-zone:hover {
          border-color: #d4af37;
          background: #fffdf0;
          color: #a88e28;
        }

        .drop-zone-uploading {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #d4af37;
          font-weight: 600;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }

        .image-uploader-error {
          font-size: 0.8rem;
          color: #ef4444;
          font-weight: 600;
        }

        .image-uploader-preview {
          position: relative;
          display: inline-block;
          max-width: 200px;
        }

        .image-uploader-preview img {
          width: 200px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e7e5e4;
          display: block;
        }

        .preview-clear {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }
        /* --- end ImageUploader --- */

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-grid label.wide, .check-group, .form-grid > div {
            grid-column: span 1 !important;
          }
          .photos-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .settings-content-card {
            padding: 1.25rem;
          }
          .settings-table-wrapper {
            overflow-x: auto;
          }
          .bulk-options-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .bulk-featured-label {
            margin-left: 0;
          }
          .bulk-queue-header > div {
            flex-wrap: wrap;
            width: 100%;
          }
          .bulk-queue-header button {
            flex: 1;
          }
          .sortable-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .sortable-item .sort-arrows {
            flex-direction: row;
            margin-top: 0.5rem;
          }
        }

        /* ===== BULK UPLOAD STYLES ===== */
        .section-badge {
          background: #f5f0e8;
          color: #92400e;
          border-radius: 20px;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .bulk-options-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 1.25rem;
          background: #fafaf9;
          border: 1px solid #e7e5e4;
          border-radius: 10px;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .bulk-option-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #44403c;
        }

        .bulk-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d6d3d1;
          border-radius: 6px;
          font-size: 0.875rem;
          font-family: inherit;
          background: #fff;
          cursor: pointer;
          outline: none;
        }

        .bulk-select:focus {
          border-color: #d4af37;
        }

        .bulk-drop-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 3rem 2rem;
          border: 2.5px dashed #d6d3d1;
          border-radius: 14px;
          cursor: pointer;
          color: #78716c;
          text-align: center;
          transition: all 0.25s ease;
          background: #fafaf9;
          margin-bottom: 1.5rem;
          user-select: none;
        }

        .bulk-drop-zone:hover, .bulk-drop-zone.dragging {
          border-color: #d4af37;
          background: linear-gradient(135deg, #fffcf0 0%, #fefcf5 100%);
          color: #a88e28;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.08);
          transform: translateY(-2px);
        }

        .drop-main {
          font-size: 1.05rem;
          font-weight: 700;
          color: inherit;
          margin: 0;
        }

        .drop-sub {
          font-size: 0.8rem;
          color: #a8a29e;
          margin: 0;
        }

        .bulk-queue {
          border: 1px solid #e7e5e4;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .bulk-featured-label {
          margin-left: auto;
        }

        .bulk-queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: #f5f5f4;
          border-bottom: 1px solid #e7e5e4;
          font-size: 0.875rem;
          font-weight: 700;
          color: #44403c;
        }

        .queue-action-btn {
          background: none;
          border: 1px solid #d6d3d1;
          border-radius: 6px;
          padding: 0.4rem 0.9rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #78716c;
          cursor: pointer;
          transition: all 0.2s;
        }

        .queue-action-btn:hover {
          background: #fff;
          border-color: #a8a29e;
          color: #44403c;
        }

        .bulk-queue-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid #f5f5f4;
          transition: background 0.15s;
        }

        .queue-item:last-child { border-bottom: none; }

        .queue-item.status-done {
          background: #f0fdf4;
        }

        .queue-item.status-error {
          background: #fff1f2;
        }

        .queue-item.status-uploading {
          background: #fffcf0;
        }

        .queue-thumb {
          width: 52px;
          height: 52px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e7e5e4;
          flex-shrink: 0;
        }

        .queue-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .queue-filename {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1c1917;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .queue-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: #78716c;
        }

        .queue-status.uploading { color: #d97706; }
        .queue-status.done { color: #16a34a; font-weight: 700; }
        .queue-status.error { color: #dc2626; font-weight: 700; }

        .queue-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: #a8a29e;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .queue-remove:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 0.9s linear infinite; }
        /* ===== END BULK UPLOAD STYLES ===== */

        /* ===== SORTABLE CATEGORIES ===== */
        .reorder-section {
          margin-top: 2rem;
          border: 1px solid #e7e5e4;
          border-radius: 14px;
          overflow: hidden;
        }

        .reorder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: #f5f5f4;
          border-bottom: 1px solid #e7e5e4;
          font-size: 0.875rem;
          font-weight: 700;
          color: #44403c;
        }

        .reorder-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #44403c;
        }

        .sortable-list {
          display: flex;
          flex-direction: column;
        }

        .sortable-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid #f5f5f4;
          background: #fff;
          transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
          cursor: grab;
          user-select: none;
        }

        .sortable-item:last-child { border-bottom: none; }

        .sortable-item:active { cursor: grabbing; }

        .sortable-item.dragging {
          opacity: 0.45;
          background: #fefcf0;
          box-shadow: inset 0 0 0 2px #d4af37;
        }

        .sortable-item.drag-over {
          background: #fffdf0;
          border-top: 2.5px solid #d4af37;
        }

        .sort-position {
          min-width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f0ede8;
          color: #78716c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .sort-handle {
          color: #c4bfbb;
          display: flex;
          align-items: center;
          cursor: grab;
          flex-shrink: 0;
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.15s, background 0.15s;
        }

        .sort-handle:hover { color: #78716c; background: #f0ede8; }

        .sort-thumb {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e7e5e4;
          flex-shrink: 0;
        }

        .sort-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .sort-info strong {
          font-size: 0.95rem;
          color: #1c1917;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sort-info code {
          font-size: 0.75rem;
          color: #a8a29e;
          font-family: monospace;
        }

        .sort-badge {
          flex-shrink: 0;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
        }

        .sort-badge.active { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .sort-badge.inactive { background: #f5f5f4; color: #a8a29e; border: 1px solid #e7e5e4; }

        .sort-arrows {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }

        .arrow-btn {
          background: none;
          border: 1px solid #e7e5e4;
          border-radius: 4px;
          width: 28px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #78716c;
          transition: all 0.15s;
          padding: 0;
        }

        .arrow-btn:hover:not(:disabled) { background: #f0ede8; border-color: #a8a29e; color: #1c1917; }
        .arrow-btn:disabled { opacity: 0.3; cursor: default; }

        .sortable-empty {
          padding: 3rem;
          text-align: center;
          color: #a8a29e;
          font-size: 0.9rem;
        }
        /* ===== END SORTABLE CATEGORIES ===== */

        /* ===== CAROUSEL CAT SELECTOR ===== */
        .carousel-cat-selector {
          border: 1.5px solid #e7e5e4;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }
        .carousel-cat-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.1rem 1.25rem 0.75rem;
          background: linear-gradient(135deg, #fffcf0 0%, #fff 100%);
          border-bottom: 1px solid #f5f0e0;
        }
        .carousel-cat-header strong {
          font-size: 0.95rem;
          color: #1c1917;
        }
        .carousel-cat-select {
          display: block;
          width: 100%;
          padding: 0.85rem 1.25rem;
          border: none;
          border-bottom: 1px solid #f5f5f4;
          font-size: 0.9rem;
          font-family: inherit;
          color: #1c1917;
          background: #fafaf9;
          outline: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .carousel-cat-select:focus { background: #fff; }
        .carousel-cat-hint {
          margin: 0;
          padding: 0.75rem 1.25rem;
          font-size: 0.82rem;
          color: #44403c;
          background: #f0fdf4;
          border-top: 1px solid #bbf7d0;
        }
        /* ===== END CAROUSEL CAT SELECTOR ===== */
      `}</style>
      
      {saved && (
        <div className="save-toast">
          <CheckCircle size={18} /> Configurações salvas com sucesso!
        </div>
      )}
    </div>
  );
};

export default HomepageSettings;
