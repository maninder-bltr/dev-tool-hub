import React from 'react';
import {
  FaSun, FaMoon, FaCopy, FaTrash, FaUpload, FaDownload,
  FaCode, FaTree, FaColumns, FaSearch, FaFileCsv,
  FaPaintBrush, FaCompress, FaExpand
} from 'react-icons/fa';

const Toolbar = ({
  theme,
  setTheme,
  onFormat,
  onMinify,
  onCopy,
  onClear,
  onUpload,
  onDownload,
  onToggleView,
  onDiffToggle,
  onFindReplace,
  onCSV,
  viewMode
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpload(event.target.result);
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
          <span>Theme</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={onFormat} title="Format JSON (2 spaces)">
          <FaPaintBrush />
          <span>Format</span>
        </button>
        <button onClick={onMinify} title="Minify JSON">
          <FaCompress />
          <span>Minify</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={onCopy} title="Copy to clipboard">
          <FaCopy />
          <span>Copy</span>
        </button>
        <button onClick={onClear} title="Clear editor">
          <FaTrash />
          <span>Clear</span>
        </button>
      </div>

      <div className="toolbar-group">
        <div className="file-upload">
          <button>
            <FaUpload />
            <span>Upload</span>
          </button>
          <input type="file" accept=".json,application/json" onChange={handleFileChange} />
        </div>
        <button onClick={onDownload} title="Download JSON">
          <FaDownload />
          <span>Download</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={onToggleView} title="Toggle code/tree view">
          {viewMode === 'code' ? <FaTree /> : <FaCode />}
          <span>{viewMode === 'code' ? 'Tree' : 'Code'}</span>
        </button>
        <button onClick={onDiffToggle} title="Compare JSON">
          <FaColumns />
          <span>Diff</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={onFindReplace} title="Find and replace">
          <FaSearch />
          <span>Find/Replace</span>
        </button>
        <button onClick={onCSV} title="CSV converter">
          <FaFileCsv />
          <span>CSV</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;