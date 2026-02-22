import React, { useState, useEffect } from "react";
import DiffNode from "./DiffNode";
import { hasChanges } from "./diffHelpers";

const DiffTree = ({ data, delta, side }) => {
  const [expanded, setExpanded] = useState(() => new Set(['']));

  // Auto-expand nodes with changes
  useEffect(() => {
    if (!delta) return;

    const newExpanded = new Set(['']);
    
    const traverse = (node, path = []) => {
      if (!node || typeof node !== 'object') return;
      
      if (hasChanges(node)) {
        newExpanded.add(path.join('.'));
      }
      
      if (Array.isArray(node)) {
        node.forEach((item, i) => traverse(item, [...path, i.toString()]));
      } else if (typeof node === 'object') {
        Object.entries(node).forEach(([key, val]) => {
          if (!key.startsWith('_')) {
            traverse(val, [...path, key]);
          }
        });
      }
    };
    
    traverse(delta);
    setExpanded(newExpanded);
  }, [delta]);

  const handleToggle = (pathKey) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(pathKey)) {
        next.delete(pathKey);
      } else {
        next.add(pathKey);
      }
      return next;
    });
  };

  if (!data) {
    return <div className="empty-message">No data</div>;
  }

  return (
    <div className="diff-tree">
      <DiffNode
        data={data}
        delta={delta}
        path={[]}
        side={side}
        expanded={expanded}
        onToggle={handleToggle}
        level={0}
      />
    </div>
  );
};

export default DiffTree;