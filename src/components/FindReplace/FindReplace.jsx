import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaRegCopy } from 'react-icons/fa';
import ace from 'ace-builds/src-noconflict/ace';

const FindReplace = ({ editor, onClose, panel = 'left' }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regex, setRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [showReplace, setShowReplace] = useState(false);
  
  const findInputRef = useRef(null);
  const markersRef = useRef([]);
  const RangeRef = useRef(null);

  // Initialize Ace Range
  useEffect(() => {
    if (!RangeRef.current && ace) {
      RangeRef.current = ace.require('ace/range').Range;
    }
  }, []);

  // Focus find input when opened
  useEffect(() => {
    if (findInputRef.current) {
      findInputRef.current.focus();
    }
  }, []);

  // Clear markers on unmount
  useEffect(() => {
    return () => {
      clearAllHighlights();
    };
  }, []);

  const clearAllHighlights = () => {
    if (!editor) return;
    
    markersRef.current.forEach(markerId => {
      try {
        editor.session.removeMarker(markerId);
      } catch (e) {
        console.error('Error removing marker:', e);
      }
    });
    markersRef.current = [];
    editor.clearSelection();
  };

  const findAllMatches = () => {
    if (!editor || !findText) return [];

    const session = editor.session;
    const lines = session.getLength();
    const matches = [];
    
    let searchRegex;
    try {
      let flags = 'g';
      if (!caseSensitive) flags += 'i';
      
      let pattern = regex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (wholeWord) {
        pattern = '\\b' + pattern + '\\b';
      }
      
      searchRegex = new RegExp(pattern, flags);
    } catch (e) {
      console.error('Invalid regex:', e);
      return [];
    }

    for (let i = 0; i < lines; i++) {
      const line = session.getLine(i);
      let match;
      
      searchRegex.lastIndex = 0;
      
      while ((match = searchRegex.exec(line)) !== null) {
        matches.push({
          row: i,
          start: match.index,
          end: match.index + match[0].length
        });
        
        if (match[0].length === 0) break;
      }
    }

    return matches;
  };

  const highlightMatches = () => {
    if (!editor) return;

    clearAllHighlights();

    if (!findText) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const matches = findAllMatches();
    setMatchCount(matches.length);

    if (matches.length === 0) {
      setCurrentMatch(0);
      return;
    }

    if (!RangeRef.current) {
      RangeRef.current = ace.require('ace/range').Range;
    }
    
    const Range = RangeRef.current;
    
    matches.forEach((match, index) => {
      const range = new Range(
        match.row, match.start,
        match.row, match.end
      );
      
      try {
        const markerId = editor.session.addMarker(
          range,
          index === currentMatch ? 'search-match current-match' : 'search-match',
          'text',
          false
        );
        markersRef.current.push(markerId);
      } catch (e) {
        console.error('Error adding marker:', e);
      }
    });

    if (matches[currentMatch]) {
      const match = matches[currentMatch];
      editor.gotoLine(match.row + 1, match.start);
      editor.selection.setSelectionRange({
        start: { row: match.row, column: match.start },
        end: { row: match.row, column: match.end }
      });
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      highlightMatches();
    }, 300);

    return () => clearTimeout(timer);
  }, [findText, caseSensitive, regex, wholeWord, editor]);

  // Update highlights when currentMatch changes
  useEffect(() => {
    if (matchCount > 0) {
      highlightMatches();
    }
  }, [currentMatch]);

  const handleFindNext = () => {
    if (!editor || !findText || matchCount === 0) return;
    setCurrentMatch((currentMatch + 1) % matchCount);
  };

  const handleFindPrev = () => {
    if (!editor || !findText || matchCount === 0) return;
    setCurrentMatch((currentMatch - 1 + matchCount) % matchCount);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handleFindPrev();
      } else {
        handleFindNext();
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    clearAllHighlights();
    onClose();
  };

  // Position panel based on left/right
  const panelStyle = {
    [panel === 'left' ? 'right' : 'left']: 'auto',
    [panel]: panel === 'left' ? '20px' : 'auto',
    [panel === 'left' ? 'left' : 'right']: panel === 'left' ? 'auto' : '20px'
  };

  return (
    <div className="find-replace-overlay" style={panelStyle}>
      <div className="find-replace-panel">
        <div className="find-replace-header">
          <div className="find-replace-title">
            <FaSearch /> Find & Replace
          </div>
          <button className="close-button" onClick={handleClose} title="Close (Esc)">
            <FaTimes />
          </button>
        </div>

        <div className="find-replace-content">
          <div className="input-group">
            <input
              ref={findInputRef}
              type="text"
              placeholder="Find..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="find-input"
            />
            {matchCount > 0 && (
              <span className="match-count">
                {currentMatch + 1}/{matchCount}
              </span>
            )}
          </div>

          {showReplace && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="replace-input"
              />
            </div>
          )}

          <div className="search-options">
            <label className="option-label" title="Match exact case">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
              <span>Aa</span>
            </label>
            <label className="option-label" title="Use regular expression">
              <input
                type="checkbox"
                checked={regex}
                onChange={(e) => setRegex(e.target.checked)}
              />
              <span>.*</span>
            </label>
            <label className="option-label" title="Match whole word only">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
              />
              <span>word</span>
            </label>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleFindPrev}
              disabled={!findText || matchCount === 0}
              className="action-button"
              title="Previous match (Shift+Enter)"
            >
              <FaChevronUp /> Prev
            </button>
            <button
              onClick={handleFindNext}
              disabled={!findText || matchCount === 0}
              className="action-button"
              title="Next match (Enter)"
            >
              <FaChevronDown /> Next
            </button>
            <button
              onClick={() => setShowReplace(!showReplace)}
              className={`action-button ${showReplace ? 'active' : ''}`}
              title="Toggle replace mode"
            >
              <FaRegCopy /> Replace
            </button>
          </div>

          <div className="shortcut-hint">
            <kbd>Enter</kbd> next · <kbd>Shift+Enter</kbd> prev · <kbd>Esc</kbd> close
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindReplace;