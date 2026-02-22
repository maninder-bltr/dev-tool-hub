import React, { useState } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const TreeNode = ({ data, keyName = '', level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getType = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const renderValue = (value, type) => {
    switch (type) {
      case 'string':
        return <span className="string">"{value}"</span>;
      case 'number':
        return <span className="number">{value}</span>;
      case 'boolean':
        return <span className="boolean">{value.toString()}</span>;
      case 'null':
        return <span className="null">null</span>;
      default:
        return null;
    }
  };

  const type = getType(data);

  if (type === 'array' || type === 'object') {
    const isArray = Array.isArray(data);
    const keys = isArray ? data.map((_, i) => i) : Object.keys(data);
    const isEmpty = keys.length === 0;

    return (
      <div style={{ marginLeft: level * 20 }}>
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          {keyName && <span className="key">{keyName}:</span>}
          <span>
            {isArray ? '[' : '{'}
            <span className={isArray ? 'array-count' : 'object-count'}>
              {keys.length} {isArray ? 'items' : 'properties'}
            </span>
            {isArray ? ']' : '}'}
          </span>
        </div>
        {isExpanded && !isEmpty && (
          <div>
            {keys.map((key) => (
              <TreeNode
                key={key}
                data={data[key]}
                keyName={isArray ? `${key}` : key}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginLeft: level * 20 }}>
      <span className="key">{keyName}:</span> {renderValue(data, type)}
    </div>
  );
};

const JsonTreeView = ({ data }) => {
  return (
    <div className="tree-view">
      <TreeNode data={data} level={0} />
    </div>
  );
};

export default JsonTreeView;