import React from 'react';
import { FaKeyboard } from 'react-icons/fa';

const KeyboardShortcuts = () => {
  return (
    <details className="shortcuts-panel">
      <summary>
        <FaKeyboard /> Keyboard Shortcuts
      </summary>
      <div className="shortcuts-grid">
        <kbd>Ctrl+F</kbd> <span>Find</span>
        <kbd>Ctrl+H</kbd> <span>Replace</span>
        <kbd>Ctrl+Shift+F</kbd> <span>Format JSON</span>
        <kbd>Ctrl+Shift+M</kbd> <span>Minify JSON</span>
        <kbd>Ctrl+S</kbd> <span>Download</span>
        <kbd>Ctrl+O</kbd> <span>Upload</span>
        <kbd>Ctrl+Shift+C</kbd> <span>Copy</span>
        <kbd>Ctrl+Shift+D</kbd> <span>Toggle Theme</span>
        <kbd>Ctrl+Shift+T</kbd> <span>Toggle Tree/Code</span>
        <kbd>Ctrl+Shift+X</kbd> <span>Diff Mode</span>
        <kbd>Ctrl+Shift+V</kbd> <span>CSV Converter</span>
      </div>
    </details>
  );
};

export default KeyboardShortcuts;