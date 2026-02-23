// src/components/pdf/PageNumbersTool.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaTrash, FaHashtag } from 'react-icons/fa';
import { addPageNumbers } from './pdfHelpers';

const PageNumbersTool = ({ files, setFiles, onResultReady, setLoading }) => {
  const [position, setPosition] = useState('bottom-right');
  const [fontSize, setFontSize] = useState(12);
  const [startNumber, setStartNumber] = useState(1);
  const [error, setError] = useState('');

  const positions = [
    { id: 'top-right', label: 'Top Right' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const pdf = acceptedFiles.filter(f => f.type === 'application/pdf')[0];
    if (pdf) {
      setFiles([pdf]);
      setError('');
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleAddPageNumbers = async () => {
    if (!files[0]) return;
    
    setLoading(true);
    setError('');
    try {
      const numberedPdf = await addPageNumbers(files[0], {
        position,
        fontSize,
        startNumber
      });
      onResultReady(numberedPdf);
    } catch (err) {
      setError('Failed to add page numbers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFiles([]);
    setError('');
  };

  return (
    <div>
      {files.length === 0 ? (
        <div {...getRootProps()} className="upload-area">
          <input {...getInputProps()} />
          <FaFilePdf />
          {isDragActive ? (
            <p>Drop PDF here ...</p>
          ) : (
            <p>Drag & drop a PDF file to add page numbers</p>
          )}
        </div>
      ) : (
        <>
          <div className="file-item">
            <div className="file-info">
              <FaFilePdf />
              <span>{files[0].name}</span>
              <span className="file-size">
                {(files[0].size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button className="remove-file" onClick={removeFile} title="Remove file">
              <FaTrash />
            </button>
          </div>

          <div style={{ marginTop: 16, background: 'var(--bg-secondary)', padding: 16, borderRadius: 8 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                Position:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {positions.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: position === pos.id ? 'var(--accent)' : 'var(--bg-primary)',
                      color: position === pos.id ? 'white' : 'var(--text-primary)',
                      border: `1px solid ${position === pos.id ? 'var(--accent)' : 'var(--border-color)'}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                Start Number:
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                className="pdf-input"
                style={{ width: 100 }}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
              {error}
            </div>
          )}

          <div className="workspace-actions">
            <button
              className="btn btn-primary"
              onClick={handleAddPageNumbers}
              disabled={!files[0]}
            >
              <FaHashtag /> Add Page Numbers
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PageNumbersTool;