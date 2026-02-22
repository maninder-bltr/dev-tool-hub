// src/components/ColorTool/ColorTool.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FaCopy, FaSave, FaTrash, FaPalette, FaSun,
  FaMoon, FaGripVertical, FaPlus, FaAngleRight,
  FaDownload, FaCode, FaCheckCircle, FaExclamationCircle,
  FaEdit, FaTimes, FaDrag, FaSlidersH
} from 'react-icons/fa';
import tinycolor from 'tinycolor2';
import './ColorTool.css';

const ColorTool = () => {
  // ========== STATE ==========
  const [activeTab, setActiveTab] = useState('picker');
  const [currentColor, setCurrentColor] = useState('#ccff99');
  const [colorInput, setColorInput] = useState('#ccff99');
  const [inputError, setInputError] = useState('');
  const [copySuccess, setCopySuccess] = useState({});
  const [showAlpha, setShowAlpha] = useState(false);
  const [alpha, setAlpha] = useState(100);
  
  // Visual picker state
  const [hue, setHue] = useState(90);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(80);
  
  // Gradient state
  const [gradientAngle, setGradientAngle] = useState(90);
  const [gradientStops, setGradientStops] = useState([
    { id: 'stop1', color: '#ff0000', position: 0 },
    { id: 'stop2', color: '#0000ff', position: 100 }
  ]);
  const [draggingStop, setDraggingStop] = useState(null);
  
  // Palette state
  const [palettes, setPalettes] = useState(() => {
    const saved = localStorage.getItem('color-palettes');
    return saved ? JSON.parse(saved) : [
      { id: 'default1', name: 'Primary', color: '#3498db' },
      { id: 'default2', name: 'Secondary', color: '#2ecc71' },
      { id: 'default3', name: 'Accent', color: '#e74c3c' },
      { id: 'default4', name: 'Warning', color: '#f39c12' },
    ];
  });
  const [paletteName, setPaletteName] = useState('');
  const [showPaletteInput, setShowPaletteInput] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  // Tints and shades
  const [tintsShades, setTintsShades] = useState([]);

  // Refs for visual picker
  const saturationRef = useRef(null);
  const hueSliderRef = useRef(null);

  // ========== COLOR CONVERSION ==========
  const colorObj = useMemo(() => {
    try {
      return tinycolor(currentColor);
    } catch {
      return tinycolor('#000000');
    }
  }, [currentColor]);

  const hex = useMemo(() => {
    if (showAlpha && alpha < 100) {
      return colorObj.setAlpha(alpha / 100).toHex8String().toUpperCase();
    }
    return colorObj.toHexString().toUpperCase();
  }, [colorObj, showAlpha, alpha]);

  const rgb = useMemo(() => {
    const { r, g, b } = colorObj.toRgb();
    if (showAlpha && alpha < 100) {
      return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }, [colorObj, showAlpha, alpha]);

  const hsl = useMemo(() => {
    const { h, s, l } = colorObj.toHsl();
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }, [colorObj]);

  // Generate tints and shades (0-100% scale) using lighten/darken
  useEffect(() => {
    const shades = [];
    const baseColor = tinycolor(currentColor);
    const baseLightness = baseColor.toHsl().l * 100;
    
    for (let i = 100; i >= 0; i -= 5) {
      let shade;
      if (i === 100) {
        shade = '#ffffff';
      } else if (i === 0) {
        shade = '#000000';
      } else {
        // Calculate how much to lighten or darken
        const targetLightness = i;
        const diff = targetLightness - baseLightness;
        
        if (diff > 0) {
          // Lighten
          shade = baseColor.lighten(diff).toHexString();
        } else {
          // Darken
          shade = baseColor.darken(Math.abs(diff)).toHexString();
        }
      }
      shades.push({ percentage: i, color: shade });
    }
    setTintsShades(shades);
  }, [currentColor]);

  // Update visual picker when color changes
  useEffect(() => {
    const hsl = colorObj.toHsl();
    setHue(hsl.h);
    setSaturation(hsl.s * 100);
    setLightness(hsl.l * 100);
  }, [currentColor, colorObj]);

  // ========== HANDLERS ==========
  const handleColorChange = (e) => {
    const value = e.target.value;
    setColorInput(value);
    
    try {
      const color = tinycolor(value);
      if (color.isValid()) {
        setCurrentColor(color.toHexString());
        setInputError('');
      } else {
        setInputError('Invalid color format');
      }
    } catch {
      setInputError('Invalid color format');
    }
  };

  const handleRgbChange = (channel, value) => {
    const num = parseInt(value) || 0;
    const clamped = Math.min(255, Math.max(0, num));
    const { r, g, b } = colorObj.toRgb();
    const newRgb = { r, g, b, [channel]: clamped };
    const newColor = tinycolor(newRgb);
    setCurrentColor(newColor.toHexString());
    setColorInput(newColor.toHexString());
  };

  const handleHslChange = (channel, value) => {
    const num = parseInt(value) || 0;
    const { h, s, l } = colorObj.toHsl();
    let newHsl = { h, s, l };
    
    if (channel === 'h') newHsl.h = Math.min(360, Math.max(0, num));
    if (channel === 's') newHsl.s = Math.min(100, Math.max(0, num)) / 100;
    if (channel === 'l') newHsl.l = Math.min(100, Math.max(0, num)) / 100;
    
    const newColor = tinycolor(newHsl);
    setCurrentColor(newColor.toHexString());
    setColorInput(newColor.toHexString());
  };

  // Visual picker handlers
  const handleSaturationChange = (e) => {
    const newSat = parseInt(e.target.value);
    setSaturation(newSat);
    const newColor = tinycolor({ h: hue, s: newSat, l: lightness });
    setCurrentColor(newColor.toHexString());
    setColorInput(newColor.toHexString());
  };

  const handleHueChange = (e) => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    const newColor = tinycolor({ h: newHue, s: saturation / 100, l: lightness / 100 });
    setCurrentColor(newColor.toHexString());
    setColorInput(newColor.toHexString());
  };

  const handleLightnessChange = (e) => {
    const newLight = parseInt(e.target.value);
    setLightness(newLight);
    const newColor = tinycolor({ h: hue, s: saturation / 100, l: newLight / 100 });
    setCurrentColor(newColor.toHexString());
    setColorInput(newColor.toHexString());
  };

  // ========== GRADIENT HANDLERS ==========
  const handleAddStop = () => {
    if (gradientStops.length >= 10) return;
    
    let newPos = 50;
    if (gradientStops.length > 1) {
      const positions = gradientStops.map(s => s.position).sort((a, b) => a - b);
      for (let i = 0; i < positions.length - 1; i++) {
        if (positions[i + 1] - positions[i] > 10) {
          newPos = Math.round((positions[i] + positions[i + 1]) / 2);
          break;
        }
      }
    }
    
    setGradientStops([
      ...gradientStops,
      {
        id: `stop${Date.now()}`,
        color: currentColor,
        position: newPos
      }
    ]);
  };

  const handleRemoveStop = (id) => {
    if (gradientStops.length <= 2) return;
    setGradientStops(gradientStops.filter(stop => stop.id !== id));
  };

  const handleStopColorChange = (id, color) => {
    setGradientStops(gradientStops.map(stop => 
      stop.id === id ? { ...stop, color } : stop
    ));
  };

  const handleStopPositionChange = (id, position) => {
    const clamped = Math.min(100, Math.max(0, position));
    setGradientStops(gradientStops.map(stop => 
      stop.id === id ? { ...stop, position: clamped } : stop
    ));
  };

  const handleStopDrag = (id, clientX, containerRect) => {
    const percentage = ((clientX - containerRect.left) / containerRect.width) * 100;
    const clamped = Math.min(100, Math.max(0, percentage));
    handleStopPositionChange(id, Math.round(clamped));
  };

  const gradientCss = useMemo(() => {
    const sortedStops = [...gradientStops].sort((a, b) => a.position - b.position);
    const stops = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    return `linear-gradient(${gradientAngle}deg, ${stops})`;
  }, [gradientStops, gradientAngle]);

  // ========== PALETTE HANDLERS ==========
  const saveToPalette = () => {
    if (showPaletteInput && paletteName.trim()) {
      const newPalette = {
        id: `palette-${Date.now()}`,
        name: paletteName,
        color: currentColor
      };
      const updated = [...palettes, newPalette];
      setPalettes(updated);
      localStorage.setItem('color-palettes', JSON.stringify(updated));
      setPaletteName('');
      setShowPaletteInput(false);
    } else {
      setShowPaletteInput(true);
    }
  };

  const deleteFromPalette = (id) => {
    const updated = palettes.filter(p => p.id !== id);
    setPalettes(updated);
    localStorage.setItem('color-palettes', JSON.stringify(updated));
  };

  const loadFromPalette = (color) => {
    setCurrentColor(color);
    setColorInput(color);
    setActiveTab('picker');
  };

  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDragEnter = (index) => {
    setDragOverItem(index);
  };

  const handleDragEnd = () => {
    if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
      const newPalettes = [...palettes];
      const draggedItemContent = newPalettes[draggedItem];
      newPalettes.splice(draggedItem, 1);
      newPalettes.splice(dragOverItem, 0, draggedItemContent);
      setPalettes(newPalettes);
      localStorage.setItem('color-palettes', JSON.stringify(newPalettes));
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // ========== EXPORT HANDLERS ==========
  const exportFormats = useMemo(() => {
    const color = currentColor;
    return {
      css: `--primary: ${color};`,
      scss: `$primary: ${color};`,
      json: JSON.stringify({ primary: color }, null, 2),
      tailwind: `'primary': '${color}'`,
      gradient: gradientCss
    };
  }, [currentColor, gradientCss]);

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess({ ...copySuccess, [field]: true });
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    localStorage.setItem('color-palettes', JSON.stringify(palettes));
  }, [palettes]);

  // ========== RENDER HELPERS ==========
  const renderVisualPicker = () => (
    <div className="visual-picker-container">
      {/* Saturation/Lightness Square */}
      <div 
        className="saturation-square"
        ref={saturationRef}
        style={{
          background: `hsl(${hue}, 100%, 50%)`
        }}
      >
        <div className="saturation-overlay" />
        <div 
          className="saturation-handle"
          style={{
            left: `${saturation}%`,
            top: `${100 - lightness}%`,
            backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`
          }}
        />
      </div>

      {/* Hue Slider */}
      <div className="hue-slider-container">
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={handleHueChange}
          className="hue-slider"
          style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
          }}
        />
      </div>

      {/* Lightness Slider */}
      <div className="lightness-slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={lightness}
          onChange={handleLightnessChange}
          className="lightness-slider"
          style={{
            background: `linear-gradient(to right, #000000, hsl(${hue}, ${saturation}%, 50%), #ffffff)`
          }}
        />
      </div>

      {/* Alpha Slider (Optional) */}
      {showAlpha && (
        <div className="alpha-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={alpha}
            onChange={(e) => setAlpha(parseInt(e.target.value))}
            className="alpha-slider"
            style={{
              background: `linear-gradient(to right, transparent, ${currentColor})`
            }}
          />
          <span className="alpha-value">{alpha}%</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="color-tool">
      {/* Header */}
      <div className="color-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <FaPalette className="header-icon" />
          </div>
          <h2>Color Tool</h2>
        </div>
        <div className="header-tabs">
          <button 
            className={`tab-btn ${activeTab === 'picker' ? 'active' : ''}`}
            onClick={() => setActiveTab('picker')}
          >
            Picker
          </button>
          <button 
            className={`tab-btn ${activeTab === 'gradient' ? 'active' : ''}`}
            onClick={() => setActiveTab('gradient')}
          >
            Gradient
          </button>
          <button 
            className={`tab-btn ${activeTab === 'palette' ? 'active' : ''}`}
            onClick={() => setActiveTab('palette')}
          >
            Palette
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="color-grid">
        {/* Left Panel - Visual Picker & Inputs */}
        <div className="color-panel picker-panel">
          <div className="panel-header">
            <div className="panel-title">
              <FaSun className="panel-icon" />
              <span>Color Picker</span>
            </div>
            <div className="panel-badge">
              {colorObj.isValid() ? (
                <span className="valid">Valid</span>
              ) : (
                <span className="invalid">Invalid</span>
              )}
            </div>
          </div>

          <div className="panel-content">
            {/* Large Preview */}
            <div 
              className="color-preview-large"
              style={{ backgroundColor: currentColor }}
            >
              <span className="preview-hex">{hex}</span>
              <div className="preview-text-samples">
                <span className="text-black" style={{ color: tinycolor.mostReadable(currentColor, ['#000000', '#ffffff']).toHexString() }}>
                  Sample Text
                </span>
              </div>
            </div>

            {/* Visual Picker */}
            {renderVisualPicker()}

            {/* Alpha Toggle */}
            <div className="alpha-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showAlpha}
                  onChange={(e) => setShowAlpha(e.target.checked)}
                />
                <span>Show Alpha Channel</span>
              </label>
            </div>

            {/* Input Fields */}
            <div className="color-inputs">
              {/* HEX Input */}
              <div className="input-row">
                <span className="input-label">HEX</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={handleColorChange}
                    className={`color-input ${inputError ? 'error' : ''}`}
                    placeholder="#RRGGBB"
                  />
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(hex, 'hex')}
                    title="Copy HEX"
                  >
                    {copySuccess.hex ? <FaCheckCircle className="success" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              {/* RGB Inputs */}
              <div className="input-row">
                <span className="input-label">RGB</span>
                <div className="rgb-inputs">
                  {['r', 'g', 'b'].map(channel => {
                    const value = colorObj.toRgb()[channel];
                    return (
                      <div key={channel} className="rgb-input-group">
                        <span className="rgb-label">{channel.toUpperCase()}</span>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleRgbChange(channel, e.target.value)}
                          min="0"
                          max="255"
                          className="number-input"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HSL Inputs */}
              <div className="input-row">
                <span className="input-label">HSL</span>
                <div className="hsl-inputs">
                  <div className="hsl-input-group">
                    <span className="hsl-label">H</span>
                    <input
                      type="number"
                      value={Math.round(colorObj.toHsl().h)}
                      onChange={(e) => handleHslChange('h', e.target.value)}
                      min="0"
                      max="360"
                      className="number-input"
                    />
                  </div>
                  <div className="hsl-input-group">
                    <span className="hsl-label">S</span>
                    <input
                      type="number"
                      value={Math.round(colorObj.toHsl().s * 100)}
                      onChange={(e) => handleHslChange('s', e.target.value)}
                      min="0"
                      max="100"
                      className="number-input"
                    />
                  </div>
                  <div className="hsl-input-group">
                    <span className="hsl-label">L</span>
                    <input
                      type="number"
                      value={Math.round(colorObj.toHsl().l * 100)}
                      onChange={(e) => handleHslChange('l', e.target.value)}
                      min="0"
                      max="100"
                      className="number-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {inputError && (
              <div className="error-message">
                <FaExclamationCircle /> {inputError}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Tints/Shades & Export */}
        <div className="color-panel export-panel">
          <div className="panel-header">
            <div className="panel-title">
              <FaSlidersH className="panel-icon" />
              <span>Tints & Shades</span>
            </div>
          </div>

          <div className="panel-content">
            {/* Tints and Shades Scale */}
            <div className="tints-shades-container">
              {tintsShades.map((item) => (
                <div 
                  key={item.percentage} 
                  className="tint-shade-row"
                  onClick={() => loadFromPalette(item.color)}
                >
                  <span className="percentage-label">{item.percentage}%</span>
                  <div 
                    className="color-swatch-small"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="hex-value">{item.color}</span>
                  <button 
                    className="copy-tiny-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.color, `tint-${item.percentage}`);
                    }}
                  >
                    {copySuccess[`tint-${item.percentage}`] ? <FaCheckCircle className="success" /> : <FaCopy />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Export Section */}
          <div className="panel-header" style={{ marginTop: '20px' }}>
            <div className="panel-title">
              <FaCode className="panel-icon" />
              <span>Export</span>
            </div>
          </div>

          <div className="panel-content">
            <div className="export-section">
              <div className="export-row">
                <span className="export-label">CSS Variable</span>
                <div className="export-value">
                  <code>{exportFormats.css}</code>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(exportFormats.css, 'css')}
                  >
                    {copySuccess.css ? <FaCheckCircle className="success" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="export-row">
                <span className="export-label">SCSS</span>
                <div className="export-value">
                  <code>{exportFormats.scss}</code>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(exportFormats.scss, 'scss')}
                  >
                    {copySuccess.scss ? <FaCheckCircle className="success" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="export-row">
                <span className="export-label">JSON</span>
                <div className="export-value">
                  <code>{exportFormats.json}</code>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(exportFormats.json, 'json')}
                  >
                    {copySuccess.json ? <FaCheckCircle className="success" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <button 
                className="download-btn"
                onClick={() => handleDownload(`:root {\n  ${exportFormats.css}\n}`, 'variables.css')}
              >
                <FaDownload /> Download CSS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Builder Tab */}
      {activeTab === 'gradient' && (
        <div className="gradient-section">
          <div className="panel-header">
            <div className="panel-title">
              <FaPalette className="panel-icon" />
              <span>Gradient Builder</span>
            </div>
          </div>

          <div className="gradient-content">
            {/* Gradient Preview */}
            <div 
              className="gradient-preview-large"
              style={{ background: gradientCss }}
            />

            {/* Angle Control */}
            <div className="gradient-controls">
              <div className="angle-control">
                <span className="control-label">Angle: {gradientAngle}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                  className="angle-slider"
                />
              </div>

              {/* Color Stops */}
              <div className="stops-track-container">
                <div className="stops-track" style={{ background: gradientCss }}>
                  {gradientStops.map((stop) => (
                    <div
                      key={stop.id}
                      className={`stop-handle ${draggingStop === stop.id ? 'dragging' : ''}`}
                      style={{ left: `${stop.position}%` }}
                      onMouseDown={(e) => {
                        setDraggingStop(stop.id);
                        const handleMouseMove = (e) => {
                          handleStopPositionChange(stop.id, 
                            Math.round(((e.clientX - e.currentTarget.parentElement.getBoundingClientRect().left) / 
                            e.currentTarget.parentElement.offsetWidth) * 100)
                          );
                        };
                        const handleMouseUp = () => {
                          setDraggingStop(null);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div 
                        className="stop-color-indicator"
                        style={{ backgroundColor: stop.color }}
                      />
                      <span className="stop-position-label">{stop.position}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stops List */}
              <div className="stops-list">
                {gradientStops.map((stop, index) => (
                  <div key={stop.id} className="stop-row">
                    <FaGripVertical className="drag-handle" />
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => handleStopColorChange(stop.id, e.target.value)}
                      className="stop-color-input"
                    />
                    <input
                      type="number"
                      value={stop.position}
                      onChange={(e) => handleStopPositionChange(stop.id, parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="stop-position-input"
                    />
                    <span className="stop-percent">%</span>
                    {gradientStops.length > 2 && (
                      <button 
                        className="remove-stop-btn"
                        onClick={() => handleRemoveStop(stop.id)}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {gradientStops.length < 10 && (
                <button className="add-stop-btn" onClick={handleAddStop}>
                  <FaPlus /> Add Color Stop
                </button>
              )}
            </div>

            {/* Gradient Export */}
            <div className="gradient-export">
              <div className="export-row">
                <span className="export-label">CSS</span>
                <div className="export-value">
                  <code>background: {gradientCss};</code>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(`background: ${gradientCss};`, 'gradient')}
                  >
                    {copySuccess.gradient ? <FaCheckCircle className="success" /> : <FaCopy />}
                  </button>
                </div>
              </div>
              <button 
                className="download-btn"
                onClick={() => handleDownload(`.gradient {\n  background: ${gradientCss};\n}`, 'gradient.css')}
              >
                <FaDownload /> Download CSS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Palette Manager Tab */}
      {activeTab === 'palette' && (
        <div className="palette-section">
          <div className="panel-header">
            <div className="panel-title">
              <FaPalette className="panel-icon" />
              <span>Palette Manager</span>
            </div>
            <button className="save-palette-btn" onClick={saveToPalette}>
              <FaSave /> Save Current Color
            </button>
          </div>

          {showPaletteInput && (
            <div className="palette-input-row">
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="Enter color name"
                className="palette-name-input"
                autoFocus
              />
              <button 
                className="save-btn"
                onClick={saveToPalette}
                disabled={!paletteName.trim()}
              >
                Save
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowPaletteInput(false)}
              >
                Cancel
              </button>
            </div>
          )}

          <div className="palette-grid">
            {palettes.map((item, index) => (
              <div
                key={item.id}
                className={`palette-item ${draggedItem === index ? 'dragging' : ''} ${dragOverItem === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <FaGripVertical className="palette-drag-handle" />
                <div 
                  className="palette-color-swatch"
                  style={{ backgroundColor: item.color }}
                  onClick={() => loadFromPalette(item.color)}
                >
                  <span className="palette-hex">{item.color}</span>
                </div>
                <div className="palette-info">
                  <span className="palette-name">{item.name}</span>
                  <button 
                    className="delete-palette-btn"
                    onClick={() => deleteFromPalette(item.id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="color-footer">
        <div className="footer-note">
          <span className="note-icon">💡</span>
          <span>Click swatches to load • Drag to reorder • Auto-saved to localStorage</span>
        </div>
        <div className="footer-shortcuts">
          <kbd>Ctrl+C</kbd> copy • <kbd>Drag</kbd> reorder
        </div>
      </div>
    </div>
  );
};

export default ColorTool;