import * as jsondiffpatch from 'jsondiffpatch';

export const diffpatcher = jsondiffpatch.create({
  objectHash: function(obj, index) {
    if (typeof obj._id !== 'undefined') return obj._id;
    if (typeof obj.id !== 'undefined') return obj.id;
    if (typeof obj.name !== 'undefined') return obj.name;
    return '$$index:' + index;
  },
  arrays: {
    detectMove: true,
    includeValueOnMove: true
  },
  textDiff: {
    minLength: 60
  }
});

export const diffJSON = (left, right) => {
  return diffpatcher.diff(left, right);
};