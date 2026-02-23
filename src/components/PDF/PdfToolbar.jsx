import React from 'react';
import { 
    FaLayerGroup, FaCut, FaTrash, FaDownload, FaPlus, FaRedoAlt, 
    FaWater, FaListOl, FaImage, FaPen, FaExclamationCircle, FaFilePdf
  } from 'react-icons/fa';
  
const modes = [
  { 
    id: 'merge', 
    label: 'Merge', 
    icon: FaLayerGroup,  // ✅ Fixed: was FaMerge
    description: 'Combine multiple PDFs into one'
  },
  { 
    id: 'split', 
    label: 'Split', 
    icon: FaCut,  // ✅ Fixed: was FaScissors
    description: 'Extract specific pages'
  },
  { 
    id: 'remove', 
    label: 'Remove Pages', 
    icon: FaTrash,  // ✅ Fixed: was FaTrashAlt
    description: 'Delete unwanted pages'
  },
  { 
    id: 'rotate', 
    label: 'Rotate', 
    icon: FaRedoAlt,  // ✅ Fixed: was FaRedoAlt
    description: 'Rotate pages 90°, 180°, 270°'
  },
  { 
    id: 'watermark', 
    label: 'Watermark', 
    icon: FaWater,
    description: 'Add text or image watermark'
  },
  { 
    id: 'pagenum', 
    label: 'Page Numbers', 
    icon: FaListOl,  // ✅ Fixed: was FaHashtag
    description: 'Add page numbers'
  },
  { 
    id: 'image2pdf', 
    label: 'Image → PDF', 
    icon: FaImage,  // ✅ Fixed: was FaFileImage
    description: 'Convert images to PDF'
  },
  { 
    id: 'pdftoimage', 
    label: 'PDF → Image', 
    icon: FaFilePdf,
    description: 'Convert PDF pages to images',
    comingSoon: true
  },
  { 
    id: 'sign', 
    label: 'Sign', 
    icon: FaPen,
    description: 'Add signature to PDF'
  },
];

const PdfToolbar = ({ activeMode, setActiveMode, onClear, onDownload, canDownload }) => {
  return (
    <div className="pdf-toolbar">
      <div className="mode-selector">
        {modes.map(mode => {
          const Icon = mode.icon;
          const isComingSoon = mode.comingSoon;
          
          return (
            <button
              key={mode.id}
              className={`mode-btn ${activeMode === mode.id ? 'active' : ''} ${isComingSoon ? 'coming-soon' : ''}`}
              onClick={() => !isComingSoon && setActiveMode(mode.id)}
              title={mode.description + (isComingSoon ? ' (Coming Soon)' : '')}
              disabled={isComingSoon}
            >
              <Icon /> <span>{mode.label}</span>
              {isComingSoon && <span className="coming-soon-badge">Soon</span>}
            </button>
          );
        })}
      </div>
      <div className="global-actions">
        <button className="global-btn" onClick={onClear} title="Clear all files">
          <FaTrash /> Clear
        </button>
        <button
          className="global-btn"
          onClick={onDownload}
          disabled={!canDownload}
          title="Download result"
        >
          <FaDownload /> Download
        </button>
      </div>
    </div>
  );
};

export default PdfToolbar;