import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FaUser, FaLinkedin, FaCode, FaColumns, FaLock, FaClock,
  FaPalette, FaFilePdf
} from 'react-icons/fa';
import './ProfileAndToolInfoWidget.css';

const ProfileAndToolInfoWidget = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setHoveredTool(null);
    }, 50);
  };

  const handleToolMouseEnter = (e, tool) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    });
    setHoveredTool(tool);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tools = [
    { 
      name: 'JSON Editor', 
      icon: FaCode, 
      color: '#f39c12',
      description: 'Format, validate, minify, diff, and convert JSON with real-time error detection and tree view.'
    },
    { 
      name: 'Text Diff Checker', 
      icon: FaColumns, 
      color: '#3498db',
      description: 'Side-by-side comparison with Git-style highlighting for clear change tracking.'
    },
    { 
      name: 'Base64 Tool', 
      icon: FaLock, 
      color: '#2ecc71',
      description: 'Instant encode/decode for text and files with live conversion support.'
    },
    { 
      name: 'Epoch Calculator', 
      icon: FaClock, 
      color: '#9b59b6',
      description: 'Convert between Unix timestamps and human-readable dates with timezone support.'
    },
    { 
      name: 'Color Tools', 
      icon: FaPalette, 
      color: '#e74c3c',
      description: 'HEX/RGB/HSL conversion, gradient builder, palette management, and CSS export.'
    },
    { 
      name: 'PDF Tools', 
      icon: FaFilePdf, 
      color: '#e67e22',
      description: 'Merge, split, rotate, watermark, sign, convert (Image ↔ PDF), and manage PDFs directly in the browser.'
    }
  ];

  return (
    <div
      className="profile-widget"
      ref={widgetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Widget Button */}
      <button className="profile-button">
        <FaUser className="profile-icon" />
        <span className="profile-badge">Dev</span>
      </button>

      {/* Hover Card */}
      {isHovered && (
        <>
          <div className="profile-card">
            {/* Card Header */}
            <div className="card-header">
              <div className="header-left">
                <div className="developer-avatar">
                  <FaUser />
                </div>
                <div className="developer-info">
                  <h4>Maninder Singh</h4>
                  <a
                    href="https://www.linkedin.com/in/maninder-singh-uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaLinkedin /> LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="card-content">
              {/* About Section */}
              <div className="about-section">
                <h5 className="section-title">About:</h5>
                <p className="widget-description">
                  <strong>DevTools Hub</strong> is a browser-based toolkit built for developers.
                  All features run entirely on the client side — no uploads, no servers, no tracking.
                </p>
              </div>

              {/* Tools Section */}
              <div className="tools-section">
                <h5 className="section-title">Available Tools:</h5>
                <div className="tools-grid">
                  {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                      <div 
                        key={index} 
                        className="tool-item" 
                        style={{ '--tool-color': tool.color }}
                        onMouseEnter={(e) => handleToolMouseEnter(e, tool)}
                        onMouseLeave={() => setHoveredTool(null)}
                      >
                        <Icon className="tool-icon" />
                        <span className="tool-name">{tool.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Badge */}
              <div className="privacy-features">
                <div className="privacy-badge">
                  <span className="badge-item">🔒 100% Client-side</span>
                  <span className="badge-separator">•</span>
                  <span className="badge-item">🚀 No Data Upload</span>
                  <span className="badge-separator">•</span>
                  <span className="badge-item">⚡ Real-time Processing</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer">
              <span>Version 1.0.0</span>
              <span>© 2026</span>
            </div>
          </div>

          {/* Tooltip Portal - Rendered at document root */}
          {hoveredTool && createPortal(
            <div 
              className="tool-tooltip-portal"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
              }}
            >
              {hoveredTool.description}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
};

export default ProfileAndToolInfoWidget;