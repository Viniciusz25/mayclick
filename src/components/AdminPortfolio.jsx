import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Edit2, Move, Folder, Upload, Loader } from 'lucide-react';
import { 
  getPortfolioCategories, createPortfolioCategory, updatePortfolioCategory, deletePortfolioCategory, reorderCategories,
  getPortfolioAlbums, createPortfolioAlbum, updatePortfolioAlbum, deletePortfolioAlbum, reorderPortfolioAlbums,
  getPortfolioPhotos, createPortfolioPhoto, deletePortfolioPhoto, reorderPortfolioPhotos, uploadImagesBulk
} from '../lib/apiClient';
import ImageUploader from './ImageUploader';

const AdminPortfolio = () => {
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');

  // Modals / Forms state
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [uploadingBulk, setUploadingBulk] = useState(false);
  const fileInputRef = useRef(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cats, albs, phots] = await Promise.all([
        getPortfolioCategories(),
        getPortfolioAlbums(),
        getPortfolioPhotos()
      ]);
      setCategories(cats.sort((a, b) => a.sort_order - b.sort_order));
      setAlbums(albs.sort((a, b) => a.sort_order - b.sort_order));
      setPhotos(phots.sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar dados do portfólio.');
    } finally {
      setLoading(false);
    }
  };

  // CATEGORIES
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory.id) {
        const updated = await updatePortfolioCategory(editingCategory.id, editingCategory);
        setCategories(categories.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await createPortfolioCategory(editingCategory);
        setCategories([...categories, created]);
        setSelectedCategoryId(created.id);
      }
      setEditingCategory(null);
    } catch (err) {
      alert('Erro ao salvar categoria.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Excluir esta categoria? Todos os álbuns e fotos nela serão apagados.')) return;
    try {
      await deletePortfolioCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId('');
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  // ALBUMS
  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) return alert('Selecione uma categoria primeiro.');
    try {
      const data = { ...editingAlbum, category_id: selectedCategoryId };
      if (editingAlbum.id) {
        const updated = await updatePortfolioAlbum(editingAlbum.id, data);
        setAlbums(albums.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await createPortfolioAlbum(data);
        setAlbums([...albums, created]);
        setSelectedAlbumId(created.id);
      }
      setEditingAlbum(null);
    } catch (err) {
      alert('Erro ao salvar álbum.');
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!confirm('Excluir este evento/álbum? Todas as fotos dele serão apagadas.')) return;
    try {
      await deletePortfolioAlbum(id);
      setAlbums(albums.filter(a => a.id !== id));
      if (selectedAlbumId === id) setSelectedAlbumId('');
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  const handleSortAlbums = async () => {
    let _filtered = albums.filter(a => a.category_id === selectedCategoryId);
    const dragged = _filtered.splice(dragItem.current, 1)[0];
    _filtered.splice(dragOverItem.current, 0, dragged);
    
    dragItem.current = null;
    dragOverItem.current = null;

    const others = albums.filter(a => a.category_id !== selectedCategoryId);
    const withOrder = _filtered.map((item, i) => ({ ...item, sort_order: i }));
    setAlbums([...others, ...withOrder]);

    try {
      await reorderPortfolioAlbums(withOrder.map(a => ({ id: a.id, sort_order: a.sort_order })));
    } catch (err) {
      alert('Erro ao salvar ordem dos álbuns.');
    }
  };

  // PHOTOS
  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selectedCategoryId) return;
    setUploadingBulk(true);
    try {
      const result = await uploadImagesBulk(files);
      const uploadedUrls = result.uploaded.map(u => u.url);
      
      const newPhotos = [];
      for (const url of uploadedUrls) {
        const created = await createPortfolioPhoto({
          category_id: selectedCategoryId,
          album_id: selectedAlbumId || null,
          image_url: url,
          active: true,
          is_cover: false,
          is_featured_home: false
        });
        newPhotos.push(created);
      }
      setPhotos([...photos, ...newPhotos]);
    } catch (err) {
      alert('Erro ao enviar fotos.');
    } finally {
      setUploadingBulk(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!confirm('Excluir esta foto?')) return;
    try {
      await deletePortfolioPhoto(id);
      setPhotos(photos.filter(p => p.id !== id));
    } catch (err) {
      alert('Erro ao excluir foto.');
    }
  };

  const handleSortPhotos = async () => {
    let _filtered = photos.filter(p => p.category_id === selectedCategoryId && (selectedAlbumId ? p.album_id === selectedAlbumId : !p.album_id));
    const dragged = _filtered.splice(dragItem.current, 1)[0];
    _filtered.splice(dragOverItem.current, 0, dragged);
    
    dragItem.current = null;
    dragOverItem.current = null;

    const others = photos.filter(p => !(p.category_id === selectedCategoryId && (selectedAlbumId ? p.album_id === selectedAlbumId : !p.album_id)));
    const withOrder = _filtered.map((item, i) => ({ ...item, sort_order: i }));
    setPhotos([...others, ...withOrder]);

    try {
      await reorderPortfolioPhotos(withOrder.map(p => ({ id: p.id, sort_order: p.sort_order })));
    } catch (err) {
      alert('Erro ao salvar ordem das fotos.');
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  const currentAlbums = albums.filter(a => a.category_id === selectedCategoryId);
  const currentPhotos = photos.filter(p => p.category_id === selectedCategoryId && (selectedAlbumId ? p.album_id === selectedAlbumId : !p.album_id));

  return (
    <div className="dashboard-content fade-in">
      <header className="dashboard-header mb-4">
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Portfólio Completo</h1>
        <p className="text-muted">Gerencie categorias, álbuns (eventos) e fotos.</p>
      </header>

      <div className="grid grid-3 gap-4" style={{ gridTemplateColumns: '1fr 1fr 2fr' }}>
        
        {/* COL 1: Categories */}
        <section className="card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">1. Categorias</h2>
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setEditingCategory({ title: '', slug: '', active: true, sort_order: 0 })}>
              <Plus size={14} /> Nova
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {categories.filter(c => !c.is_hidden_from_portfolio).map(c => (
              <div 
                key={c.id} 
                className={`flex justify-between items-center p-3 border-radius cursor-pointer transition ${selectedCategoryId === c.id ? 'bg-primary text-white' : 'bg-page hover:bg-border'}`}
                onClick={() => { setSelectedCategoryId(c.id); setSelectedAlbumId(''); }}
                style={{ border: '1px solid var(--border)' }}
              >
                <span className="font-bold">{c.title}</span>
                <button className="text-muted hover:text-accent" onClick={(e) => { e.stopPropagation(); setEditingCategory(c); }}>
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* COL 2: Albums */}
        <section className="card" style={{ padding: '1.5rem', opacity: selectedCategoryId ? 1 : 0.5, pointerEvents: selectedCategoryId ? 'auto' : 'none' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">2. Eventos / Álbuns</h2>
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setEditingAlbum({ title: '', slug: '', active: true, sort_order: 0 })}>
              <Plus size={14} /> Novo
            </button>
          </div>

          <div 
            className={`flex justify-between items-center p-3 border-radius cursor-pointer transition mb-2 ${selectedAlbumId === '' && selectedCategoryId ? 'bg-accent text-white' : 'bg-page hover:bg-border'}`}
            onClick={() => setSelectedAlbumId('')}
            style={{ border: '1px dashed var(--border-strong)' }}
          >
            <span className="font-medium">Fotos Gerais (Sem Evento)</span>
          </div>

          <div className="flex flex-col gap-2">
            {currentAlbums.map((a, index) => (
              <div 
                key={a.id} 
                className={`flex justify-between items-center p-3 border-radius cursor-pointer transition ${selectedAlbumId === a.id ? 'bg-primary text-white' : 'bg-page hover:bg-border'}`}
                onClick={() => setSelectedAlbumId(a.id)}
                style={{ border: '1px solid var(--border)' }}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSortAlbums}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  <Move size={14} className="opacity-50" />
                  <span className="font-bold">{a.title}</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-muted hover:text-accent" onClick={(e) => { e.stopPropagation(); setEditingAlbum(a); }}><Edit2 size={14} /></button>
                  <button className="text-muted hover:text-red" onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(a.id); }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COL 3: Photos */}
        <section className="card" style={{ padding: '1.5rem', opacity: selectedCategoryId ? 1 : 0.5, pointerEvents: selectedCategoryId ? 'auto' : 'none' }}>
          <h2 className="font-bold text-lg mb-4">3. Fotos</h2>

          <div className="mb-4 bg-page p-6 border-radius flex flex-col items-center justify-center text-center" 
               style={{ border: '2px dashed var(--accent)', transition: 'all 0.3s' }}>
            {uploadingBulk ? (
              <div className="flex flex-col items-center p-4">
                <Loader size={32} className="spinning text-accent mb-2" />
                <p className="font-bold">Enviando imagens...</p>
              </div>
            ) : (
              <>
                <Upload size={32} className="text-accent mb-2" />
                <h3 className="font-bold mb-1">Adicionar Múltiplas Fotos</h3>
                <p className="text-muted text-xs mb-3">Arraste arquivos ou clique no botão</p>
                <input type="file" multiple accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleBulkUpload} />
                <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={16} className="mr-1" /> Selecionar Arquivos
                </button>
              </>
            )}
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
            {currentPhotos.map((p, index) => (
              <div 
                key={p.id} 
                className="relative border-radius overflow-hidden shadow-sm" 
                style={{ height: '120px', border: '1px solid var(--border)', cursor: 'grab' }}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSortPhotos}
                onDragOver={(e) => e.preventDefault()}
              >
                <img src={p.image_url} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                <button 
                  className="absolute top-1 right-1 p-1 bg-red text-white border-radius shadow-sm hover:scale-110 transition"
                  onClick={(e) => { e.stopPropagation(); handleDeletePhoto(p.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {currentPhotos.length === 0 && !uploadingBulk && (
              <div className="col-span-full text-center p-4 text-muted bg-page border-radius text-sm">Nenhuma foto adicionada.</div>
            )}
          </div>
        </section>
      </div>

      {/* Category Modal */}
      {editingCategory && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 className="font-bold mb-4">{editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label>Título</label>
                <input className="form-control" value={editingCategory.title} onChange={e => setEditingCategory({...editingCategory, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Slug (URL)</label>
                <input className="form-control" value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})} required />
              </div>
              <ImageUploader label="Imagem de Capa" value={editingCategory.cover_image_url || ''} onChange={url => setEditingCategory({...editingCategory, cover_image_url: url})} />
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setEditingCategory(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Album Modal */}
      {editingAlbum && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 className="font-bold mb-4">{editingAlbum.id ? 'Editar Evento' : 'Novo Evento/Álbum'}</h3>
            <form onSubmit={handleSaveAlbum}>
              <div className="form-group">
                <label>Título</label>
                <input className="form-control" value={editingAlbum.title} onChange={e => setEditingAlbum({...editingAlbum, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Slug (URL)</label>
                <input className="form-control" value={editingAlbum.slug} onChange={e => setEditingAlbum({...editingAlbum, slug: e.target.value})} required />
              </div>
              <ImageUploader label="Imagem de Capa" value={editingAlbum.cover_image_url || ''} onChange={url => setEditingAlbum({...editingAlbum, cover_image_url: url})} />
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setEditingAlbum(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortfolio;
