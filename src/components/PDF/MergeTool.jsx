import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaTrash } from 'react-icons/fa';
import { mergePdfs } from './pdfHelpers';

const MergeTool = ({ files, setFiles, onResultReady, setLoading }) => {
  const onDrop = useCallback((acceptedFiles) => {
    // Accept only PDFs
    const pdfs = acceptedFiles.filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...pdfs]);
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    try {
      const mergedPdf = await mergePdfs(files);
      onResultReady(mergedPdf);
    } catch (err) {
      console.error(err);
      // Show error badge
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Dropzone */}
      <div {...getRootProps()} className="upload-area">
        <input {...getInputProps()} />
        <FaFilePdf />
        {isDragActive ? (
          <p>Drop PDFs here ...</p>
        ) : (
          <p>Drag & drop PDF files, or click to select</p>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, idx) => (
            <div key={idx} className="file-item">
              <div className="file-info">
                <FaFilePdf />
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
      )}

      {/* Action button */}
      <div className="workspace-actions">
        <button
          className="btn btn-primary"
          onClick={handleMerge}
          disabled={files.length < 2}
        >
          Merge PDFs
        </button>
      </div>
    </div>
  );
};

export default MergeTool;