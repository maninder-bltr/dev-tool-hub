import React from 'react';

const ErrorPanel = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error-panel">
      <strong>Error:</strong> {error.message}{' '}
      {error.line && (
        <span>
          at line {error.line}, column {error.column}
        </span>
      )}
    </div>
  );
};

export default ErrorPanel;