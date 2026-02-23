// src/components/pdf/RotateTool.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaTrash, FaRedoAlt } from 'react-icons/fa';
import { loadPdf, rotatePdf, getPageCount } from './pdfHelpers';

const RotateTool = ({ files, setFiles, onResultReady, setLoading }) => {
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [rotationAngle, setRotationAngle] = useState(90);
  const [rotateAll, setRotateAll] = useState(true);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const pdf = acceptedFiles.filter(f => f.type === 'application/pdf')[0];
    if (pdf) {
      setFiles([pdf]);
      setPages([]);
      setSelectedPages(new Set());
      setError('');
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const loadPageInfo = useCallback(async () => {
    if (!files[0]) return;
    setLoading(true);
    try {
      const pageCount = await getPageCount(files[0]);
      setPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    } catch (err) {
      setError('Failed to load PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [files, setLoading]);

  useEffect(() => {
    if (files[0]) {
      loadPageInfo();
    }
  }, [files, loadPageInfo]);

  const togglePage = (pageNum) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum);
    } else {
      newSelected.add(pageNum);
    }
    setSelectedPages(newSelected);
  };

  const handleRotate = async () => {
    if (!files[0]) return;
    setLoading(true);
    setError('');
    try {
      let indices;
      if (rotateAll) {
        indices = 'all';
      } else {
        if (selectedPages.size === 0) {
          setError('Please select at least one page');
          setLoading(false);
          return;
        }
        indices = Array.from(selectedPages).map(p => p - 1);
      }
      
      const rotatedPdf = await rotatePdf(files[0], indices, rotationAngle);
      onResultReady(rotatedPdf);
    } catch (err) {
      setError('Failed to rotate PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFiles([]);
    setPages([]);
    setSelectedPages(new Set());
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
            <p>Drag & drop a PDF file to rotate pages</p>
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

          {/* Rotation Options */}
          <div style={{ marginTop: 16, background: 'var(--bg-secondary)', padding: 16, borderRadius: 8 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <input
                  type="radio"
                  checked={rotateAll}
                  onChange={() => setRotateAll(true)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Rotate all pages</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="radio"
                  checked={!rotateAll}
                  onChange={() => setRotateAll(false)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Rotate specific pages</span>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                Rotation Angle:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[90, 180, 270].map(angle => (
                  <button
                    key={angle}
                    onClick={() => setRotationAngle(angle)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: rotationAngle === angle ? 'var(--accent)' : 'var(--bg-primary)',
                      color: rotationAngle === angle ? 'white' : 'var(--text-primary)',
                      border: `1px solid ${rotationAngle === angle ? 'var(--accent)' : 'var(--border-color)'}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <FaRedoAlt style={{ transform: `rotate(${angle}deg)` }} /> {angle}°
                  </button>
                ))}
              </div>
            </div>

            {!rotateAll && pages.length > 0 && (
              <>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Select pages to rotate ({selectedPages.size} selected):
                  </span>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
                  gap: 8,
                  maxHeight: 150,
                  overflowY: 'auto',
                  padding: 8,
                  background: 'var(--bg-primary)',
                  borderRadius: 6,
                  marginBottom: 8
                }}>
                  {pages.map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => togglePage(pageNum)}
                      style={{
                        padding: '8px 4px',
                        background: selectedPages.has(pageNum) ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: selectedPages.has(pageNum) ? 'white' : 'var(--text-primary)',
                        border: `1px solid ${selectedPages.has(pageNum) ? 'var(--accent)' : 'var(--border-color)'}`,
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Page {pageNum}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
              {error}
            </div>
          )}

          <div className="workspace-actions">
            <button
              className="btn btn-primary"
              onClick={handleRotate}
              disabled={!files[0] || (!rotateAll && selectedPages.size === 0)}
            >
              Rotate PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RotateTool;