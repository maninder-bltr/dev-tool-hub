// src/components/pdf/SplitTool.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { getPageCount, splitPdf } from './pdfHelpers';

const SplitTool = ({ files, setFiles, onResultReady, setLoading }) => {
  const [range, setRange] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [example, setExample] = useState('1-3,5,7-9');

  const onDrop = useCallback((acceptedFiles) => {
    const pdf = acceptedFiles.filter(f => f.type === 'application/pdf')[0];
    if (pdf) {
      setFiles([pdf]);
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  // Load page count when file changes
  useEffect(() => {
    const loadPageCount = async () => {
      if (files[0]) {
        const count = await getPageCount(files[0]);
        setPageCount(count);
        setExample(`e.g., 1-3,5,7-9 (total ${count} pages)`);
      } else {
        setPageCount(0);
      }
    };
    loadPageCount();
  }, [files]);

  const handleSplit = async () => {
    if (!files[0] || !range.trim()) return;
    
    setLoading(true);
    const result = await splitPdf(files[0], range);
    onResultReady(result);
    setLoading(false);
  };

  const removeFile = () => {
    setFiles([]);
    setRange('');
    setPageCount(0);
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
            <p>Drag & drop a PDF file to extract specific pages</p>
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
              <strong>How to specify pages:</strong>
              <ul style={{ marginTop: 4, marginLeft: 20 }}>
                <li>Single pages: 1,3,5</li>
                <li>Ranges: 1-5 (pages 1 through 5)</li>
                <li>Combinations: 1-3,5,7-9</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
              Page ranges to extract:
            </label>
            <input
              type="text"
              className="pdf-input"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder={example}
            />
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Total pages in PDF: {pageCount}
            </p>
          </div>

          <div className="workspace-actions">
            <button
              className="btn btn-primary"
              onClick={handleSplit}
              disabled={!files[0] || !range.trim()}
            >
              Extract Pages
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SplitTool;