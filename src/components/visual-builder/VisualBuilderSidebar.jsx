import React from 'react';
import { useVisualEditor } from '../../context/VisualEditorContext';
import { X, Image as ImageIcon, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';

const VisualBuilderSidebar = () => {
  const { isEditMode, selectedElement, setSelectedElement, draftData, updateSetting, updateHighlight } = useVisualEditor();

  if (!isEditMode || !draftData) return null;

  const handleClose = () => {
    setSelectedElement(null);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    if (selectedElement.highlightId) {
      updateHighlight(selectedElement.highlightId, selectedElement.field, value);
    } else {
      updateSetting(selectedElement.field, value);
    }
  };

  const getValue = () => {
    if (selectedElement.highlightId) {
      const h = draftData.highlights.find(h => h.id === selectedElement.highlightId);
      return h ? h[selectedElement.field] : '';
    }
    return draftData.settings[selectedElement.field] || '';
  };

  // Sections toggle management
  const toggleSection = (field) => {
    updateSetting(field, !draftData.settings[field]);
  };

  const getLayout = () => {
    if (!draftData.settings.homepage_layout) {
      return ['hero', 'portfolio', 'highlights', 'about', 'testimonials', 'instagram', 'cta'];
    }
    if (typeof draftData.settings.homepage_layout === 'string') {
      try {
        return JSON.parse(draftData.settings.homepage_layout);
      } catch (e) {
        return ['hero', 'portfolio', 'highlights', 'about', 'testimonials', 'instagram', 'cta'];
      }
    }
    return draftData.settings.homepage_layout;
  };

  const [draggedIdx, setDraggedIdx] = React.useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newLayout = [...getLayout()];
    const item = newLayout.splice(draggedIdx, 1)[0];
    newLayout.splice(index, 0, item);
    
    setDraggedIdx(index);
    updateSetting('homepage_layout', newLayout);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const sectionLabels = {
    hero: 'Capa / Hero',
    portfolio: 'Mosaico Portfólio',
    highlights: 'Destaques Dinâmicos',
    about: 'Sobre Nós (Vídeo/Parallax)',
    testimonials: 'Depoimentos',
    instagram: 'Banner Instagram',
    cta: 'Call to Action Final'
  };

  return (
    <>
      {/* Sidebar Panel for Editing */}
      <div className={`visual-sidebar ${selectedElement ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Propriedades</h3>
          <button onClick={handleClose} className="close-btn"><X size={20} /></button>
        </div>
        
        {selectedElement ? (
          <div className="sidebar-content">
            <div className="form-group">
              <label>{selectedElement.label}</label>
              
              {selectedElement.type === 'textarea' ? (
                <textarea 
                  className="form-control" 
                  rows="5" 
                  value={getValue()} 
                  onChange={handleChange}
                />
              ) : selectedElement.type === 'image' ? (
                <div className="image-edit-box">
                  <input 
                    type="text" 
                    className="form-control mb-2" 
                    placeholder="URL da Imagem"
                    value={getValue()} 
                    onChange={handleChange}
                  />
                  <div className="image-preview">
                    {getValue() ? (
                      <img src={getValue()} alt="Preview" style={{ width: '100%', borderRadius: '4px' }} />
                    ) : (
                      <div className="placeholder-preview"><ImageIcon size={32} /></div>
                    )}
                  </div>
                </div>
              ) : (
                <input 
                  type="text" 
                  className="form-control" 
                  value={getValue()} 
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="sidebar-content empty-state">
            <p className="text-muted text-center mt-4">
              Clique em qualquer elemento pontilhado na página para editá-lo.
            </p>

            <hr className="my-4" />
            <h4>Ordem das Seções</h4>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              Arraste e solte para reordenar
            </p>
            <div className="layout-list">
              {getLayout().map((key, idx) => (
                <div 
                  key={key} 
                  className={`layout-item ${draggedIdx === idx ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                >
                  <GripVertical size={16} className="text-muted" />
                  <span>{sectionLabels[key] || key}</span>
                </div>
              ))}
            </div>

            <hr className="my-4" />
            <h4>Visibilidade</h4>
            <div className="visibility-toggles">
              <div className="toggle-row" onClick={() => toggleSection('hero_active')}>
                <span>Seção Principal (Hero)</span>
                {draftData.settings.hero_active !== false ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-muted" />}
              </div>
              <div className="toggle-row" onClick={() => toggleSection('portfolio_active')}>
                <span>Mosaico Portfólio</span>
                {draftData.settings.portfolio_active !== false ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-muted" />}
              </div>
              <div className="toggle-row" onClick={() => toggleSection('highlights_active')}>
                <span>Destaques Dinâmicos</span>
                {draftData.settings.highlights_active !== false ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-muted" />}
              </div>
              <div className="toggle-row" onClick={() => toggleSection('about_active')}>
                <span>Sobre Nós</span>
                {draftData.settings.about_active !== false ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-muted" />}
              </div>
              <div className="toggle-row" onClick={() => toggleSection('testimonials_active')}>
                <span>Depoimentos</span>
                {draftData.settings.testimonials_active !== false ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-muted" />}
              </div>
              <div className="toggle-row" onClick={() => toggleSection('instagram_active')}>
                <span>Banner Instagram</span>
                {draftData.settings.instagram_active !== false ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-muted" />}
              </div>
              <div className="toggle-row" onClick={() => toggleSection('cta_active')}>
                <span>Call to Action Final</span>
                {draftData.settings.cta_active !== false ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-muted" />}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .visual-sidebar {
          position: fixed;
          top: 60px; /* Below topbar */
          right: 0;
          bottom: 0;
          width: 300px;
          background: #fff;
          box-shadow: -2px 0 10px rgba(0,0,0,0.1);
          z-index: 1000;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }

        .visual-sidebar.open, .visual-sidebar:not(.open) {
          /* Always open in edit mode, just change content */
          transform: translateX(0); 
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-page);
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
        }

        .sidebar-content {
          padding: 1rem;
          overflow-y: auto;
          flex: 1;
        }

        .placeholder-preview {
          background: #f0f0f0;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          border-radius: 4px;
        }

        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .toggle-row:hover {
          background: #f9f9f9;
        }

        .layout-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .layout-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          cursor: grab;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .layout-item:active {
          cursor: grabbing;
        }

        .layout-item.dragging {
          opacity: 0.5;
          background: #e9ecef;
        }
      `}</style>
    </>
  );
};

export default VisualBuilderSidebar;
