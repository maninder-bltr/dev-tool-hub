import * as jsondiffpatch from "jsondiffpatch";

export const diffpatcher = jsondiffpatch.create({
  objectHash: function (obj) {
    if (obj?._id) return obj._id;
    if (obj?.id) return obj.id;
    if (obj?.name) return obj.name;
    return JSON.stringify(obj);
  },
  arrays: {
    detectMove: true,
    includeValueOnMove: true,
  },
});

export function computeDelta(left, right) {
  if (!left || !right) return null;
  return diffpatcher.diff(left, right);
}

/**
 * Get change type at a specific path
 */
export function getChangeTypeAtPath(delta, path) {
  if (!delta) return null;
  
  let current = delta;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    
    if (current && current._t === 'a') {
      // Handle array delta
      if (current[key]) {
        current = current[key];
      } else if (current[`_${key}`]) {
        current = current[`_${key}`];
      } else {
        return null;
      }
    } else {
      if (!current || !current[key]) return null;
      current = current[key];
    }
  }

  return detectChangeType(current);
}

/**
 * Detect change type from a delta node
 */
export function detectChangeType(deltaNode) {
  if (!deltaNode) return null;

  // Array delta
  if (deltaNode._t === 'a') return 'modified';

  // Value change array
  if (Array.isArray(deltaNode)) {
    if (deltaNode.length === 1) return 'added';
    if (deltaNode.length === 2) return 'modified';
    if (deltaNode.length === 3 && deltaNode[1] === 0 && deltaNode[2] === 0) {
      return 'removed';
    }
    if (deltaNode.length === 3) return 'modified';
  }

  // Object with nested changes
  if (typeof deltaNode === 'object') {
    const keys = Object.keys(deltaNode);
    
    // Check for added/removed markers
    if (keys.includes('_added')) return 'added';
    if (keys.includes('_removed')) return 'removed';
    
    // Check for any nested changes
    for (const key of keys) {
      if (key.startsWith('_')) continue;
      if (deltaNode[key] && typeof deltaNode[key] === 'object') {
        if (detectChangeType(deltaNode[key])) {
          return 'modified';
        }
      }
    }
  }

  return null;
}

// Alias for backward compatibility
export const getChangeType = detectChangeType;

/**
 * Check if a node has any changes
 */
export function hasChanges(deltaNode) {
  if (!deltaNode) return false;
  
  // Direct change
  if (detectChangeType(deltaNode)) return true;
  
  // Check children
  if (typeof deltaNode === 'object') {
    return Object.values(deltaNode).some(value => 
      value && typeof value === 'object' && hasChanges(value)
    );
  }
  
  return false;
}

/**
 * Count total diffs
 */
export function countDiffs(delta) {
  const counts = { added: 0, removed: 0, modified: 0, total: 0 };

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    const type = detectChangeType(node);
    if (type) counts[type]++;

    if (Array.isArray(node)) {
      node.forEach(item => walk(item));
    } else {
      Object.values(node).forEach(value => walk(value));
    }
  }

  walk(delta);
  counts.total = counts.added + counts.removed + counts.modified;
  return counts;
}

// Export everything
export default {
  diffpatcher,
  computeDelta,
  getChangeTypeAtPath,
  detectChangeType,
  getChangeType,
  hasChanges,
  countDiffs
};