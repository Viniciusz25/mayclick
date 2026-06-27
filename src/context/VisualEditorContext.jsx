import React, { createContext, useContext, useState, useEffect } from 'react';

const VisualEditorContext = createContext(null);

export const useVisualEditor = () => {
  const context = useContext(VisualEditorContext);
  if (!context) {
    throw new Error('useVisualEditor must be used within a VisualEditorProvider');
  }
  return context;
};

export const VisualEditorProvider = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize draft data from real data
  const initializeDraft = (realData) => {
    setDraftData(JSON.parse(JSON.stringify(realData))); // deep copy
    setHasUnsavedChanges(false);
    setSelectedElement(null);
  };

  // Update a specific setting field
  const updateSetting = (key, value) => {
    if (!draftData || !draftData.settings) return;
    setDraftData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Update highlight field
  const updateHighlight = (id, key, value) => {
    if (!draftData || !draftData.highlights) return;
    setDraftData((prev) => ({
      ...prev,
      highlights: prev.highlights.map(h => h.id === id ? { ...h, [key]: value } : h)
    }));
    setHasUnsavedChanges(true);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      setSelectedElement(null);
    }
  };

  return (
    <VisualEditorContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        setIsEditMode,
        draftData,
        initializeDraft,
        updateSetting,
        updateHighlight,
        selectedElement,
        setSelectedElement,
        hasUnsavedChanges,
        setHasUnsavedChanges
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
};
