export { default as DiffView } from './DiffView';
export { default as DiffTree } from './DiffTree';
export { default as DiffNode } from './DiffNode';
export { default as UnifiedDiff } from './UnifiedDiff';
export { 
  computeDelta, 
  countDiffs, 
  detectChangeType, 
  getChangeType,
  hasChanges,
  diffpatcher 
} from './diffHelpers';