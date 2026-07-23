import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Star, Upload, Loader, Move } from 'lucide-react';
import { 
  getBusinessSettings, 
  updateBusinessSettings,
  getPortfolioCategories,
  createPortfolioCategory,
  getPortfolioPhotos,
  createPortfolioPhoto,
  deletePortfolioPhoto,
  uploadImagesBulk,
  reorderPortfolioPhotos
} from '../lib/apiClient';
import ImageUploader from './ImageUploader';

const AdminHeroSettings = () => {
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef(null);
  const [uploadingBulk, setUploadingBulk] = useState(false);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [s, c, p] = await Promise.all([
        getBusinessSettings(),
        getPortfolioCategories(),
        getPortfolioPhotos()
      ]);
      setSettings(s);
      setCategories(c);
      // Ensure photos are sorted by sort_order
      setPhotos(p.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    } catch (err) {
      console.error('Error fetching hero data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (overrideSettings) => {
    setSaving(true);
    try {
      const dataToSave = overrideSettings || settings;
      await updateBusinessSettings(dataToSave);
      if (overrideSettings) setSettings(overrideSettings);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExclusiveCategory = async () => {
    try {
      const slug = 'hero-exclusivo-' + Date.now();
      const newCat = await createPortfolioCategory({
        title: 'Imagens Exclusivas do Hero',
        slug,
        description: 'Categoria oculta para uso exclusivo no carrossel do Hero',
        active: true,
        is_hidden_from_portfolio: true
      });
      setCategories([newCat, ...categories]);
      
      const updatedSettings = { ...settings, hero_carousel_category_slug: slug };
      await handleSaveSettings(updatedSettings);
    } catch (err) {
      alert('Erro ao criar categoria exclusiva.');
    }
  };

  const selectedCategory = categories.find(c => c.slug === settings.hero_carousel_category_slug);
  const selectedPhotos = selectedCategory ? photos.filter(p => p.category_id === selectedCategory.id) : [];

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selectedCategory) return;
    setUploadingBulk(true);
    try {
      const result = await uploadImagesBulk(files);
      const uploadedUrls = result.uploaded.map(u => u.url);
      
      const newPhotos = [];
      for (const url of uploadedUrls) {
        const created = await createPortfolioPhoto({
          category_id: selectedCategory.id,
          image_url: url,
          active: true,
          is_cover: false,
          is_featured_home: false
        });
        newPhotos.push(created);
      }
      setPhotos([...photos, ...newPhotos]);
    } catch (err) {
      alert('Erro ao fazer upload das imagens.');
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

  const handleSort = async () => {
    let _selectedPhotos = [...selectedPhotos];
    const draggedItemContent = _selectedPhotos.splice(dragItem.current, 1)[0];
    _selectedPhotos.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    const otherPhotos = photos.filter(p => p.category_id !== selectedCategory.id);
    
    // Update local state immediately
    const withOrder = _selectedPhotos.map((c, i) => ({ ...c, sort_order: i }));
    setPhotos([...otherPhotos, ...withOrder]);

    // Save to DB
    try {
      const payload = withOrder.map(c => ({ id: c.id, sort_order: c.sort_order }));
      await reorderPortfolioPhotos(payload);
    } catch (err) {
      alert('Erro ao salvar nova ordem das fotos.');
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="dashboard-content fade-in">
      <header className="dashboard-header flex justify-between items-center mb-4">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Luxury Hero</h1>
          <p className="text-muted">Gerencie a categoria e as imagens do banner rotativo principal.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleSaveSettings()} disabled={saving}>
          <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </header>

      <div className="grid grid-2 mb-4">
        <section className="card">
          <h2 className="section-title"><Star size={20} className="text-accent" /> Categoria do Hero</h2>
          
          <div className="form-group mb-4">
            <label>Selecione uma Categoria para o Carrossel</label>
            <select
              className="form-control mt-2"
              value={settings.hero_carousel_category_slug || ''}
              onChange={(e) => setSettings({ ...settings, hero_carousel_category_slug: e.target.value })}
            >
              <option value="">Nenhuma (Usar imagem fixa padrão)</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>
                  {c.title} {c.is_hidden_from_portfolio ? '(Oculta)' : ''}
                </option>
              ))}
            </select>
            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
              As fotos da categoria selecionada ficarão passando em loop automático no fundo da página inicial.
            </p>
          </div>

          <hr className="my-4" />

          <div>
            <label className="block font-bold mb-2">Não quer misturar as fotos com o Portfólio?</label>
            <button className="btn btn-outline" onClick={handleCreateExclusiveCategory}>
              <Plus size={18} /> Criar Categoria Exclusiva (Oculta)
            </button>
            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
              Isso cria uma categoria invisível para o público no portfólio, mas que funciona no Hero.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title"><ImageIcon size={20} className="text-accent" /> Adicionar Imagem ao Hero Fixo</h2>
          <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
            Caso você <strong>não selecione</strong> nenhuma categoria no campo ao lado, esta será a imagem de fundo fixa do banner.
          </p>
          <ImageUploader
            label="Imagem de Fundo Fixa"
            value={settings.hero_image_url || ''}
            onChange={(url) => setSettings({ ...settings, hero_image_url: url })}
            placeholder="URL da Imagem"
          />
        </section>
      </div>

      {selectedCategory && (
        <section className="card">
          <h2 className="section-title">Fotos da Categoria: {selectedCategory.title}</h2>
          
          <div className="mb-4 bg-page p-6 border-radius flex flex-col items-center justify-center text-center" 
               style={{ border: '2px dashed var(--accent)', transition: 'all 0.3s' }}>
            {uploadingBulk ? (
              <div className="flex flex-col items-center p-4">
                <Loader size={32} className="spinning text-accent mb-2" />
                <p className="font-bold text-lg">Enviando imagens...</p>
                <p className="text-muted text-sm mt-1">Isso pode levar alguns minutos. Por favor, aguarde.</p>
              </div>
            ) : (
              <>
                <Upload size={40} className="text-accent mb-3" />
                <h3 className="font-bold text-lg mb-1">Adicionar Múltiplas Fotos</h3>
                <p className="text-muted text-sm mb-4">Clique no botão abaixo ou arraste arquivos para enviar (JPG, PNG, WEBP)</p>
                
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  ref={fileInputRef} 
                  style={{ display: 'none' }}
                  onChange={handleBulkUpload}
                />
                
                <button 
                  className="btn btn-primary px-6 py-3 shadow-md hover:-translate-y-1 transition"
                  style={{ borderRadius: '30px', fontWeight: 'bold' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={18} className="mr-2" /> Selecionar Arquivos
                </button>
              </>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-muted">
              {selectedPhotos.length} {selectedPhotos.length === 1 ? 'foto' : 'fotos'} cadastradas. 
              <strong> Dica:</strong> Arraste e solte as fotos para reordenar.
            </p>
          </div>

          {selectedPhotos.length === 0 ? (
            <p className="text-muted text-center p-8 bg-page border-radius">Nenhuma foto adicionada nesta categoria ainda.</p>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {selectedPhotos.map((p, index) => (
                <div 
                  key={p.id} 
                  className="relative border-radius overflow-hidden shadow-sm" 
                  style={{ height: '200px', border: '1px solid var(--border)', cursor: 'grab' }}
                  draggable
                  onDragStart={() => (dragItem.current = index)}
                  onDragEnter={() => (dragOverItem.current = index)}
                  onDragEnd={handleSort}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <img src={p.image_url} alt="Hero foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                  
                  {/* Overlay for drag handle */}
                  <div className="absolute top-2 left-2 p-1 bg-black text-white border-radius" style={{ opacity: 0.7 }}>
                    <Move size={16} />
                  </div>

                  <button 
                    className="absolute top-2 right-2 p-2 bg-red text-white border-radius shadow-sm hover:scale-110 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(p.id);
                    }}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
};

export default AdminHeroSettings;
