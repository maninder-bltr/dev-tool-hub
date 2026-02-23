import React, { useState, useRef, useEffect } from 'react';
import { 
  FaCode, FaLock, FaClock, FaColumns, 
  FaPalette, FaChevronDown, FaHistory , FaFilePdf
} from 'react-icons/fa'; // Removed FaLockOpen
import { useTools } from '../Context/ToolsContext'

const tools = [
  { id: 'json', name: 'JSON Editor', icon: FaCode, description: 'Edit, format, and validate JSON' },
  { id: 'diff', name: 'Text Diff Checker', icon: FaColumns, description: 'Compare text side by side' },
  { id: 'base64', name: 'Base64 Converter', icon: FaLock, description: 'Encode/decode Base64 strings' },
  { id: 'epoch', name: 'Epoch Calculator', icon: FaClock, description: 'Convert between epoch and human dates' },
  { id: 'color', name: 'Color Tools', icon: FaPalette, description: 'Color picker and converter' },
  { id: 'pdf', name: 'PDF Tools', icon: FaFilePdf, description: 'Merge, split, sign PDFs'}
];

const ToolSelector = () => {
  const { activeTool, switchTool, toolHistory } = useTools();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const dropdownRef = useRef(null);

  const currentTool = tools.find(t => t.id === activeTool) || tools[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="tool-selector" ref={dropdownRef}>
      <button 
        className="tool-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <currentTool.icon className="tool-icon" />
        <span className="tool-name">{currentTool.name}</span>
        <FaChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="tool-dropdown">
          {/* History section if available */}
          {toolHistory.length > 1 && (
            <div className="tool-history">
              <div className="history-header" onClick={() => setShowHistory(!showHistory)}>
                <FaHistory /> Recent Tools
                <FaChevronDown className={`history-arrow ${showHistory ? 'open' : ''}`} />
              </div>
              {showHistory && (
                <div className="history-list">
                  {toolHistory.slice(1, 4).map(toolId => {
                    const tool = tools.find(t => t.id === toolId);
                    return tool ? (
                      <button
                        key={tool.id}
                        className="tool-option history-item"
                        onClick={() => {
                          switchTool(tool.id);
                          setIsOpen(false);
                          setShowHistory(false);
                        }}
                      >
                        <tool.icon className="tool-icon" />
                        <span className="tool-name">{tool.name}</span>
                      </button>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* All tools */}
          <div className="tools-list">
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`tool-option ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => {
                  switchTool(tool.id);
                  setIsOpen(false);
                  setShowHistory(false);
                }}
              >
                <tool.icon className="tool-icon" />
                <div className="tool-info">
                  <span className="tool-name">{tool.name}</span>
                  <span className="tool-description">{tool.description}</span>
                </div>
                {activeTool === tool.id && <span className="active-indicator">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolSelector;