import React, { useState, useEffect, useRef } from 'react';
import { 
  FaCopy, FaUpload, FaDownload, FaExchangeAlt, 
  FaLock, FaLockOpen, FaTrash, FaFileAlt,
  FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import './Base64Converter.css'

const Base64Converter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [error, setError] = useState('');
  const [charset, setCharset] = useState('UTF-8');
  const [liveMode, setLiveMode] = useState(true);
  const [inputType, setInputType] = useState('text'); // 'text' or 'file'
  const [fileName, setFileName] = useState('');
  const [copySuccess, setCopySuccess] = useState({ input: false, output: false });

  const fileInputRef = useRef(null);
  const inputTextareaRef = useRef(null);
  const outputTextareaRef = useRef(null);

  // Convert based on mode
  useEffect(() => {
    if (!input) {
      setOutput('');
      setError('');
      return;
    }

    if (!liveMode) return;

    performConversion();
  }, [input, mode, charset, liveMode]);

  const performConversion = () => {
    try {
      if (mode === 'encode') {
        // Encode to Base64
        let textToEncode = input;
        
        // Handle different charsets
        if (charset === 'UTF-8') {
          textToEncode = unescape(encodeURIComponent(input));
        }
        
        const encoded = btoa(textToEncode);
        setOutput(encoded);
        setError('');
      } else {
        // Decode from Base64
        // First, validate if it's valid base64
        if (!isValidBase64(input)) {
          throw new Error('Invalid Base64 string');
        }
        
        const decoded = atob(input);
        
        // Handle different charsets
        if (charset === 'UTF-8') {
          try {
            const utf8Decoded = decodeURIComponent(escape(decoded));
            setOutput(utf8Decoded);
          } catch {
            // If UTF-8 decoding fails, return raw decoded
            setOutput(decoded);
          }
        } else {
          setOutput(decoded);
        }
        setError('');
      }
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  };

  const isValidBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  const handleConvert = () => {
    performConversion();
  };

  const handleSwap = () => {
    setMode(prev => prev === 'encode' ? 'decode' : 'decode');
    setInput(output);
    setOutput(input);
    setError('');
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!output) return;

    const extension = mode === 'encode' ? 'txt' : 'txt';
    const mimeType = 'text/plain';
    const filename = mode === 'encode' 
      ? `encoded-${Date.now()}.${extension}` 
      : `decoded-${Date.now()}.${extension}`;
    
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (mode === 'encode') {
        // For encoding, read as text
        setInput(event.target.result);
      } else {
        // For decoding, read as text (base64 string)
        setInput(event.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setInput(event.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const getStats = (text) => {
    if (!text) return { chars: 0, words: 0, lines: 0 };
    
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    
    return { chars, words, lines };
  };

  const inputStats = getStats(input);
  const outputStats = getStats(output);

  return (
    <div className="base64-converter">
      {/* Header */}
      <div className="converter-header">
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'encode' ? 'active' : ''}`}
            onClick={() => setMode('encode')}
            title="Encode text to Base64"
          >
            <FaLock /> Encode
          </button>
          <button 
            className={`mode-btn ${mode === 'decode' ? 'active' : ''}`}
            onClick={() => setMode('decode')}
            title="Decode Base64 to text"
          >
            <FaLockOpen /> Decode
          </button>
          <button 
            className="swap-btn"
            onClick={handleSwap}
            title="Swap input and output"
            disabled={!input && !output}
          >
            <FaExchangeAlt />
          </button>
        </div>

        <div className="converter-controls">
          <select 
            value={charset} 
            onChange={(e) => setCharset(e.target.value)}
            className="charset-select"
            title="Select character set"
          >
            <option value="UTF-8">UTF-8</option>
            <option value="ASCII">ASCII</option>
            <option value="ISO-8859-1">ISO-8859-1</option>
          </select>

          <label className="live-mode">
            <input
              type="checkbox"
              checked={liveMode}
              onChange={(e) => setLiveMode(e.target.checked)}
            />
            <span>Live mode</span>
          </label>
        </div>
      </div>

      {/* Main Panels */}
      <div className="converter-panels">
        {/* Input Panel */}
        <div 
          className="converter-panel"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="panel-label">
            <div className="label-left">
              <FaFileAlt className="panel-icon" />
              <span>{mode === 'encode' ? 'Text Input' : 'Base64 Input'}</span>
              {input && (
                <span className="stats-badge">
                  {inputStats.chars} chars • {inputStats.lines} lines
                </span>
              )}
            </div>
            <div className="panel-actions">
              <button 
                onClick={() => setInputType('text')} 
                className={inputType === 'text' ? 'active' : ''}
                title="Text input mode"
              >
                Text
              </button>
              <button 
                onClick={() => setInputType('file')} 
                className={inputType === 'file' ? 'active' : ''}
                title="File upload mode"
              >
                File
              </button>
              <button 
                onClick={() => handleCopy(input, 'input')}
                disabled={!input}
                className="copy-btn"
                title="Copy to clipboard"
              >
                {copySuccess.input ? <FaCheckCircle /> : <FaCopy />}
              </button>
              <button 
                onClick={handleClear}
                disabled={!input && !output}
                className="clear-btn"
                title="Clear all"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          <div className="panel-content">
            {inputType === 'text' ? (
              <textarea
                ref={inputTextareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' 
                  ? 'Enter text to encode to Base64...\n\nExample: Hello World' 
                  : 'Enter Base64 string to decode...\n\nExample: SGVsbG8gV29ybGQ='
                }
                className="converter-textarea"
                spellCheck={false}
              />
            ) : (
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  id="base64-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="base64-file-input" className="file-upload-label">
                  <FaUpload /> Choose File
                </label>
                {fileName && (
                  <div className="file-info">
                    <span className="file-name">{fileName}</span>
                    <button 
                      className="remove-file"
                      onClick={() => {
                        setFileName('');
                        setInput('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                )}
                <p className="drop-hint">or drag and drop file here</p>
              </div>
            )}
          </div>

          {!liveMode && input && (
            <div className="panel-footer">
              <button onClick={handleConvert} className="convert-btn">
                {mode === 'encode' ? 'Encode →' : 'Decode →'}
              </button>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="converter-panel">
          <div className="panel-label">
            <div className="label-left">
              <FaFileAlt className="panel-icon" />
              <span>{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
              {output && (
                <span className="stats-badge">
                  {outputStats.chars} chars • {outputStats.lines} lines
                </span>
              )}
            </div>
            <div className="panel-actions">
              <button 
                onClick={() => handleCopy(output, 'output')}
                disabled={!output}
                className="copy-btn"
                title="Copy to clipboard"
              >
                {copySuccess.output ? <FaCheckCircle /> : <FaCopy />}
              </button>
              <button 
                onClick={handleDownload}
                disabled={!output}
                className="download-btn"
                title="Download as file"
              >
                <FaDownload />
              </button>
            </div>
          </div>

          <div className="panel-content">
            <textarea
              ref={outputTextareaRef}
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="converter-textarea output"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <FaExclamationCircle className="error-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Footer */}
      <div className="converter-footer">
        <div className="info-note">
          <span className="info-icon">💡</span>
          <span>
            {mode === 'encode' 
              ? 'Encode text to Base64 format. Use for data URLs, email attachments, or storing binary data as text.'
              : 'Decode Base64 back to readable text. Supports UTF-8, ASCII, and ISO-8859-1 character sets.'}
          </span>
        </div>
        <div className="shortcuts-hint">
          <kbd>Ctrl+Enter</kbd> convert • <kbd>Ctrl+Shift+C</kbd> copy output
        </div>
      </div>
    </div>
  );
};

export default Base64Converter;