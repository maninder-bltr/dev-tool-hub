import React, { lazy, Suspense } from 'react';
import { useTools } from '../Context/ToolsContext'; 

// Lazy load tools for better performance
const Base64Converter = lazy(() => import('../Base64Converter/Base64Converter'));
const EpochCalculator = lazy(() => import('../EpochCalculator/EpochCalculator'));
const DiffChecker = lazy(() => import('../DiffChecker/DiffChecker'));
const ColorTool = lazy(() => import('../ColorTool/ColorTool'));
const PdfTool = lazy(() => import('../PDF/PdfTool'));

// Loading fallback
const LoadingFallback = () => (
  <div className="loading-fallback">
    <div className="spinner"></div>
    <span>Loading tool...</span>
  </div>
);

const ToolsContainer = () => {
  const { activeTool } = useTools();

  const renderTool = () => {
    switch (activeTool) {
      case 'base64':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Base64Converter />
          </Suspense>
        );
      case 'epoch':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <EpochCalculator />
          </Suspense>
        );
      case 'diff':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DiffChecker />
          </Suspense>
        );
      case 'color':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ColorTool />
          </Suspense>
        );
      case 'pdf':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PdfTool />
          </Suspense>
        );  
      default:
        return null;
    }
  };

  return (
    <div className="tools-container">
      {renderTool()}
    </div>
  );
};

export default ToolsContainer;