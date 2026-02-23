// src/components/pdf/PdfTool.jsx
import React, { useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import PdfToolbar from './PdfToolbar';
import PdfWorkspace from './PdfWorkspace';
import { downloadPdf } from './pdfHelpers';
import './pdfStyles.css';

const PdfTool = () => {
  const [activeMode, setActiveMode] = useState('merge');
  const [files, setFiles] = useState([]);
  const [resultPdf, setResultPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultInfo, setResultInfo] = useState(null);

  const showSuccess = (message, info = null) => {
    setSuccessMessage(message);
    setResultInfo(info);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setResultInfo(null);
  };

  const handleClear = () => {
    setFiles([]);
    setResultPdf(null);
    setResultInfo(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleDownload = useCallback(async () => {
    if (!resultPdf) return;
    await downloadPdf(resultPdf, 'Mani_Tool_Hub');
    showSuccess('File downloaded successfully!');
  }, [resultPdf]);

  const handleResultReady = useCallback((result) => {
    if (result.success) {
      setResultPdf(result.pdf);
      setResultInfo(result);
      showSuccess(result.message, result);
    } else {
      showError(result.error);
    }
  }, []);

  const canDownload = !!resultPdf;

  return (
    <div className="pdf-tool">
      <PdfToolbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onClear={handleClear}
        onDownload={handleDownload}
        canDownload={canDownload}
      />

      {/* Status Messages */}
      {successMessage && (
        <div className="status-message success">
          <FaCheckCircle />
          <span>{successMessage}</span>
          {resultInfo?.pageCount && (
            <span className="status-details">
              ({resultInfo.pageCount} pages)
            </span>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="status-message error">
          <FaExclamationCircle />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="pdf-workspace">
        <div className="workspace-header">
          <span className="workspace-title">
            {activeMode === 'merge' && 'Merge PDFs'}
            {activeMode === 'split' && 'Split PDF'}
            {activeMode === 'remove' && 'Remove Pages'}
            {activeMode === 'rotate' && 'Rotate Pages'}
            {activeMode === 'watermark' && 'Add Watermark'}
            {activeMode === 'pagenum' && 'Add Page Numbers'}
            {activeMode === 'image2pdf' && 'Images to PDF'}
            {activeMode === 'sign' && 'Sign PDF'}
          </span>
          {files.length > 0 && (
            <span className="status-badge">{files.length} file(s)</span>
          )}
        </div>

        <div className="workspace-content">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Processing your PDF...</span>
            </div>
          )}

          <PdfWorkspace
            mode={activeMode}
            files={files}
            setFiles={setFiles}
            onResultReady={handleResultReady}
            setLoading={setLoading}
          />

          {/* Result Summary */}
          {resultInfo && !loading && (
            <div className="result-summary">
              <h4>Operation Complete</h4>
              <p>{resultInfo.message}</p>
              {resultInfo.pageCount && (
                <p>Output PDF has {resultInfo.pageCount} pages</p>
              )}
              <p className="download-hint">
                Click the Download button above to save your file as pdf
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy footer */}
      <div className="pdf-footer">
        <span className="footer-note">
        🔒 Your files are processed entirely in your browser. No data is uploaded, stored, or transmitted to any server.
        </span>
        <span>v1.0</span>
      </div>
    </div>
  );
};

export default PdfTool;