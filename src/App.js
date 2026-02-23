import React, { useState, useRef, useEffect, useMemo } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import { debounce } from 'lodash';
import {
  FaSun, FaMoon, FaCopy, FaTrash, FaUpload, FaDownload,
  FaCode, FaTree, FaColumns, FaSearch, FaFileCsv,
  FaPaintBrush, FaCompress, FaCheckCircle, FaExclamationCircle,
  FaFolderOpen, FaRegCopy, FaEraser
} from 'react-icons/fa';

// Custom components
import TreeView from './components/TreeView/JsonTree';
import { DiffTree, computeDelta, countDiffs } from './components/DiffView';
import FindReplace from './components/FindReplace/FindReplace';
import CSVConverter from './components/CSVConverter/CSVConverter';

// New tool components
import { ToolsProvider, useTools } from './components/Context/ToolsContext';
import ToolSelector from './components/ToolSelector/ToolSelector';
import ToolsContainer from './components/ToolsContainer/ToolsContainer';
import ProfileAndToolInfoWidget from './components/ProfileAndInfo/ProfileAndToolInfoWidget';

import { validateJSON, formatJSON, minifyJSON, parseJSONSafe } from './utils/jsonUtils';
import { useLocalStorage } from './hooks/useLocalStorage';
import './styles/themes.css';
import './styles/main.css';
import './components/DiffView/diff.css';

const DEFAULT_JSON = `{
  "array": [1, 2, 3],
  "boolean": true,
  "color": "gold",
  "null": null,
  "number": 123,
  "object": {
    "a": "b",
    "c": "d"
  },
  "string": "Hello World"
}`;

function AppContent() {
  const { activeTool } = useTools();

  const [leftJson, setLeftJson] = useLocalStorage('left-json', DEFAULT_JSON);
  const [rightJson, setRightJson] = useLocalStorage('right-json', '');
  const [leftValidation, setLeftValidation] = useState({ isValid: true, error: null });
  const [rightValidation, setRightValidation] = useState({ isValid: true, error: null });
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [viewMode, setViewMode] = useState('code');
  const [showLeftFind, setShowLeftFind] = useState(false);
  const [showRightFind, setShowRightFind] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const leftEditorRef = useRef();
  const rightEditorRef = useRef();

  // Parse JSON safely
  const parsedLeft = useMemo(() => parseJSONSafe(leftJson), [leftJson]);
  const parsedRight = useMemo(() => parseJSONSafe(rightJson), [rightJson]);

  // Compute delta for diff mode
  const delta = useMemo(() => {
    if (parsedLeft && parsedRight) {
      return computeDelta(parsedLeft, parsedRight);
    }
    return null;
  }, [parsedLeft, parsedRight]);

  // Get diff summary
  const diffSummary = useMemo(() => {
    return delta ? countDiffs(delta) : { added: 0, removed: 0, modified: 0, total: 0 };
  }, [delta]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Debounced validation
  const debouncedValidateLeft = useMemo(
    () => debounce((content) => setLeftValidation(validateJSON(content)), 300),
    []
  );

  const debouncedValidateRight = useMemo(
    () => debounce((content) => setRightValidation(validateJSON(content)), 300),
    []
  );

  useEffect(() => {
    debouncedValidateLeft(leftJson);
  }, [leftJson, debouncedValidateLeft]);

  useEffect(() => {
    if (rightJson) {
      debouncedValidateRight(rightJson);
    }
  }, [rightJson, debouncedValidateRight]);

  useEffect(() => {
    return () => {
      debouncedValidateLeft.cancel();
      debouncedValidateRight.cancel();
    };
  }, [debouncedValidateLeft, debouncedValidateRight]);

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (target === 'left') {
          setLeftJson(event.target.result);
        } else {
          setRightJson(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (target === 'left') {
        setLeftJson(event.target.result);
      } else {
        setRightJson(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getLineCount = (text) => text.split('\n').length;

  const getAceTheme = () => theme === 'dark' ? 'monokai' : 'github';

  // Panel action handlers
  const handleLeftFormat = () => setLeftJson(formatJSON(leftJson));
  const handleRightFormat = () => setRightJson(formatJSON(rightJson));

  const handleLeftMinify = () => setLeftJson(minifyJSON(leftJson));
  const handleRightMinify = () => setRightJson(minifyJSON(rightJson));

  const handleLeftCopy = () => handleCopy(leftJson);
  const handleRightCopy = () => handleCopy(rightJson);

  const handleLeftClear = () => setLeftJson('');
  const handleRightClear = () => setRightJson('');

  return (
    <div
      className="app"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, 'left')}
    >
      {/* Global Toolbar */}
      <div className="global-toolbar">
        <ToolSelector />

        <div className="toolbar-group">
          <button onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span>Theme</span>
          </button>
        </div>

        {/* Show JSON-specific tools only when JSON editor is active */}
        {activeTool === 'json' && (
          <>
            <div className="toolbar-group">
              <button
                onClick={() => setViewMode('code')}
                className={viewMode === 'code' ? 'active' : ''}
                title="Switch to code view"
              >
                <FaCode /> Code
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={viewMode === 'tree' ? 'active' : ''}
                title="Switch to tree view"
              >
                <FaTree /> Tree
              </button>
              <button
                onClick={() => {
                  setViewMode('diff');
                  if (!rightJson) {
                    setRightJson(leftJson);
                  }
                }}
                className={viewMode === 'diff' ? 'active' : ''}
                title="Compare JSON documents"
              >
                <FaColumns /> Diff
              </button>
            </div>

            <div className="toolbar-group">
              <button onClick={() => setShowCSV(true)} title="Convert CSV to JSON or JSON to CSV">
                <FaFileCsv /> CSV
              </button>
            </div>
          </>
        )}

        <ProfileAndToolInfoWidget />
      </div>

      {/* Diff Header - Only show in diff mode */}
      {viewMode === 'diff' && delta && (
        <div className="diff-header-container" style={{ 
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="diff-summary" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {diffSummary.total > 0 ? (
              <>
                <span style={{ 
                  padding: '4px 10px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#b45309',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {diffSummary.modified} modified
                </span>
                <span style={{ 
                  padding: '4px 10px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#15803d',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {diffSummary.added} added
                </span>
                <span style={{ 
                  padding: '4px 10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#b91c1c',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {diffSummary.removed} removed
                </span>
                <span style={{ 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}>
                  {diffSummary.total} total
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                No differences
              </span>
            )}
          </div>

          {diffSummary.total > 0 && (
            <div className="diff-legend" style={{ display: 'flex', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', background: '#22c55e', opacity: 0.7, borderRadius: '3px' }}></span>
                Added
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', background: '#ef4444', opacity: 0.7, borderRadius: '3px' }}></span>
                Removed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', background: '#eab308', opacity: 0.7, borderRadius: '3px' }}></span>
                Modified
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      {activeTool === 'json' ? (
        /* JSON Editor - Two panels */
        <div className="editor-container">
          {/* Left Panel */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <h3>JSON Document</h3>
                <span className="badge">{getLineCount(leftJson)} lines</span>
              </div>
              <div className="panel-toolbar">
                <button
                  onClick={handleLeftFormat}
                  title="Format JSON (pretty print with 2 spaces)"
                  className="icon-button"
                >
                  <FaPaintBrush />
                </button>
                <button
                  onClick={handleLeftMinify}
                  title="Minify JSON (remove all whitespace)"
                  className="icon-button"
                >
                  <FaCompress />
                </button>
                <button
                  onClick={handleLeftCopy}
                  title="Copy to clipboard"
                  className="icon-button"
                >
                  <FaRegCopy />
                </button>
                <button
                  onClick={handleLeftClear}
                  title="Clear editor"
                  className="icon-button"
                >
                  <FaEraser />
                </button>
                <button
                  onClick={() => setShowLeftFind(!showLeftFind)}
                  className={`icon-button ${showLeftFind ? 'active' : ''}`}
                  title="Find and replace (Ctrl+F)"
                >
                  <FaSearch />
                </button>
                <div className="upload-btn">
                  <button className="icon-button" title="Upload JSON file">
                    <FaUpload />
                  </button>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => handleFileUpload(e, 'left')}
                    title="Choose JSON file to upload"
                  />
                </div>
                <button
                  onClick={() => handleDownload(leftJson, 'data.json')}
                  className="icon-button"
                  title="Download JSON file"
                >
                  <FaDownload />
                </button>
              </div>
              <div className="validation-status">
                {leftValidation.isValid ? (
                  <span className="valid" title="JSON is valid">
                    <FaCheckCircle /> Valid
                  </span>
                ) : (
                  <span className="invalid" title={`Error: ${leftValidation.error?.message}`}>
                    <FaExclamationCircle /> Invalid
                  </span>
                )}
              </div>
            </div>

            <div className="panel-content">
              {viewMode === 'code' && (
                <AceEditor
                  ref={leftEditorRef}
                  mode="json"
                  theme={getAceTheme()}
                  value={leftJson}
                  onChange={setLeftJson}
                  name="left-editor"
                  editorProps={{ $blockScrolling: true }}
                  setOptions={{
                    useWorker: false,
                    showLineNumbers: true,
                    tabSize: 2,
                    useSoftTabs: true,
                    wrap: true,
                    highlightActiveLine: true,
                    showPrintMargin: true,
                    fontSize: 13
                  }}
                  className="ace-editor"
                />
              )}

              {viewMode === 'tree' && parsedLeft && (
                <TreeView data={parsedLeft} />
              )}

              {viewMode === 'diff' && parsedLeft && (
                <div className="diff-panel-content">
                  <DiffTree data={parsedLeft} delta={delta} side="left" />
                </div>
              )}
            </div>

            {!leftValidation.isValid && leftValidation.error && (
              <div className="error-panel">
                <FaExclamationCircle />
                <span>
                  {leftValidation.error.message}
                  {leftValidation.error.line && (
                    <span style={{ marginLeft: '8px' }}>
                      at line {leftValidation.error.line}, column {leftValidation.error.column}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Left panel find overlay */}
            {showLeftFind && (
              <FindReplace
                editor={leftEditorRef.current?.editor}
                onClose={() => setShowLeftFind(false)}
                panel="left"
              />
            )}
          </div>

          {/* Right Panel */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <h3>JSON Document</h3>
                <span className="badge">{getLineCount(rightJson)} lines</span>
              </div>
              <div className="panel-toolbar">
                {rightJson && (
                  <>
                    <button
                      onClick={handleRightFormat}
                      title="Format JSON (pretty print with 2 spaces)"
                      className="icon-button"
                    >
                      <FaPaintBrush />
                    </button>
                    <button
                      onClick={handleRightMinify}
                      title="Minify JSON (remove all whitespace)"
                      className="icon-button"
                    >
                      <FaCompress />
                    </button>
                    <button
                      onClick={handleRightCopy}
                      title="Copy to clipboard"
                      className="icon-button"
                    >
                      <FaRegCopy />
                    </button>
                    <button
                      onClick={handleRightClear}
                      title="Clear editor"
                      className="icon-button"
                    >
                      <FaEraser />
                    </button>
                    <button
                      onClick={() => setShowRightFind(!showRightFind)}
                      className={`icon-button ${showRightFind ? 'active' : ''}`}
                      title="Find and replace (Ctrl+F)"
                    >
                      <FaSearch />
                    </button>
                  </>
                )}
                <div className="upload-btn">
                  <button className="icon-button" title="Upload JSON file">
                    <FaUpload />
                  </button>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => handleFileUpload(e, 'right')}
                    title="Choose JSON file to upload"
                  />
                </div>
                {rightJson && (
                  <button
                    onClick={() => handleDownload(rightJson, 'data.json')}
                    className="icon-button"
                    title="Download JSON file"
                  >
                    <FaDownload />
                  </button>
                )}
              </div>
              <div className="validation-status">
                {rightJson ? (
                  rightValidation.isValid ? (
                    <span className="valid" title="JSON is valid">
                      <FaCheckCircle /> Valid
                    </span>
                  ) : (
                    <span className="invalid" title={`Error: ${rightValidation.error?.message}`}>
                      <FaExclamationCircle /> Invalid
                    </span>
                  )
                ) : (
                  <span className="badge">Empty</span>
                )}
              </div>
            </div>

            <div className="panel-content">
              {viewMode === 'code' && (
                <AceEditor
                  ref={rightEditorRef}
                  mode="json"
                  theme={getAceTheme()}
                  value={rightJson}
                  onChange={setRightJson}
                  name="right-editor"
                  editorProps={{ $blockScrolling: true }}
                  setOptions={{
                    useWorker: false,
                    showLineNumbers: true,
                    tabSize: 2,
                    useSoftTabs: true,
                    wrap: true,
                    highlightActiveLine: true,
                    showPrintMargin: true,
                    fontSize: 13
                  }}
                  className="ace-editor"
                />
              )}

              {viewMode === 'tree' && parsedRight && (
                <TreeView data={parsedRight} />
              )}

              {viewMode === 'diff' && parsedRight && (
                <div className="diff-panel-content">
                  <DiffTree data={parsedRight} delta={delta} side="right" />
                </div>
              )}
            </div>

            {!rightValidation.isValid && rightJson && rightValidation.error && (
              <div className="error-panel">
                <FaExclamationCircle />
                <span>
                  {rightValidation.error.message}
                  {rightValidation.error.line && (
                    <span style={{ marginLeft: '8px' }}>
                      at line {rightValidation.error.line}, column {rightValidation.error.column}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Right panel find overlay */}
            {showRightFind && (
              <FindReplace
                editor={rightEditorRef.current?.editor}
                onClose={() => setShowRightFind(false)}
                panel="right"
              />
            )}
          </div>
        </div>
      ) : (
        /* Tools Container */
        <div className="tools-main-container">
          <div className="tool-wrapper">
            <ToolsContainer />
          </div>
        </div>
      )}

      {/* CSV Converter modal */}
      {showCSV && (
        <CSVConverter
          onClose={() => setShowCSV(false)}
          onLoadJson={(json) => {
            setLeftJson(json);
            setViewMode('code');
          }}
        />
      )}

      {/* Drag and drop overlay */}
      {isDragging && (
        <div className="drag-overlay">
          <FaFolderOpen style={{ marginRight: '10px' }} />
          Drop JSON file here
        </div>
      )}
    </div>
  );
}

// Wrap with provider
function App() {
  return (
    <ToolsProvider>
      <AppContent />
    </ToolsProvider>
  );
}

export default App;