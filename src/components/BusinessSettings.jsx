import React, { useEffect, useMemo, useState } from 'react';
import {
  Camera, Save, Plus, Trash, RefreshCw, Package, PlusCircle,
  FileText, Info, CheckCircle, RotateCcw
} from 'lucide-react';
import useSettings from '../hooks/useSettings';
import { pricingData } from '../data/pricing';
import {
  featureToText,
  normalizePackage as normalizeCatalogPackage,
  normalizePackageFeature,
  safeArray,
  textToFeature,
} from '../lib/packages';
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive,
  getExtras,
  createExtra,
  updateExtra,
  deleteExtra,
} from '../lib/apiClient';

const DEFAULT_CATEGORIES = ['infantil', 'debutante', 'casamento'];
const CATEGORY_LABELS = {
  infantil: 'Infantil',
  debutante: 'Debutante',
  casamento: 'Casamento',
};

const emptyPackage = (category, sortOrder = 0) => ({
  category,
  name: 'Novo Pacote',
  label: '',
  package_number: '',
  installment_text: '',
  description: '',
  features: [],
  comparison_items: [],
  coverage_time: '',
  team: '',
  deliveries: '',
  differential: '',
  observations: '',
  price: 0,
  active: true,
  sort_order: sortOrder,
});

const normalizePackage = (pkg = {}) => normalizeCatalogPackage(pkg);

const packagePayload = (pkg = {}) => {
  const normalized = normalizePackage(pkg);

  return {
    category: normalized.category,
    name: normalized.name,
    label: normalized.label,
    package_number: normalized.package_number,
    installment_text: normalized.installment_text,
    description: normalized.description,
    features: normalized.features,
    comparison_items: normalized.comparison_items?.length ? normalized.comparison_items : normalized.features,
    coverage_time: normalized.coverage_time,
    team: normalized.team,
    deliveries: normalized.deliveries,
    differential: normalized.differential,
    observations: normalized.observations,
    price: normalized.price,
    active: normalized.active,
    sort_order: normalized.sort_order,
  };
};

const normalizeExtra = (extra = {}) => ({
  ...extra,
  id: extra.id,
  name: String(extra.name || '').trim(),
  description: extra.description == null ? '' : String(extra.description),
  price: Number(extra.price || 0),
  active: extra.active !== false,
  sort_order: Number(extra.sort_order || 0),
});

const extraPayload = (extra = {}) => {
  const normalized = normalizeExtra(extra);

  return {
    name: normalized.name,
    description: normalized.description,
    price: normalized.price,
    active: normalized.active,
    sort_order: normalized.sort_order,
  };
};

const saveErrorMessage = (error) => (
  error?.status === 401 || error?.status === 403
    ? 'Sessão expirada. Faça login novamente.'
    : 'Não foi possível salvar no servidor. Verifique a conexão/API e tente novamente.'
);

const normalizeBusinessSettings = (settings = {}) => ({
  ...settings,
  name: settings.name || '',
  contact: {
    whatsapp: '',
    email: '',
    website: '',
    instagram: '',
    cnpj: '',
    address: '',
    ...(settings.contact || {}),
  },
  pdf: {
    title: '',
    validity: '',
    footer: '',
    ...(settings.pdf || {}),
  },
  payment_terms: settings.payment_terms || '',
  contract_text: settings.contract_text || '',
});

const BusinessSettings = () => {
  const { businessSettings, saveBusinessSettings, restoreDefaults, error: settingsError } = useSettings();
  const [formData, setFormData] = useState(() => normalizeBusinessSettings(businessSettings));
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [extras, setExtras] = useState([]);
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState('infantil');
  const [activeTab, setActiveTab] = useState('empresa');
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState('');
  const [packageSource, setPackageSource] = useState('api');
  const [extrasSource, setExtrasSource] = useState('api');

  useEffect(() => {
    fetchPackages();
    fetchExtras();
  }, []);

  useEffect(() => {
    setFormData(normalizeBusinessSettings(businessSettings));
  }, [businessSettings]);

  const categories = useMemo(() => {
    const packageCategories = packages.map((pkg) => pkg.category).filter(Boolean);
    return [...new Set([...DEFAULT_CATEGORIES, ...packageCategories])];
  }, [packages]);

  const currentPackages = useMemo(() => (
    packages
      .filter((pkg) => pkg.category === activeCategory)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || a.name.localeCompare(b.name))
  ), [packages, activeCategory]);

  const fetchPackages = async () => {
    setLoadingPackages(true);
    setPackageError('');
    setPackageSource('api');
    try {
      const data = await getPackages();
      setPackages(Array.isArray(data) ? data.map(normalizePackage) : []);
    } catch (error) {
      console.error('[BusinessSettings] Error fetching packages:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
      });
      setPackageSource('fallback');
      setPackageError(`Não foi possível carregar pacotes do servidor (${error.status || 'sem status'}). Dados locais temporários. Não é possível salvar até reconectar ao servidor.`);
      setPackages((pricingData.packages || []).map((pkg, index) => normalizePackage({
        ...pkg,
        active: true,
        sort_order: index + 1,
        coverage_time: pkg.coverage_time || '',
        team: pkg.team || '',
        deliveries: pkg.deliveries || '',
        observations: pkg.observations || '',
      })));
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchExtras = async () => {
    setExtrasSource('api');
    try {
      const data = await getExtras();
      setExtras(Array.isArray(data) ? data.map(normalizeExtra) : []);
    } catch (error) {
      console.error('[BusinessSettings] Error fetching extras:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
      });
      setExtrasSource('fallback');
      setExtras((businessSettings.pricing?.modalities || []).map(normalizeExtra));
      setPackageError(`Não foi possível carregar extras do servidor (${error.status || 'sem status'}). Dados locais temporários. Não é possível salvar até reconectar ao servidor.`);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async (event) => {
    if (event) event.preventDefault();
    setSaving(true);
    try {
      await saveBusinessSettings(formData);
      showSaved();
    } catch (error) {
      console.error('[BusinessSettings] Error saving settings:', error);
      alert(saveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRestore = async () => {
    if (window.confirm('Tem certeza que deseja restaurar os padrões da Mayclick?')) {
      try {
        const defaults = await restoreDefaults();
        setFormData(normalizeBusinessSettings(defaults));
        showSaved();
      } catch (error) {
        alert(saveErrorMessage(error));
      }
    }
  };

  const handleNestedChange = (path, value) => {
    const parts = path.split('.');
    setFormData((prev) => {
      const next = { ...prev };
      let current = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const updateEditingPackage = (field, value) => {
    setEditingPackage((prev) => ({ ...prev, [field]: value }));
  };

  const updateFeature = (index, value) => {
    const nextFeatures = safeArray(editingPackage.features);
    const currentFeature = normalizePackageFeature(nextFeatures[index]) || textToFeature('');
    nextFeatures[index] = {
      ...currentFeature,
      ...value,
      label: value.label === undefined ? currentFeature.label : String(value.label || ''),
      value: value.value === undefined ? currentFeature.value : String(value.value || ''),
    };
    updateEditingPackage('features', nextFeatures);
    updateEditingPackage('comparison_items', nextFeatures);
  };

  const updateFeatureText = (index, text) => {
    const nextFeatures = safeArray(editingPackage.features);
    nextFeatures[index] = textToFeature(text, nextFeatures[index]);
    updateEditingPackage('features', nextFeatures);
    updateEditingPackage('comparison_items', nextFeatures);
  };

  const addFeature = () => {
    const nextFeatures = [
      ...safeArray(editingPackage.features),
      textToFeature(''),
    ];
    updateEditingPackage('features', nextFeatures);
    updateEditingPackage('comparison_items', nextFeatures);
  };

  const removeFeature = (index) => {
    const nextFeatures = safeArray(editingPackage.features).filter((_, itemIndex) => itemIndex !== index);
    updateEditingPackage('features', nextFeatures);
    updateEditingPackage('comparison_items', nextFeatures);
  };

  const handleNewPackage = () => {
    if (packageSource !== 'api') return;

    const sortOrder = Math.max(0, ...packages.filter((pkg) => pkg.category === activeCategory).map((pkg) => Number(pkg.sort_order || 0))) + 10;
    setEditingPackage(emptyPackage(activeCategory, sortOrder));
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(normalizePackage(pkg));
  };

  const handleCancelPackage = () => {
    setEditingPackage(null);
  };

  const handleSavePackage = async () => {
    if (packageSource !== 'api') {
      alert('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
      return;
    }

    const payload = packagePayload(editingPackage);
    try {
      const savedPackage = editingPackage.id
        ? await updatePackage(editingPackage.id, payload)
        : await createPackage(payload);

      await fetchPackages();
      setEditingPackage(normalizePackage(savedPackage));
      showSaved();
    } catch (error) {
      console.error('[BusinessSettings] Error saving package:', {
        status: error.status,
        endpoint: error.endpoint,
        message: error.message,
      });
      alert(saveErrorMessage(error));
    }
  };

  const handleDeletePackage = async (pkg) => {
    if (packageSource !== 'api') {
      alert('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir este pacote?\n\n"${pkg.name}" deixará de aparecer no formulário e nos orçamentos. Se já tiver sido usado, será arquivado para preservar o histórico.`)) return;

    try {
      const result = await deletePackage(pkg.id);
      await fetchPackages();
      if (editingPackage?.id === pkg.id) {
        setEditingPackage(null);
      }
      showSaved();
      alert(result?.message || 'Pacote excluído da lista com sucesso.');
    } catch (error) {
      console.error('[BusinessSettings] Error deleting package:', {
        status: error.status,
        endpoint: error.endpoint,
        details: error.details,
      });
      const apiMessage = error.details?.error || error.details?.message || error.message;
      alert(`Não foi possível excluir o pacote (${error.status || 'sem status'}). ${apiMessage || ''}`.trim());
    }
  };

  const handleTogglePackage = async (pkg) => {
    if (packageSource !== 'api') {
      alert('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
      return;
    }

    try {
      const updated = await togglePackageActive(pkg.id);
      await fetchPackages();
      if (editingPackage?.id === pkg.id) setEditingPackage(normalizePackage(updated));
    } catch (error) {
      alert(`Nao foi possivel alterar o status do pacote (${error.status || 'sem status'}).`);
    }
  };

  const handleCreateExtra = async () => {
    if (extrasSource !== 'api') {
      alert('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
      return;
    }

    try {
      await createExtra(extraPayload({ name: 'Novo Extra', price: 0, description: '', active: false, sort_order: extras.length }));
      await fetchExtras();
      showSaved();
    } catch (error) {
      alert(saveErrorMessage(error));
    }
  };

  const handleUpdateExtra = async (id, changes) => {
    if (extrasSource !== 'api') {
      alert('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
      return;
    }

    const current = extras.find((item) => item.id === id);
    if (!current) return;

    try {
      await updateExtra(id, extraPayload({ ...current, ...changes }));
      await fetchExtras();
      showSaved();
    } catch (error) {
      alert(saveErrorMessage(error));
    }
  };

  const handleDeleteExtra = async (extra) => {
    if (extrasSource !== 'api') {
      alert('Dados locais temporários. Não é possível salvar até reconectar ao servidor.');
      return;
    }

    if (!window.confirm('Deseja excluir este extra? Ele deixará de aparecer na administração e no formulário público.')) return;

    try {
      await deleteExtra(extra.id);
      setExtras(prev => prev.filter((item) => item.id !== extra.id));
      await fetchExtras();
      showSaved();
    } catch (error) {
      alert(`Erro ao excluir extra (${error.status || 'sem status'}).`);
    }
  };

  const isPackageFallback = packageSource === 'fallback';
  const isExtrasFallback = extrasSource === 'fallback';

  return (
    <div className="settings-page fade-in">
      <header className="page-header mb-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="badge badge-accent mb-1">Administrativo</span>
            <h1>Configurações do Negócio</h1>
            <p className="text-muted">Gerencie informações da empresa, pacotes, extras e textos de orçamento.</p>
          </div>
          <div className="header-actions flex gap-2">
            <button className="btn btn-outline" onClick={handleRestore} disabled={saving}>
              <RefreshCw size={18} /> Restaurar Padrões
            </button>
            <button className="btn btn-accent" onClick={handleSaveSettings} disabled={saving}>
              <Save size={18} /> {saving ? 'Salvando...' : (saved ? 'Salvar Dados' : 'Salvar Dados')}
            </button>
          </div>
        </div>

        {(settingsError || packageError) && (
          <div className="alert alert-warning mt-4 flex items-center gap-3">
            <Info size={20} className="text-amber-600" />
            <div>
              <p className="font-bold text-amber-900">Aviso de Sincronização</p>
              {settingsError && <p className="text-sm text-amber-800">{settingsError}</p>}
              {packageError && <p className="text-sm text-amber-800">{packageError}</p>}
            </div>
          </div>
        )}
      </header>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button className={`settings-nav-item ${activeTab === 'empresa' ? 'active' : ''}`} onClick={() => setActiveTab('empresa')}>
              <Camera size={18} /> Dados da Empresa
            </button>
            <button className={`settings-nav-item ${activeTab === 'pacotes' ? 'active' : ''}`} onClick={() => setActiveTab('pacotes')}>
              <Package size={18} /> Pacotes
            </button>
            <button className={`settings-nav-item ${activeTab === 'extras' ? 'active' : ''}`} onClick={() => setActiveTab('extras')}>
              <PlusCircle size={18} /> Extras e Ajustes
            </button>
            <button className={`settings-nav-item ${activeTab === 'termos' ? 'active' : ''}`} onClick={() => setActiveTab('termos')}>
              <FileText size={18} /> Textos e PDF
            </button>
          </nav>

          <div className="settings-info-card mt-4">
            <Info size={16} />
            <p className="text-xs">Pacotes são salvos no banco e refletem no formulário, orçamento manual e PDF.</p>
          </div>
        </aside>

        <main className="settings-main">
          {activeTab === 'empresa' && (
            <section className="card fade-in">
              <h2 className="section-title">Dados da Empresa</h2>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Nome Comercial</label>
                  <input className="form-control" value={formData.name || ''} onChange={(event) => setFormData({ ...formData, name: event.target.value, trade_name: event.target.value, company_name: event.target.value })} />
                </div>
                <div className="form-group">
                  <label>CNPJ</label>
                  <input className="form-control" value={formData.contact?.cnpj || ''} onChange={(event) => handleNestedChange('contact.cnpj', event.target.value)} />
                </div>
                <div className="form-group">
                  <label>WhatsApp / Telefone</label>
                  <input className="form-control" value={formData.contact?.whatsapp || ''} onChange={(event) => handleNestedChange('contact.whatsapp', event.target.value)} />
                </div>
                <div className="form-group">
                  <label>E-mail Comercial</label>
                  <input className="form-control" value={formData.contact?.email || ''} onChange={(event) => handleNestedChange('contact.email', event.target.value)} />
                </div>
                <div className="form-group">
                  <label>Site / Portfolio</label>
                  <input className="form-control" value={formData.contact?.website || ''} onChange={(event) => handleNestedChange('contact.website', event.target.value)} />
                </div>
                <div className="form-group">
                  <label>Instagram (@)</label>
                  <input className="form-control" value={formData.contact?.instagram || ''} onChange={(event) => handleNestedChange('contact.instagram', event.target.value)} />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'pacotes' && (
            <section className="card fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title" style={{ margin: 0, border: 'none' }}>Gestão de Pacotes</h2>
                <button className="btn btn-accent btn-sm" onClick={handleNewPackage} disabled={isPackageFallback}>
                  <Plus size={16} /> Adicionar Pacote
                </button>
              </div>

              {isPackageFallback && <div className="warning-strip mb-4">Dados locais temporários. Não é possível salvar até reconectar ao servidor.</div>}

              <div className="category-tabs mb-4">
                {categories.map((category) => (
                  <button key={category} className={`tab-btn ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)}>
                    {CATEGORY_LABELS[category] || category}
                  </button>
                ))}
              </div>

              <div className="packages-workspace">
                <div className="packages-list-panel">
                  {loadingPackages ? (
                    <p className="text-muted p-4">Carregando pacotes...</p>
                  ) : currentPackages.length === 0 ? (
                    <div className="empty-state text-center p-8 border-dashed">
                      <p className="text-muted">Nenhum pacote nesta categoria.</p>
                    </div>
                  ) : currentPackages.map((pkg) => (
                    <div key={pkg.id} className={`package-row ${editingPackage?.id === pkg.id ? 'selected' : ''}`}>
                      <button className="package-row-main" onClick={() => handleEditPackage(pkg)}>
                        <span className="package-row-name">{pkg.name}</span>
                        <span className="package-row-meta">
                          R$ {Number(pkg.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · ordem {pkg.sort_order || 0}
                        </span>
                      </button>
                      <span className={`status-pill ${pkg.active ? 'active' : 'inactive'}`}>{pkg.active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  ))}
                </div>

                <div className="package-editor-panel">
                  {!editingPackage ? (
                    <div className="empty-editor">
                      <Package size={36} className="text-muted" />
                      <p className="text-muted">Selecione um pacote para editar ou adicione um novo pacote.</p>
                    </div>
                  ) : (
                    <>
                      <div className="package-editor-header">
                        <h3>{editingPackage.id ? 'Editar Pacote' : 'Novo Pacote'}</h3>
                        <div className="flex gap-2">
                          {editingPackage.id && (
                            <button className="btn btn-outline btn-sm" onClick={() => handleTogglePackage(editingPackage)} disabled={isPackageFallback}>
                              <RotateCcw size={14} /> {editingPackage.active ? 'Desativar' : 'Reativar'}
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm" onClick={handleCancelPackage}>Cancelar</button>
                          <button className="btn btn-accent btn-sm" onClick={handleSavePackage} disabled={isPackageFallback}>
                            <Save size={14} /> Salvar
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-2">
                        <div className="form-group">
                          <label>Categoria</label>
                          <input className="form-control" value={editingPackage.category || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('category', event.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Ordem</label>
                          <input type="number" className="form-control" value={editingPackage.sort_order || 0} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('sort_order', Number(event.target.value || 0))} />
                        </div>
                        <div className="form-group">
                          <label>Nome do Pacote</label>
                          <input className="form-control" value={editingPackage.name || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('name', event.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Número do Pacote</label>
                          <input className="form-control" value={editingPackage.package_number || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('package_number', event.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Valor</label>
                          <input type="number" className="form-control" value={editingPackage.price || 0} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('price', Number(event.target.value || 0))} />
                        </div>
                        <div className="form-group">
                          <label>Rótulo Comercial</label>
                          <input className="form-control" value={editingPackage.label || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('label', event.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Parcelamento</label>
                          <input className="form-control" value={editingPackage.installment_text || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('installment_text', event.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Tempo de Cobertura</label>
                          <input className="form-control" value={editingPackage.coverage_time || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('coverage_time', event.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Equipe</label>
                          <input className="form-control" value={editingPackage.team || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('team', event.target.value)} />
                        </div>
                        <div className="form-group span-2">
                          <label>Descrição Comercial</label>
                          <textarea className="form-control" rows="3" value={editingPackage.description || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('description', event.target.value)} />
                        </div>
                        <div className="form-group span-2">
                          <label>Entregas</label>
                          <textarea className="form-control" rows="2" value={editingPackage.deliveries || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('deliveries', event.target.value)} />
                        </div>
                        <div className="form-group span-2">
                          <label>Diferencial</label>
                          <textarea className="form-control" rows="2" value={editingPackage.differential || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('differential', event.target.value)} />
                        </div>
                        <div className="form-group span-2">
                          <label>Observações</label>
                          <textarea className="form-control" rows="2" value={editingPackage.observations || ''} disabled={isPackageFallback} onChange={(event) => updateEditingPackage('observations', event.target.value)} />
                        </div>
                      </div>

                      <div className="features-box">
                        <div className="flex justify-between items-center mb-2">
                          <label>Itens Inclusos</label>
                          <button className="btn btn-outline btn-sm" onClick={addFeature} disabled={isPackageFallback}>
                            <Plus size={14} /> Adicionar item
                          </button>
                        </div>
                        {safeArray(editingPackage.features).map((feature, index) => (
                          <div key={`${editingPackage.id || 'new'}-${index}`} className="feature-input-group">
                            <input
                              className="form-control form-control-sm"
                              value={featureToText(feature)}
                              disabled={isPackageFallback}
                              placeholder="Nome do item"
                              onChange={(event) => updateFeatureText(index, event.target.value)}
                            />
                            <select
                              className="form-control form-control-sm feature-status-select"
                              value={normalizePackageFeature(feature)?.type === 'text' ? 'text' : (normalizePackageFeature(feature)?.included ? 'included' : 'not_included')}
                              disabled={isPackageFallback}
                              onChange={(event) => {
                                const status = event.target.value;
                                updateFeature(index, {
                                  type: status === 'text' ? 'text' : 'boolean',
                                  included: status !== 'not_included',
                                });
                              }}
                            >
                              <option value="included">Incluso</option>
                              <option value="not_included">Não incluso</option>
                              <option value="text">Texto</option>
                            </select>
                            <input
                              className="form-control form-control-sm"
                              value={normalizePackageFeature(feature)?.value || ''}
                              disabled={isPackageFallback}
                              placeholder="Texto opcional"
                              onChange={(event) => updateFeature(index, { value: event.target.value })}
                            />
                            <button className="btn-icon-danger-sm" onClick={() => removeFeature(index)} disabled={isPackageFallback}>
                              <Trash size={14} />
                            </button>
                          </div>
                        ))}
                        {safeArray(editingPackage.features).length === 0 && (
                          <p className="text-muted text-sm">Nenhum item incluso cadastrado.</p>
                        )}
                      </div>

                      {editingPackage.id && (
                        <button className="btn btn-outline btn-danger-soft mt-4" onClick={() => handleDeletePackage(editingPackage)} disabled={isPackageFallback}>
                          <Trash size={16} /> Excluir pacote
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'extras' && (
            <section className="card fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title" style={{ margin: 0, border: 'none' }}>Extras e Ajustes</h2>
                <button className="btn btn-accent btn-sm" onClick={handleCreateExtra} disabled={isExtrasFallback}>
                  <PlusCircle size={16} /> Novo Extra
                </button>
              </div>

              {isExtrasFallback && <div className="warning-strip mb-4">Dados locais temporários. Não é possível salvar até reconectar ao servidor.</div>}

              <div className="extras-editor-list">
                {extras.map((extra) => (
                  <div key={extra.id} className="package-editor-card mb-4">
                    <div className="package-editor-header">
                      <input
                        className="package-name-input"
                        value={extra.name}
                        disabled={isExtrasFallback}
                        onChange={(event) => {
                          const nextName = event.target.value;
                          setExtras(prev => prev.map((item) => (item.id === extra.id ? { ...item, name: nextName } : item)));
                        }}
                        onBlur={(event) => handleUpdateExtra(extra.id, { name: event.target.value })}
                      />
                      <div className="flex gap-2">
                        <button
                          className={`btn-icon ${extra.active ? 'text-accent' : 'text-muted'}`}
                          title={extra.active ? 'Ativo' : 'Inativo'}
                          disabled={isExtrasFallback}
                          onClick={() => {
                            const updated = { ...extra, active: !extra.active };
                            setExtras(prev => prev.map((item) => (item.id === extra.id ? updated : item)));
                            handleUpdateExtra(extra.id, { active: !extra.active });
                          }}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button className="btn-icon-danger" disabled={isExtrasFallback} onClick={() => handleDeleteExtra(extra)}>
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-2 mt-2">
                      <div className="form-group">
                        <label>Valor (R$)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={extra.price}
                          disabled={isExtrasFallback}
                          onChange={(event) => {
                            const nextPrice = Number(event.target.value || 0);
                            setExtras(prev => prev.map((item) => (item.id === extra.id ? { ...item, price: nextPrice } : item)));
                          }}
                          onBlur={(event) => handleUpdateExtra(extra.id, { price: Number(event.target.value || 0) })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Descrição</label>
                        <input
                          className="form-control"
                          value={extra.description || ''}
                          disabled={isExtrasFallback}
                          onChange={(event) => {
                            const nextDesc = event.target.value;
                            setExtras(prev => prev.map((item) => (item.id === extra.id ? { ...item, description: nextDesc } : item)));
                          }}
                          onBlur={(event) => handleUpdateExtra(extra.id, { description: event.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'termos' && (
            <section className="card fade-in">
              <h2 className="section-title">Textos Legais e PDF</h2>
              <div className="form-group">
                <label>Validade da Proposta (Texto)</label>
                <input className="form-control" value={formData.pdf?.validity || ''} onChange={(event) => handleNestedChange('pdf.validity', event.target.value)} />
              </div>
              <div className="form-group">
                <label>Condições de Pagamento (Texto no Orçamento PDF)</label>
                <textarea className="form-control" rows="4" value={formData.payment_terms || ''} onChange={(event) => setFormData({ ...formData, payment_terms: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Rodapé do Documento</label>
                <input className="form-control" value={formData.pdf?.footer || ''} onChange={(event) => handleNestedChange('pdf.footer', event.target.value)} />
              </div>

              <div className="form-group" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <div className="flex justify-between items-center mb-2">
                  <label style={{ margin: 0 }}>Modelo do Contrato (Texto Base)</label>
                  <button 
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={async () => {
                      try {
                        const { generateServiceContractPdf } = await import('./ContractPdfGenerator.jsx');
                        const fakeSubmission = {
                          id: 'preview',
                          budget_number: 'TESTE',
                          selectedPackageId: 'Pacote Preview',
                          totalValue: 1500,
                          eventDate: new Date(),
                          eventLocation: 'Local de Exemplo',
                          paymentMethod: 'Pix ou Boleto',
                          contractor: {
                            fullName: 'João da Silva (Cliente de Teste)',
                            cpf: '123.456.789-00',
                            address: 'Rua das Flores, 123, Centro'
                          }
                        };
                        const doc = await generateServiceContractPdf({ 
                          submission: fakeSubmission, 
                          budgetId: 'preview',
                          businessSettings: formData 
                        });
                        if (doc && doc.pdfBlob) {
                          const url = URL.createObjectURL(doc.pdfBlob);
                          window.open(url, '_blank');
                        } else {
                          alert('Para visualizar o preview, o sistema tentou salvar no banco mas retornou erro de rede. Você deve salvar a configuração primeiro.');
                        }
                      } catch (err) {
                        if (err.pdfGenerated && err.pdfBlob) {
                          const url = URL.createObjectURL(err.pdfBlob);
                          window.open(url, '_blank');
                        } else {
                          console.error(err);
                          alert('Erro ao gerar preview. Salve as alterações e tente novamente.');
                        }
                      }
                    }}
                  >
                    Visualizar Modelo
                  </button>
                </div>
                <p className="text-muted text-sm mb-2">
                  Tags disponíveis: [CONTRATADA_NOME], [CONTRATADA_CNPJ], [ENDERECO_CONTRATADA], [NOME_CLIENTE], [CPF_CLIENTE], [ENDERECO_CLIENTE], [DATA_EVENTO], [LOCAL_EVENTO], [PACOTE_NOME], [VALOR_TOTAL], [FORMA_PAGAMENTO]
                </p>
                <textarea 
                  className="form-control" 
                  rows="12" 
                  value={formData.contract_text || ''} 
                  placeholder="Deixe em branco para usar o contrato padrão..."
                  onChange={(event) => setFormData({ ...formData, contract_text: event.target.value })} 
                />
              </div>
            </section>
          )}
        </main>
      </div>

      {saved && (
        <div className="save-toast">
          <CheckCircle size={18} /> Alterações salvas com sucesso.
        </div>
      )}

      <style>{`
        .settings-page, .settings-page .page-header { min-width: 0; max-width: 100%; overflow-x: hidden; }
        .settings-page .page-header > .flex { min-width: 0; max-width: 100%; gap: 1rem; flex-wrap: wrap; }
        .settings-page .page-header > .flex > div:first-child { min-width: 0; }
        .settings-page .page-header h1, .settings-page .page-header p { overflow-wrap: anywhere; }
        .header-actions { flex-wrap: wrap; justify-content: flex-end; min-width: 0; }
        .settings-layout { display: grid; grid-template-columns: minmax(190px, 240px) minmax(0, 1fr); gap: clamp(1.5rem, 3vw, 3.5rem); align-items: start; width: 100%; max-width: 100%; min-width: 0; overflow: hidden; }
        .settings-sidebar, .settings-main { min-width: 0; max-width: 100%; }
        .settings-main > .card { min-width: 0; max-width: 100%; overflow: hidden; }
        .settings-nav { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }
        .settings-nav-item { display: flex; align-items: center; gap: 1rem; min-width: 0; padding: 1rem 1.125rem; background: none; border: 1px solid transparent; border-radius: var(--radius-sm); cursor: pointer; font-weight: 700; text-align: left; color: var(--text-muted); transition: var(--transition); }
        .settings-nav-item svg { flex: 0 0 auto; }
        .settings-nav-item:hover { background-color: var(--secondary-light); color: var(--primary); }
        .settings-nav-item.active { background-color: var(--primary); color: #fff; box-shadow: var(--shadow-md); }
        .settings-info-card { padding: 1.25rem; background-color: var(--accent-light); border-radius: var(--radius-sm); display: flex; gap: 1rem; color: var(--accent); border: 1px solid rgba(212, 175, 55, 0.15); min-width: 0; }
        .settings-info-card svg { flex: 0 0 auto; }
        .category-tabs { display: flex; flex-wrap: wrap; gap: 0.625rem; border-bottom: 1.5px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 2rem; max-width: 100%; }
        .tab-btn { background: none; border: none; padding: 0.625rem 1.25rem; cursor: pointer; color: var(--text-muted); font-weight: 800; text-transform: uppercase; border-radius: var(--radius-sm); font-size: 0.8125rem; letter-spacing: 0.05em; white-space: nowrap; }
        .tab-btn.active { color: var(--accent); background-color: var(--accent-light); }
        .packages-workspace { display: grid; grid-template-columns: minmax(220px, 300px) minmax(0, 1fr); gap: 1.25rem; align-items: start; width: 100%; max-width: 100%; min-width: 0; }
        .packages-list-panel, .package-editor-panel { border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-page); padding: 1rem; min-width: 0; max-width: 100%; overflow: hidden; }
        .packages-list-panel { max-height: calc(100vh - 230px); overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .package-editor-panel { overflow-y: auto; max-height: calc(100vh - 230px); -webkit-overflow-scrolling: touch; }
        .package-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid transparent; min-width: 0; }
        .package-row.selected { background: #fff; border-color: var(--accent); }
        .package-row-main { flex: 1 1 auto; min-width: 0; background: none; border: none; text-align: left; cursor: pointer; padding: 0; }
        .package-row-name { display: block; font-weight: 800; color: var(--primary); overflow-wrap: anywhere; }
        .package-row-meta { display: block; margin-top: 0.25rem; font-size: 0.75rem; color: var(--text-muted); }
        .status-pill { flex: 0 0 auto; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; border-radius: 50px; padding: 0.25rem 0.5rem; }
        .status-pill.active { color: #047857; background: #ecfdf5; }
        .status-pill.inactive { color: #991b1b; background: #fef2f2; }
        .package-editor-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; min-width: 0; }
        .package-editor-header h3 { min-width: 0; overflow-wrap: anywhere; }
        .package-editor-header .flex { flex-wrap: wrap; min-width: 0; }
        .package-editor-card { padding: clamp(1.25rem, 2vw, 2rem); border: 1px solid var(--border); border-radius: var(--radius); background-color: var(--bg-page); min-width: 0; max-width: 100%; overflow: hidden; }
        .package-name-input { background: none; border: none; font-size: 1.25rem; font-weight: 800; color: var(--primary); outline: none; width: 100%; min-width: 0; }
        .features-box { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); min-width: 0; }
        .features-box > .flex { flex-wrap: wrap; gap: 0.75rem; }
        .feature-input-group { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(112px, 130px) minmax(0, 1fr) auto; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; min-width: 0; }
        .feature-input-group > * { min-width: 0; }
        .feature-status-select { min-width: 0; }
        .form-group, .grid, .grid-2, .grid-3 { min-width: 0; max-width: 100%; }
        .form-control-sm { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        .btn-icon-danger, .btn-icon-danger-sm { background: none; border: none; color: var(--error); cursor: pointer; opacity: 0.55; transition: var(--transition); padding: 0.5rem; border-radius: 50%; }
        .btn-icon-danger:hover, .btn-icon-danger-sm:hover { opacity: 1; background-color: rgba(239, 68, 68, 0.1); }
        .btn-danger-soft { color: var(--error); border-color: rgba(197, 48, 48, 0.2); }
        .span-2 { grid-column: span 2; }
        .warning-strip { padding: 0.875rem 1rem; border-radius: var(--radius-sm); background: #fff7ed; color: #9a3412; font-weight: 700; font-size: 0.875rem; }
        .empty-editor { min-height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; }
        .save-toast { position: fixed; bottom: max(1.25rem, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); background-color: var(--primary); color: #fff; padding: 1.25rem 2.5rem; border-radius: var(--radius-full); display: flex; align-items: center; gap: 1rem; font-weight: 700; box-shadow: var(--shadow-lg); z-index: 1000; border: 1px solid var(--accent); max-width: calc(100vw - 2rem); }
        @media (max-width: 1240px) {
          .settings-layout { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; overflow: visible; }
          .settings-nav { flex-direction: row; overflow-x: auto; padding-bottom: 0.25rem; -webkit-overflow-scrolling: touch; }
          .settings-nav-item { flex: 0 0 auto; white-space: nowrap; }
          .settings-info-card { display: none; }
        }
        @media (max-width: 1100px) {
          .packages-workspace, .feature-input-group { grid-template-columns: 1fr; }
          .packages-list-panel, .package-editor-panel { max-height: none; overflow: visible; }
          .span-2 { grid-column: span 1; }
        }
        @media (max-width: 768px) {
          .settings-page .page-header > .flex { align-items: flex-start; flex-direction: column; }
          .header-actions { width: 100%; }
          .header-actions .btn { flex: 1 1 180px; min-height: 44px; }
          .settings-main > .card { padding: 1.25rem; }
          .settings-main > .card > .flex.justify-between { align-items: flex-start; flex-direction: column; gap: 1rem; }
          .settings-main > .card > .flex.justify-between .btn { width: 100%; }
          .category-tabs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 0.625rem; -webkit-overflow-scrolling: touch; }
          .tab-btn { flex: 0 0 auto; }
          .package-editor-header { align-items: flex-start; }
          .package-editor-header .flex { width: 100%; }
          .package-editor-header .btn { flex: 1 1 140px; min-height: 44px; }
          .features-box > .flex .btn { width: 100%; min-height: 44px; }
          .feature-input-group .btn-icon-danger-sm { justify-self: start; min-width: 44px; min-height: 44px; border-radius: var(--radius-sm); }
          .save-toast { width: calc(100vw - 2rem); justify-content: center; border-radius: var(--radius-sm); padding: 1rem; }
        }
        @media (max-width: 520px) {
          .settings-nav-item { padding: 0.875rem 1rem; font-size: 0.875rem; }
          .packages-list-panel, .package-editor-panel { padding: 0.75rem; }
          .package-row { align-items: flex-start; flex-wrap: wrap; }
          .status-pill { margin-left: 0; }
          .package-editor-header .btn { flex-basis: 100%; }
        }
      `}</style>
    </div>
  );
};

export default BusinessSettings;
