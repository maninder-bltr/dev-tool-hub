import React, { useMemo, useState } from "react";
import { computeDelta, countDiffs } from "./diffHelpers";
import "./diff.css";

const DiffView = ({ left, right, children }) => {
  const delta = useMemo(() => computeDelta(left, right), [left, right]);
  const summary = useMemo(() => delta ? countDiffs(delta) : { added: 0, removed: 0, modified: 0, total: 0 }, [delta]);

  if (!left || !right) {
    return (
      <div className="diff-view empty">
        <div className="empty-message">
          Both panels need data for comparison
        </div>
      </div>
    );
  }

  return (
    <div className="diff-view">
      <div className="diff-header">
        <div className="diff-summary">
          {summary.total > 0 ? (
            <>
              <span className="diff-count modified">{summary.modified} modified</span>
              <span className="diff-count added">{summary.added} added</span>
              <span className="diff-count removed">{summary.removed} removed</span>
              <span className="diff-total">{summary.total} total</span>
            </>
          ) : (
            <span className="diff-count no-diff">No differences</span>
          )}
        </div>
      </div>

      {/* Children will be the two panels with DiffTree components */}
      <div className="diff-panels">
        {children}
      </div>

      {summary.total > 0 && (
        <div className="diff-legend">
          <span className="legend-item added">
            <span className="dot"></span> Added
          </span>
          <span className="legend-item removed">
            <span className="dot"></span> Removed
          </span>
          <span className="legend-item modified">
            <span className="dot"></span> Modified
          </span>
        </div>
      )}
    </div>
  );
};

export default DiffView;