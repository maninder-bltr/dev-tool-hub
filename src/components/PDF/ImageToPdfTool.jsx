// src/components/pdf/ImageToPdfTool.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileImage, FaTrash, FaImages } from 'react-icons/fa';
import { imagesToPdf } from './pdfHelpers';

const ImageToPdfTool = ({ files, setFiles, onResultReady, setLoading }) => {
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    // Filter for images only
    const images = acceptedFiles.filter(f => 
      f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
    );
    
    if (images.length === 0) {
      setError('Please upload JPG or PNG images only');
      return;
    }
    
    setFiles(prev => [...prev, ...images]);
    setError('');
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
  });

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setLoading(true);
    setError('');
    try {
      const pdf = await imagesToPdf(files);
      onResultReady(pdf);
    } catch (err) {
      setError('Failed to convert images: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAll = () => {
    setFiles([]);
    setError('');
  };

  return (
    <div>
      <div {...getRootProps()} className="upload-area">
        <input {...getInputProps()} />
        <FaImages />
        {isDragActive ? (
          <p>Drop images here ...</p>
        ) : (
          <p>Drag & drop images, or click to select</p>
        )}
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
          Supported: JPG, PNG
        </p>
      </div>

      {files.length > 0 && (
        <>
          <div className="file-list">
            {files.map((file, idx) => (
              <div key={idx} className="file-item">
                <div className="file-info">
                  <FaFileImage />
                  <span>{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button className="remove-file" onClick={() => removeFile(idx)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {files.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button
                onClick={removeAll}
                style={{
                  padding: '4px 12px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 4,
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                Remove All
              </button>
            </div>
          )}

          {error && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
              {error}
            </div>
          )}

          <div className="workspace-actions">
            <button
              className="btn btn-primary"
              onClick={handleConvert}
              disabled={files.length === 0}
            >
              Convert {files.length} Image{files.length > 1 ? 's' : ''} to PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageToPdfTool;