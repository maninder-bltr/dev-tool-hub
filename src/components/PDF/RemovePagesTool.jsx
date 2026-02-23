// src/components/pdf/RemovePagesTool.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { getPageCount, removePages } from './pdfHelpers';

const RemovePagesTool = ({ files, setFiles, onResultReady, setLoading }) => {
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [pageCount, setPageCount] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const pdf = acceptedFiles.filter(f => f.type === 'application/pdf')[0];
    if (pdf) {
      setFiles([pdf]);
      setSelectedPages(new Set());
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  useEffect(() => {
    const loadPages = async () => {
      if (files[0]) {
        const count = await getPageCount(files[0]);
        setPageCount(count);
        setPages(Array.from({ length: count }, (_, i) => i + 1));
      } else {
        setPages([]);
        setPageCount(0);
      }
    };
    loadPages();
  }, [files]);

  const togglePage = (pageNum) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum);
    } else {
      newSelected.add(pageNum);
    }
    setSelectedPages(newSelected);
  };

  const selectAll = () => {
    setSelectedPages(new Set(pages));
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  const handleRemove = async () => {
    if (!files[0] || selectedPages.size === 0) return;
    
    setLoading(true);
    const indicesToRemove = Array.from(selectedPages).map(p => p - 1);
    const result = await removePages(files[0], indicesToRemove);
    onResultReady(result);
    setLoading(false);
  };

  const removeFile = () => {
    setFiles([]);
    setPages([]);
    setSelectedPages(new Set());
  };

  const canRemove = selectedPages.size > 0 && selectedPages.size < pageCount;

  return (
    <div>
      {files.length === 0 ? (
        <div {...getRootProps()} className="upload-area">
          <input {...getInputProps()} />
          <FaFilePdf />
          {isDragActive ? (
            <p>Drop PDF here ...</p>
          ) : (
            <p>Drag & drop a PDF file to remove pages</p>
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

          <div className="info-box">
            <FaInfoCircle className="info-icon" />
            <div className="info-content">
              <strong>Select pages to remove:</strong>
              <p style={{ marginTop: 4 }}>
                Total pages: {pageCount} | Selected: {selectedPages.size}
              </p>
            </div>
          </div>

          {pages.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button
                  onClick={selectAll}
                  className="btn-secondary"
                  style={{ padding: '4px 12px', fontSize: 11 }}
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="btn-secondary"
                  style={{ padding: '4px 12px', fontSize: 11 }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
                gap: 8,
                maxHeight: 200,
                overflowY: 'auto',
                padding: 8,
                background: 'var(--bg-secondary)',
                borderRadius: 6
              }}>
                {pages.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => togglePage(pageNum)}
                    style={{
                      padding: '8px 4px',
                      background: selectedPages.has(pageNum) ? '#ef4444' : 'var(--bg-primary)',
                      color: selectedPages.has(pageNum) ? 'white' : 'var(--text-primary)',
                      border: `1px solid ${selectedPages.has(pageNum) ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: selectedPages.has(pageNum) ? '600' : '400'
                    }}
                  >
                    Page {pageNum}
                  </button>
                ))}
              </div>

              {!canRemove && selectedPages.size > 0 && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
                  Cannot remove all pages. PDF must have at least one page.
                </p>
              )}
            </>
          )}

          <div className="workspace-actions">
            <button
              className="btn btn-primary"
              onClick={handleRemove}
              disabled={!canRemove}
            >
              Remove Selected Pages ({selectedPages.size})
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RemovePagesTool;