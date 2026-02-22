import React, { useMemo, useCallback } from "react";
import { detectChangeType, hasChanges } from "./diffHelpers";

const DiffNode = ({
  data,
  delta,
  path = [],
  side,
  expanded,
  onToggle,
  level = 0,
}) => {
  const pathKey = path.join('.');
  const isExpanded = expanded.has(pathKey);

  // Navigate to the delta node at this path
  const deltaNode = useMemo(() => {
    if (!delta) return null;
    let current = delta;
    for (const key of path) {
      if (!current || typeof current !== 'object') return null;
      if (current._t === 'a') {
        current = current[key] || current[`_${key}`];
      } else {
        current = current[key];
      }
      if (!current) return null;
    }
    return current;
  }, [delta, path]);

  const changeType = detectChangeType(deltaNode);
  const hasChildrenChanges = hasChanges(deltaNode);

  const nodeClass = useMemo(() => {
    if (!changeType && !hasChildrenChanges) return '';
    
    if (side === 'left') {
      if (changeType === 'added') return ''; // Added only shows on right
      if (changeType === 'removed') return 'diff-removed';
      return 'diff-modified';
    }
    
    if (side === 'right') {
      if (changeType === 'removed') return ''; // Removed only shows on left
      if (changeType === 'added') return 'diff-added';
      return 'diff-modified';
    }
    
    return '';
  }, [changeType, hasChildrenChanges, side]);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    onToggle(pathKey);
  }, [pathKey, onToggle]);

  // Array rendering
  if (Array.isArray(data)) {
    const itemCount = data.length;
    const keyName = path[path.length - 1];

    return (
      <div className={`diff-node level-${level} ${nodeClass}`}>
        <div className="node-header" onClick={handleToggle}>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="bracket">[</span>
          {keyName && <span className="key">{keyName}</span>}
          <span className="count-badge">{itemCount} items</span>
          <span className="bracket">]</span>
          {changeType && <span className="change-badge">{changeType}</span>}
        </div>

        {isExpanded && itemCount > 0 && (
          <div className="node-children">
            {data.map((item, index) => (
              <div key={index} className="array-item">
                <span className="array-index">{index}:</span>
                <DiffNode
                  data={item}
                  delta={delta}
                  path={[...path, index.toString()]}
                  side={side}
                  expanded={expanded}
                  onToggle={onToggle}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Object rendering
  if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    const keyName = path[path.length - 1] || 'root';

    return (
      <div className={`diff-node level-${level} ${nodeClass}`}>
        <div className="node-header" onClick={handleToggle}>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="bracket">{'{'}</span>
          {keyName !== 'root' && <span className="key">{keyName}</span>}
          <span className="count-badge">{keys.length} props</span>
          <span className="bracket">{'}'}</span>
          {changeType && <span className="change-badge">{changeType}</span>}
        </div>

        {isExpanded && keys.length > 0 && (
          <div className="node-children">
            {keys.sort().map(key => (
              <div key={key} className="object-property">
                <span className="property-key">{key}:</span>
                <DiffNode
                  data={data[key]}
                  delta={delta}
                  path={[...path, key]}
                  side={side}
                  expanded={expanded}
                  onToggle={onToggle}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Primitive value
  return (
    <span className={`primitive-value ${nodeClass}`}>
      {data === null ? 'null' : JSON.stringify(data)}
      {changeType && <span className="change-badge">{changeType}</span>}
    </span>
  );
};

export default React.memo(DiffNode);