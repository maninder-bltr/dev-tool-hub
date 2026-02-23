// XMLConverter.jsx
import React, { useState, useMemo } from 'react';
import {
  FaTimes,
  FaCopy,
  FaEraser,
  FaExclamationCircle,
  FaFileCode,
  FaAlignLeft,
  FaExchangeAlt
} from 'react-icons/fa';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

/* -------------------------- Component -------------------------- */
const XMLConverter = ({ onClose, onLoadJson, onLoadXml }) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("xml-to-json");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Configure fast-xml-parser
  const parserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseAttributeValue: true,
    trimValues: true,
    parseTagValue: true,
    arrayMode: false,
    alwaysCreateTextNode: true
  };

  const builderOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true,
    preserveOrder: false
  };

  const parser = new XMLParser(parserOptions);
  const builder = new XMLBuilder(builderOptions);

  const inputType = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    try {
      JSON.parse(trimmed);
      return "json";
    } catch {}

    if (trimmed.trim().startsWith("<") && trimmed.trim().endsWith(">")) {
      return "xml";
    }

    return null;
  }, [input]);

  const handleConvert = () => {
    setError(null);
    setCopied(false);

    if (!input.trim()) {
      setError("Input is empty");
      return;
    }

    try {
      if (mode === "xml-to-json") {
        if (inputType !== "xml") throw new Error("Valid XML required");
        
        // Parse XML to JSON
        const result = parser.parse(input);
        setOutput(JSON.stringify(result, null, 2));
      } else {
        if (inputType !== "json") throw new Error("Valid JSON required");
        
        // Parse JSON
        const jsonObj = typeof input === 'string' ? JSON.parse(input) : input;
        
        // Check if the JSON needs a root wrapper
        const keys = Object.keys(jsonObj);
        let xmlInput;
        
        if (keys.length === 1) {
          // Single key - use it as root
          xmlInput = jsonObj;
        } else {
          // Multiple keys - wrap in a root element
          xmlInput = { root: jsonObj };
        }
        
        // Build XML
        const result = builder.build(xmlInput);
        
        // Clean up the output (remove XML declaration if present)
        const cleanResult = result.replace(/<\?xml.*\?>\n?/, '');
        setOutput(cleanResult);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUse = () => {
    if (!output) return;
    mode === "xml-to-json"
      ? onLoadJson(output)
      : onLoadXml(output);
    onClose();
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setCopied(false);
  };

  const getExample = () => {
    if (mode === "xml-to-json") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>new testdata_Sheet3</name>
  <storage>
    <basePath></basePath>
    <blobPath></blobPath>
  </storage>
  <schema></schema>
  <database></database>
  <selected>true</selected>
  <modificationType>NONE</modificationType>
</root>`;
    } else {
      return `{
  "name": "new testdata_Sheet3",
  "storage": {
    "basePath": "",
    "blobPath": ""
  },
  "schema": "",
  "database": "",
  "selected": true,
  "pivotColumn": null,
  "modificationType": "NONE",
  "days_pull_MWS": "",
  "threshold_MWS": "",
  "apiTimeOutInMin": "5",
  "scope": "",
  "maxDepthOfNesting": null,
  "updateMode": "INSERT",
  "alias": "",
  "period": "",
  "autoDetectNewColumns": false,
  "isFullLoad": false,
  "batchSize": -1,
  "waitForReport": false,
  "version": "",
  "latencyPeriod": "",
  "cancelledThreshold": "",
  "intraDay": false
}`;
    }
  };

  const loadExample = () => {
    setInput(getExample());
    setOutput("");
    setError("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaFileCode /> XML ↔ JSON Converter
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Mode selection - Radio buttons */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                value="xml-to-json"
                checked={mode === 'xml-to-json'}
                onChange={() => {
                  setMode('xml-to-json');
                  setInput('');
                  setOutput('');
                  setError('');
                }}
              />
              <span><FaAlignLeft /> XML → JSON</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                value="json-to-xml"
                checked={mode === 'json-to-xml'}
                onChange={() => {
                  setMode('json-to-xml');
                  setInput('');
                  setOutput('');
                  setError('');
                }}
              />
              <span><FaExchangeAlt /> JSON → XML</span>
            </label>
          </div>

          {/* Input area with example button */}
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Input {mode === 'xml-to-json' ? 'XML:' : 'JSON:'}
            </span>
            <button 
              onClick={loadExample}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              Load Example
            </button>
          </div>

          {/* Input textarea */}
          <textarea
            placeholder={mode === 'xml-to-json' 
              ? 'Paste XML data here...\n\nExample:\n<root>\n  <name>John</name>\n  <age>30</age>\n</root>' 
              : 'Paste JSON here...\n\nThe converter will automatically wrap multiple properties in a <root> element'
            }
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput('');
              setError('');
            }}
            style={{
              width: '100%',
              height: '300px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '13px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              resize: 'vertical',
              marginBottom: '16px'
            }}
          />

          {/* Input type indicator */}
          {input && inputType && inputType !== mode.split('-')[0] && (
            <div style={{
              marginBottom: '16px',
              padding: '8px 12px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid #eab308',
              borderRadius: '6px',
              color: '#b45309',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaExclamationCircle />
              <span>Input detected as {inputType.toUpperCase()}, but {mode.split('-')[0].toUpperCase()} expected</span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div style={{ 
              color: '#dc3545', 
              margin: '10px 0',
              padding: '10px',
              background: 'rgba(220, 53, 69, 0.1)',
              borderRadius: '6px',
              fontSize: '13px',
              border: '1px solid #dc3545'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Convert button */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            <button 
              onClick={handleConvert}
              disabled={!input.trim()}
              style={{
                padding: '8px 24px',
                background: '#0066ff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: !input.trim() ? 'not-allowed' : 'pointer',
                opacity: !input.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!input.trim()) return;
                e.target.style.background = '#0052cc';
              }}
              onMouseLeave={(e) => {
                if (!input.trim()) return;
                e.target.style.background = '#0066ff';
              }}
            >
              Convert
            </button>
            <button 
              onClick={handleClear}
              style={{
                padding: '8px 24px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-tertiary)';
              }}
            >
              <FaEraser /> Clear
            </button>
          </div>

          {/* Output area */}
          {output && (
            <>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Output {mode === 'xml-to-json' ? 'JSON:' : 'XML:'}
                </span>
                {mode === 'json-to-xml' && (
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {!input.includes('{') ? 'Wrapped in <root>' : ''}
                  </span>
                )}
              </div>
              
              <textarea 
                readOnly 
                value={output} 
                style={{
                  width: '100%',
                  height: '300px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  resize: 'vertical',
                  marginBottom: '16px'
                }}
              />

              {/* Copy success message */}
              {copied && (
                <div style={{
                  marginBottom: '10px',
                  padding: '8px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid #22c55e',
                  borderRadius: '4px',
                  color: '#22c55e',
                  fontSize: '13px',
                  textAlign: 'center'
                }}>
                  Copied to clipboard!
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={handleCopy} 
                  disabled={!output}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: !output ? 'not-allowed' : 'pointer',
                    opacity: !output ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaCopy /> Copy
                </button>
                <button 
                  onClick={handleUse} 
                  disabled={!output}
                  style={{
                    padding: '8px 16px',
                    background: '#0066ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: !output ? 'not-allowed' : 'pointer',
                    opacity: !output ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Load into Editor
                </button>
                <button 
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default XMLConverter;