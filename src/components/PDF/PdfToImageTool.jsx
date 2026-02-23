// src/components/pdf/PdfToImageTool.jsx
import React from 'react';
import { FaFilePdf, FaClock } from 'react-icons/fa';

const PdfToImageTool = () => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-icon">
        <FaFilePdf size={48} />
        <FaClock size={32} className="clock-icon" />
      </div>
      <h3>PDF to Image Converter</h3>
      <p className="coming-soon-message">
        Convert PDF pages to PNG or JPG images directly in your browser.
      </p>
      <div className="feature-list">
        <h4>Coming Features:</h4>
        <ul>
          <li>✓ Convert all pages or specific page ranges</li>
          <li>✓ PNG and JPG format support</li>
          <li>✓ Adjustable image quality for JPG</li>
          <li>✓ High-resolution scaling option</li>
          <li>✓ Download as ZIP for multiple images</li>
          <li>✓ Live thumbnail preview</li>
        </ul>
      </div>
      <p className="development-note">
        🚧 This feature is under active development and will be available soon!
      </p>
      <p className="privacy-note">
        🔒 Like all our tools, processing will happen entirely in your browser.
        No files will ever be uploaded.
      </p>
    </div>
  );
};

export default PdfToImageTool;