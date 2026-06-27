import React, { useState } from 'react';
import { useVisualEditor } from '../../context/VisualEditorContext';
import { updateBusinessSettings } from '../../lib/apiClient'; // Assuming this exists for settings
// If we need to save highlights, we should add a bulk update in apiClient, or loop.

const VisualBuilderHeader = ({ onSaveComplete }) => {
  const { isEditMode, toggleEditMode, hasUnsavedChanges, draftData, setHasUnsavedChanges } = useVisualEditor();
  const [saving, setSaving] = useState(false);

  if (!isEditMode) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // We only save settings for now in this proof of concept. 
      // A full implementation would also save highlights and testimonials if they were edited.
      await updateBusinessSettings(draftData.settings);
      
      setHasUnsavedChanges(false);
      
      // Notify parent to refresh real data
      if (onSaveComplete) {
        onSaveComplete();
      }
      
      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving visual builder data:', error);
      alert('Erro ao salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
        return;
      }
    }
    toggleEditMode();
  };

  return (
    <div className="visual-builder-header">
      <div className="header-left">
        <span className="builder-badge">Modo Editor Visual</span>
      </div>
      <div className="header-right">
        <button className="btn btn-outline-white btn-sm" onClick={handleCancel}>
          Sair do Editor
        </button>
        <button 
          className="btn btn-accent btn-sm" 
          onClick={handleSave}
          disabled={!hasUnsavedChanges || saving}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <style>{`
        .visual-builder-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #1a1a1a;
          color: white;
          z-index: 1001;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .builder-badge {
          background: var(--accent);
          color: #fff;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .header-right {
          display: flex;
          gap: 1rem;
        }
        .btn-outline-white {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.5);
          color: white;
        }
        .btn-outline-white:hover {
          background: rgba(255,255,255,0.1);
        }
        /* Push the main body down when editor is open */
        body.visual-editor-active {
          padding-top: 60px;
          padding-right: 300px; /* space for sidebar */
        }
      `}</style>
    </div>
  );
};

export default VisualBuilderHeader;
