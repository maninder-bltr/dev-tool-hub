import React, { createContext, useContext, useState } from 'react';

const ToolsContext = createContext();

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useTools must be used within ToolsProvider');
  }
  return context;
};

export const ToolsProvider = ({ children }) => {
  const [activeTool, setActiveTool] = useState('json'); // 'json', 'diff', 'base64', 'epoch', 'color'
  const [toolHistory, setToolHistory] = useState(['json']);

  const switchTool = (toolId) => {
    setActiveTool(toolId);
    setToolHistory(prev => [toolId, ...prev.slice(0, 4)]);
  };

  return (
    <ToolsContext.Provider value={{
      activeTool,
      switchTool,
      toolHistory
    }}>
      {children}
    </ToolsContext.Provider>
  );
};