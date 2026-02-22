import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaCopy, FaExchangeAlt, FaEraser, FaFileAlt,
  FaUpload, FaDownload, FaSearch
} from 'react-icons/fa';
import { diffLines } from 'diff';
import './DiffChecker.css';

const DiffChecker = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diffResult, setDiffResult] = useState([]);
  const [showDiff, setShowDiff] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  
  const leftTextareaRef = useRef(null);
  const rightTextareaRef = useRef(null);
  const diffContainerRef = useRef(null);

  // Compute diff
  const computeDiff = useCallback(() => {
    if (!leftText && !rightText) {
      setDiffResult([]);
      return;
    }

    let left = leftText;
    let right = rightText;

    if (ignoreWhitespace) {
      left = left.replace(/\s+$/gm, '').replace(/^\s+/gm, '');
      right = right.replace(/\s+$/gm, '').replace(/^\s+/gm, '');
    }

    const diff = diffLines(left, right);
    setDiffResult(diff);
  }, [leftText, rightText, ignoreWhitespace]);

  // Handle Find Difference click
  const handleFindDifference = () => {
    setIsComparing(true);
    computeDiff();
    setShowDiff(true);
    
    // Scroll to diff view after a short delay
    setTimeout(() => {
      if (diffContainerRef.current) {
        diffContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    setTimeout(() => setIsComparing(false), 300);
  };

  // Handle text change - allow re-comparison
  const handleLeftChange = (e) => {
    setLeftText(e.target.value);
    if (showDiff) {
      // Optionally auto-update diff when editing
      computeDiff();
    }
  };

  const handleRightChange = (e) => {
    setRightText(e.target.value);
    if (showDiff) {
      // Optionally auto-update diff when editing
      computeDiff();
    }
  };

  // Calculate stats
  const additions = diffResult.filter(part => part.added).reduce((acc, part) => acc + (part.count || 0), 0);
  const deletions = diffResult.filter(part => part.removed).reduce((acc, part) => acc + (part.count || 0), 0);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSwap = () => {
    setLeftText(rightText);
    setRightText(leftText);
    if (showDiff) {
      setTimeout(computeDiff, 100);
    }
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
    setDiffResult([]);
    setShowDiff(false);
  };

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (side === 'left') {
        setLeftText(event.target.result);
      } else {
        setRightText(event.target.result);
      }
      if (showDiff) {
        setTimeout(computeDiff, 100);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render left panel lines (original with removals)
  const renderLeftPanel = () => {
    if (!leftText) return <div className="empty-panel">No original text</div>;
    
    let lineNum = 1;
    const elements = [];
    
    diffResult.forEach((part, index) => {
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      
      lines.forEach((line, lineIndex) => {
        if (part.removed) {
          elements.push(
            <div key={`left-${index}-${lineIndex}`} className="diff-line removed">
              <span className="line-num">{lineNum}</span>
              <span className="line-content">{line || ' '}</span>
            </div>
          );
          lineNum++;
        } else if (!part.added) {
          elements.push(
            <div key={`left-${index}-${lineIndex}`} className="diff-line unchanged">
              <span className="line-num">{lineNum}</span>
              <span className="line-content">{line || ' '}</span>
            </div>
          );
          lineNum++;
        }
      });
    });
    
    return elements.length ? elements : <div className="empty-panel">No content</div>;
  };

  // Render right panel lines (changed with additions)
  const renderRightPanel = () => {
    if (!rightText) return <div className="empty-panel">No changed text</div>;
    
    let lineNum = 1;
    const elements = [];
    
    diffResult.forEach((part, index) => {
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      
      lines.forEach((line, lineIndex) => {
        if (part.added) {
          elements.push(
            <div key={`right-${index}-${lineIndex}`} className="diff-line added">
              <span className="line-num">{lineNum}</span>
              <span className="line-content">{line || ' '}</span>
            </div>
          );
          lineNum++;
        } else if (!part.removed) {
          elements.push(
            <div key={`right-${index}-${lineIndex}`} className="diff-line unchanged">
              <span className="line-num">{lineNum}</span>
              <span className="line-content">{line || ' '}</span>
            </div>
          );
          lineNum++;
        }
      });
    });
    
    return elements.length ? elements : <div className="empty-panel">No content</div>;
  };

  const leftLineCount = leftText ? leftText.split('\n').length : 0;
  const rightLineCount = rightText ? rightText.split('\n').length : 0;

  return (
    <div className="diff-checker-wrapper">
      {/* Step 1: Input Section - Always Visible */}
      <div className="input-section-main">
        <div className="input-header-main">
          <div className="input-title">
            <FaFileAlt /> Original text
          </div>
          <div className="input-title">
            <FaFileAlt /> Changed text
          </div>
        </div>

        <div className="input-panels-main">
          {/* Left Input Panel */}
          <div className="input-panel-main">
            <div className="panel-toolbar">
              <span className="line-count-badge">{leftLineCount} lines</span>
              <div className="toolbar-actions">
                <button 
                  className="toolbar-btn" 
                  onClick={() => handleCopy(leftText)} 
                  title="Copy to clipboard"
                  disabled={!leftText}
                >
                  <FaCopy />
                </button>
                <label className="toolbar-btn upload" title="Upload file">
                  <FaUpload />
                  <input
                    type="file"
                    accept=".txt,.js,.jsx,.json,.css,.html,.md,.py,.java"
                    onChange={(e) => handleFileUpload(e, 'left')}
                    disabled={isComparing}
                  />
                </label>
                {leftText && (
                  <button 
                    className="toolbar-btn" 
                    onClick={() => handleDownload(leftText, 'original.txt')} 
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                )}
              </div>
            </div>
            <textarea
              ref={leftTextareaRef}
              value={leftText}
              onChange={handleLeftChange}
              placeholder="Paste your original text here..."
              className="main-textarea"
              spellCheck={false}
              disabled={isComparing}
            />
          </div>

          {/* Right Input Panel */}
          <div className="input-panel-main">
            <div className="panel-toolbar">
              <span className="line-count-badge">{rightLineCount} lines</span>
              <div className="toolbar-actions">
                <button 
                  className="toolbar-btn" 
                  onClick={() => handleCopy(rightText)} 
                  title="Copy to clipboard"
                  disabled={!rightText}
                >
                  <FaCopy />
                </button>
                <label className="toolbar-btn upload" title="Upload file">
                  <FaUpload />
                  <input
                    type="file"
                    accept=".txt,.js,.jsx,.json,.css,.html,.md,.py,.java"
                    onChange={(e) => handleFileUpload(e, 'right')}
                    disabled={isComparing}
                  />
                </label>
                {rightText && (
                  <button 
                    className="toolbar-btn" 
                    onClick={() => handleDownload(rightText, 'changed.txt')} 
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                )}
              </div>
            </div>
            <textarea
              ref={rightTextareaRef}
              value={rightText}
              onChange={handleRightChange}
              placeholder="Paste your changed text here..."
              className="main-textarea"
              spellCheck={false}
              disabled={isComparing}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-container">
          <button 
            className="btn-find-difference"
            onClick={handleFindDifference}
            disabled={!leftText && !rightText}
          >
            <FaSearch /> Find Difference
          </button>
          
          {(leftText || rightText) && (
            <button 
              className="btn-clear"
              onClick={handleClear}
              disabled={isComparing}
            >
              <FaEraser /> Clear
            </button>
          )}
        </div>

        {/* Options */}
        <div className="options-container">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              disabled={isComparing}
            />
            <span>Ignore whitespace differences</span>
          </label>
        </div>
      </div>

      {/* Step 2: Diff View - Shown after clicking "Find Difference" */}
      {showDiff && (
        <div className="diff-section" ref={diffContainerRef}>
          {/* Diff Header */}
          <div className="diff-header-section">
            <div className="diff-stats">
              <span className="stat-badge removals">
                − {deletions} removals
              </span>
              <span className="stat-badge additions">
                + {additions} additions
              </span>
            </div>
            <div className="diff-actions">
              <button 
                className="btn-icon" 
                onClick={handleSwap}
                title="Swap texts"
                disabled={isComparing}
              >
                <FaExchangeAlt /> Swap
              </button>
              <button 
                className="btn-icon" 
                onClick={() => {
                  setShowDiff(false);
                  setDiffResult([]);
                }}
                title="Hide diff view"
              >
                Hide Diff
              </button>
            </div>
          </div>

          {/* Diff View Panels */}
          <div className="diff-view-panels">
            {/* Left Diff Panel */}
            <div className="diff-panel-view">
              <div className="diff-panel-header">
                <span className="panel-label">Original</span>
                <span className="panel-line-count">{leftLineCount} lines</span>
              </div>
              <div className="diff-panel-content">
                {renderLeftPanel()}
              </div>
            </div>

            {/* Right Diff Panel */}
            <div className="diff-panel-view">
              <div className="diff-panel-header">
                <span className="panel-label">Changed</span>
                <span className="panel-line-count">{rightLineCount} lines</span>
              </div>
              <div className="diff-panel-content">
                {renderRightPanel()}
              </div>
            </div>
          </div>

          {/* Edit Again Button */}
          <div className="edit-again-container">
            <button 
              className="btn-edit-again"
              onClick={() => {
                setShowDiff(false);
                // Keep the text, just hide the diff view
                setTimeout(() => {
                  if (leftTextareaRef.current) {
                    leftTextareaRef.current.focus();
                  }
                }, 100);
              }}
            >
              <FaFileAlt /> Edit Text Again
            </button>
          </div>

          {/* Legend */}
          <div className="diff-legend">
            <div className="legend-item">
              <div className="legend-box removed"></div>
              <span>Removed lines</span>
            </div>
            <div className="legend-item">
              <div className="legend-box added"></div>
              <span>Added lines</span>
            </div>
            <div className="legend-item">
              <div className="legend-box unchanged"></div>
              <span>Unchanged lines</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffChecker;