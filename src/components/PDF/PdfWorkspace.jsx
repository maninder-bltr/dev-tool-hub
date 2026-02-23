// src/components/pdf/PdfWorkspace.jsx
import React from 'react';
import MergeTool from './MergeTool';
import SplitTool from './SplitTool';
import RemovePagesTool from './RemovePagesTool';
import RotateTool from './RotateTool';
import WatermarkTool from './WatermarkTool';
import PageNumbersTool from './PageNumbersTool';
import ImageToPdfTool from './ImageToPdfTool';
import SignTool from './SignTool';
import PdfToImageTool from './PdfToImageTool';

const PdfWorkspace = ({ mode, files, setFiles, onResultReady, setLoading }) => {
  switch (mode) {
    case 'merge':
      return <MergeTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'split':
      return <SplitTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'remove':
      return <RemovePagesTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'rotate':
      return <RotateTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'watermark':
      return <WatermarkTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'pagenum':
      return <PageNumbersTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'image2pdf':
      return <ImageToPdfTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'pdftoimage':
      return <PdfToImageTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    case 'sign':
      return <SignTool files={files} setFiles={setFiles} onResultReady={onResultReady} setLoading={setLoading} />;
    default:
      return null;
  }
};

export default PdfWorkspace;