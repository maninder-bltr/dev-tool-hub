// src/components/pdf/WatermarkTool.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FaFilePdf, FaTrash, FaWater, FaImage, FaFont, 
  FaExclamationCircle, FaCheckCircle 
} from 'react-icons/fa';
import { addTextWatermark, addImageWatermark } from './pdfHelpers';

const WatermarkTool = ({ files, setFiles, onResultReady, setLoading }) => {
  const [watermarkType, setWatermarkType] = useState('text'); // 'text' or 'image'
  
  // Text watermark options
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState('center');
  
  // Image watermark options
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [imageScale, setImageScale] = useState(0.5);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const pdf = acceptedFiles.filter(f => f.type === 'application/pdf')[0];
    if (pdf) {
      setFiles([pdf]);
      setError('');
      setSuccess('');
    }
  }, [setFiles]);

  const onImageDrop = useCallback((acceptedFiles) => {
    const image = acceptedFiles[0];
    if (image) {
      setWatermarkImage(image);
      setSuccess('Watermark image loaded successfully');
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const { 
    getRootProps: getImageRootProps, 
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive 
  } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
  });

  const handleAddWatermark = async () => {
    if (!files[0]) return;
    
    if (watermarkType === 'text' && !watermarkText.trim()) {
      setError('Please enter watermark text');
      return;
    }
    
    if (watermarkType === 'image' && !watermarkImage) {
      setError('Please upload a watermark image');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    let result;
    if (watermarkType === 'text') {
      result = await addTextWatermark(files[0], watermarkText, {
        opacity,
        rotation,
        fontSize,
        position
      });
    } else {
      result = await addImageWatermark(files[0], watermarkImage, {
        opacity,
        rotation,
        scale: imageScale,
        position
      });
    }
    
    onResultReady(result);
    setLoading(false);
  };

  const removeFile = () => {
    setFiles([]);
    setWatermarkImage(null);
    setError('');
    setSuccess('');
  };

  return (
    <div>
      {files.length === 0 ? (
        <div {...getRootProps()} className="upload-area">
          <input {...getInputProps()} />
          <FaFilePdf size={32} />
          {isDragActive ? (
            <p>Drop PDF here ...</p>
          ) : (
            <p>Drag & drop a PDF file to add watermark</p>
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

          {/* Success Message */}
          {success && (
            <div className="status-message success">
              <FaCheckCircle />
              <span>{success}</span>
            </div>
          )}

          {/* Watermark Type Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className={`btn ${watermarkType === 'text' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setWatermarkType('text')}
              style={{ flex: 1 }}
            >
              <FaFont /> Text Watermark
            </button>
            <button
              className={`btn ${watermarkType === 'image' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setWatermarkType('image')}
              style={{ flex: 1 }}
            >
              <FaImage /> Image Watermark
            </button>
          </div>

          {watermarkType === 'text' ? (
            /* Text Watermark Options */
            <div className="options-panel">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Watermark Text
                </label>
                <input
                  type="text"
                  className="pdf-input"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          ) : (
            /* Image Watermark Options */
            <div className="options-panel">
              <div {...getImageRootProps()} className="upload-area" style={{ padding: 16 }}>
                <input {...getImageInputProps()} />
                <FaImage size={24} />
                {isImageDragActive ? (
                  <p>Drop image here ...</p>
                ) : (
                  <p>{watermarkImage ? watermarkImage.name : 'Click or drag watermark image'}</p>
                )}
              </div>

              {watermarkImage && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Image Scale: {(imageScale * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={imageScale}
                    onChange={(e) => setImageScale(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Common Options */}
          <div className="options-panel">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                Opacity: {(opacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                Position
              </label>
              <select
                className="pdf-input"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="preview-panel">
            <h4>Preview</h4>
            <div className="preview-box">
              {watermarkType === 'text' ? (
                <div style={{
                  fontSize: fontSize / 3,
                  opacity,
                  transform: `rotate(${rotation}deg)`,
                  color: 'var(--text-primary)',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  {watermarkText || 'WATERMARK'}
                </div>
              ) : watermarkImage && (
                <img 
                  src={URL.createObjectURL(watermarkImage)} 
                  alt="Watermark preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 100,
                    opacity,
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationCircle /> {error}
            </div>
          )}

          <div className="workspace-actions">
            <button
              className="btn btn-primary"
              onClick={handleAddWatermark}
              disabled={
                !files[0] || 
                (watermarkType === 'text' && !watermarkText.trim()) ||
                (watermarkType === 'image' && !watermarkImage)
              }
            >
              <FaWater /> Add Watermark
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WatermarkTool;