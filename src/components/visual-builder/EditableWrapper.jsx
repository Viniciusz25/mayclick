import React from 'react';
import { useVisualEditor } from '../../context/VisualEditorContext';

const EditableWrapper = ({ children, field, label, type = 'text', highlightId, section }) => {
  const { isEditMode, selectedElement, setSelectedElement } = useVisualEditor();

  if (!isEditMode) {
    return <>{children}</>;
  }

  const isSelected = selectedElement?.field === field && selectedElement?.highlightId === highlightId;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement({ field, label, type, highlightId, section });
  };

  return (
    <div
      onClick={handleClick}
      className={`editable-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        cursor: 'pointer',
        border: isSelected ? '2px dashed var(--accent)' : '2px dashed transparent',
        transition: 'all 0.2s ease',
        display: 'inline-block',
        minWidth: '1rem',
        minHeight: '1rem',
        padding: '2px',
        margin: '-2px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.border = '2px dashed rgba(212, 175, 55, 0.5)'; // accent color faded
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.border = '2px dashed transparent';
      }}
    >
      {isSelected && (
        <div
          className="editable-badge"
          style={{
            position: 'absolute',
            top: '-24px',
            left: '-2px',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '4px 4px 0 0',
            fontWeight: 'bold',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

export default EditableWrapper;
