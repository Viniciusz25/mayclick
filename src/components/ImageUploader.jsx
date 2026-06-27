import React, { useState, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadImage } from '../lib/apiClient';

/**
 * ImageUploader — allows the user to either paste a URL or upload a file.
 *
 * Props:
 *   value        {string}   Current image URL value
 *   onChange     {fn}       Called with the new URL string
 *   placeholder  {string}   Placeholder text for the URL input
 *   label        {string}   Optional label to show above the component (if omitted, no label rendered)
 */
const ImageUploader = ({ value, onChange, placeholder = 'https://...', label }) => {
  const [mode, setMode] = useState('url'); // 'url' | 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
    setUploadError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploadError('');
    setUploading(true);

    try {
      const result = await uploadImage(file);
      setPreview(result.url);
      onChange(result.url);
    } catch (err) {
      setUploadError(err.message || 'Erro ao fazer upload. Tente novamente.');
      setPreview(value || '');
      onChange(value || '');
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setPreview('');
    onChange('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-uploader">
      {label && <span className="image-uploader-label">{label}</span>}

      {/* Mode Tabs */}
      <div className="image-uploader-tabs">
        <button
          type="button"
          className={`uploader-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => setMode('url')}
        >
          <Link size={14} /> URL
        </button>
        <button
          type="button"
          className={`uploader-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          <Upload size={14} /> Upload de Arquivo
        </button>
      </div>

      {/* URL Input */}
      {mode === 'url' && (
        <div className="image-uploader-url-row">
          <input
            type="text"
            className="image-uploader-input"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder={placeholder}
          />
        </div>
      )}

      {/* File Upload Area */}
      {mode === 'upload' && (
        <div
          className="image-drop-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="drop-zone-uploading">
              <Loader size={24} className="spinning" />
              <span>Enviando imagem...</span>
            </div>
          ) : (
            <>
              <Upload size={24} />
              <span>Clique para selecionar ou arraste uma imagem</span>
              <small>JPG, PNG, WEBP ou GIF · Máx. 10MB</small>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="image-uploader-error">{uploadError}</p>
      )}

      {/* Preview */}
      {preview && !uploading && (
        <div className="image-uploader-preview">
          <img src={preview} alt="Preview" onError={() => setPreview('')} />
          <button type="button" className="preview-clear" onClick={handleClear} title="Remover imagem">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
