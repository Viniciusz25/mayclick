import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import { 
  getBusinessSettings, 
  updateBusinessSettings,
  getPortfolioCategories,
  createPortfolioCategory,
  getPortfolioPhotos,
  createPortfolioPhoto,
  deletePortfolioPhoto
} from '../lib/apiClient';
import ImageUploader from './ImageUploader';

const AdminHeroSettings = () => {
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

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
      setPhotos(p);
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

  const handleAddPhoto = async () => {
    if (!newPhotoUrl || !selectedCategory) return;
    try {
      const created = await createPortfolioPhoto({
        category_id: selectedCategory.id,
        image_url: newPhotoUrl,
        active: true,
        is_cover: false,
        is_featured_home: false
      });
      setPhotos([created, ...photos]);
      setNewPhotoUrl('');
    } catch (err) {
      alert('Erro ao adicionar foto.');
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
          <h2 className="section-title">Fotos da Categoria Selecionada: {selectedCategory.title}</h2>
          
          <div className="mb-4 bg-page p-4 border-radius" style={{ maxWidth: '600px' }}>
            <label className="font-bold mb-3 block">Adicionar nova foto nesta categoria</label>
            <div className="mb-3">
              <ImageUploader
                value={newPhotoUrl}
                onChange={setNewPhotoUrl}
                label=""
              />
            </div>
            <div className="flex" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleAddPhoto} disabled={!newPhotoUrl}>
                <Plus size={18} /> Adicionar Foto
              </button>
            </div>
          </div>

          {selectedPhotos.length === 0 ? (
            <p className="text-muted">Nenhuma foto adicionada nesta categoria ainda.</p>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {selectedPhotos.map(p => (
                <div key={p.id} className="relative border-radius overflow-hidden" style={{ height: '150px', border: '1px solid var(--border)' }}>
                  <img src={p.image_url} alt="Hero foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    className="absolute top-2 right-2 p-1 bg-red text-white border-radius"
                    onClick={() => handleDeletePhoto(p.id)}
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
