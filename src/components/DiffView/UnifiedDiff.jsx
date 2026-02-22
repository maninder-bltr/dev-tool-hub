import React, { memo } from 'react';
import { detectChangeType, getChangeTypeAtPath } from './diffHelpers';

const UnifiedDiff = memo(({ left, right, delta }) => {
  if (!delta) {
    return <div className="empty-message">No differences found</div>;
  }

  const getValueAtPath = (data, path) => {
    if (!data || path === 'root') return data;
    const parts = path.split('.').slice(1);
    return parts.reduce((curr, part) => curr?.[part], data);
  };

  const renderUnifiedLine = (path, changeType, leftVal, rightVal) => {
    const key = path.split('.').pop() || 'root';
    
    switch (changeType) {
      case 'added':
        return (
          <div key={path} className="diff-line added">
            <span className="line-number">+</span>
            <span className="key">{key}:</span>
            <span className="new-value">{JSON.stringify(rightVal, null, 2)}</span>
            <span className="change-label">added</span>
          </div>
        );
        
      case 'removed':
        return (
          <div key={path} className="diff-line removed">
            <span className="line-number">-</span>
            <span className="key">{key}:</span>
            <span className="old-value">{JSON.stringify(leftVal, null, 2)}</span>
            <span className="change-label">removed</span>
          </div>
        );
        
      case 'modified':
        return (
          <div key={path} className="diff-line modified">
            <span className="line-number">~</span>
            <span className="key">{key}:</span>
            <span className="old-value">{JSON.stringify(leftVal, null, 2)}</span>
            <span className="arrow">→</span>
            <span className="new-value">{JSON.stringify(rightVal, null, 2)}</span>
          </div>
        );
        
      default:
        return null;
    }
  };

  const buildLines = () => {
    const lines = [];
    const processedPaths = new Set();
    
    const traverse = (node, path = 'root') => {
      if (!node || typeof node !== 'object') return;
      
      // Get change type using detectChangeType
      const type = detectChangeType(node);
      
      if (type && !processedPaths.has(path)) {
        processedPaths.add(path);
        const leftVal = getValueAtPath(left, path);
        const rightVal = getValueAtPath(right, path);
        
        // Don't show primitive values that are part of larger objects
        const shouldShow = path.split('.').length <= 3 || type !== 'modified';
        
        if (shouldShow) {
          lines.push(renderUnifiedLine(path, type, leftVal, rightVal));
        }
      }
      
      if (Array.isArray(node)) {
        node.forEach((item, index) => {
          traverse(item, `${path}.${index}`);
        });
      } else if (typeof node === 'object') {
        Object.entries(node).forEach(([key, val]) => {
          if (!key.startsWith('_')) {
            traverse(val, `${path}.${key}`);
          }
        });
      }
    };
    
    traverse(delta);
    
    // Sort lines by path for consistent display
    return lines.sort((a, b) => {
      const pathA = a.key || '';
      const pathB = b.key || '';
      return pathA.localeCompare(pathB);
    });
  };

  const lines = buildLines();

  return (
    <div className="unified-diff">
      {lines.length > 0 ? (
        <div className="unified-lines">
          {lines}
        </div>
      ) : (
        <div className="empty-message">No differences found</div>
      )}
    </div>
  );
});

UnifiedDiff.displayName = 'UnifiedDiff';
export default UnifiedDiff;