import React, { useState } from 'react';
import Papa from 'papaparse';

const CSVConverter = ({ onClose, onLoadJson }) => {
  const [mode, setMode] = useState('csv2json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [flattenNested, setFlattenNested] = useState(true);
  const [availableArrays, setAvailableArrays] = useState([]);
  const [selectedArrayIndex, setSelectedArrayIndex] = useState(0);
  const [showArraySelector, setShowArraySelector] = useState(false);

  // Helper to safely get string preview
  const getPreviewString = (obj, maxLength = 100) => {
    if (!obj) return 'null';
    try {
      const str = JSON.stringify(obj);
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    } catch (err) {
      return String(obj).substring(0, maxLength);
    }
  };

  // Convert object to array of key-value pairs for CSV
  const objectToArray = (obj) => {
    if (!obj || typeof obj !== 'object') return [obj];
    
    // If it's already an array, return it
    if (Array.isArray(obj)) return obj;
    
    // Convert object to array of objects with key-value structure
    const result = [];
    
    // Flatten the object to key-value pairs
    const flattenForCSV = (data, prefix = '') => {
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        Object.keys(data).forEach(key => {
          const value = data[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            flattenForCSV(value, newKey);
          } else {
            if (!result[0]) result[0] = {};
            result[0][newKey] = value;
          }
        });
      } else {
        if (!result[0]) result[0] = {};
        result[0][prefix] = data;
      }
    };
    
    flattenForCSV(obj);
    return result;
  };

  // Flatten nested structures to JSON strings
  const flattenObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const flattened = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (Array.isArray(value)) {
        flattened[key] = value.length > 0 ? JSON.stringify(value) : '[]';
      } else if (value && typeof value === 'object') {
        flattened[key] = Object.keys(value).length > 0 ? JSON.stringify(value) : '{}';
      } else {
        flattened[key] = value;
      }
    });
    
    return flattened;
  };

  // Deep flatten for nested objects (recursive)
  const deepFlattenObject = (obj, parentKey = '', result = {}) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    Object.keys(obj).forEach(key => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
      
      if (Array.isArray(value)) {
        result[newKey] = value.length > 0 ? JSON.stringify(value) : '[]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        deepFlattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    });
    
    return result;
  };

  const findArraysInJson = (obj, path = 'root') => {
    let arrays = [];
    
    if (!obj) return arrays;
    
    if (Array.isArray(obj)) {
      arrays.push({ path, data: obj });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const newPath = path === 'root' ? key : `${path}.${key}`;
        arrays = [...arrays, ...findArraysInJson(obj[key], newPath)];
      });
    }
    
    return arrays;
  };

  const handleConvert = () => {
    setError('');
    setOutput('');
    setLoading(true);

    try {
      if (mode === 'csv2json') {
        // CSV to JSON conversion
        Papa.parse(input, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            setLoading(false);
            if (results.errors && results.errors.length > 0) {
              setError(`CSV Error: ${results.errors[0].message}`);
            } else if (results.data && results.data.length > 0) {
              // Try to parse any JSON strings back to objects
              const parsedData = results.data.map(row => {
                const newRow = {};
                Object.keys(row).forEach(key => {
                  const value = row[key];
                  // Try to parse if it looks like JSON
                  if (typeof value === 'string' && 
                      (value.startsWith('[') || value.startsWith('{'))) {
                    try {
                      newRow[key] = JSON.parse(value);
                    } catch {
                      newRow[key] = value;
                    }
                  } else {
                    newRow[key] = value;
                  }
                });
                return newRow;
              });
              setOutput(JSON.stringify(parsedData, null, 2));
            } else {
              setError('No data found in CSV');
            }
          },
          error: (error) => {
            setLoading(false);
            setError(`Parse error: ${error.message}`);
          }
        });
      } else {
        // JSON to CSV conversion
        try {
          if (!input.trim()) {
            throw new Error('Please enter JSON data');
          }
          
          const jsonData = JSON.parse(input);
          
          // Check if it's an object (not an array) and offer to convert it
          if (!Array.isArray(jsonData) && jsonData && typeof jsonData === 'object') {
            // Offer to convert object to array of key-value pairs
            const shouldConvert = window.confirm(
              'Your JSON is an object, not an array. Do you want to convert it to an array of key-value pairs for CSV?'
            );
            
            if (shouldConvert) {
              const arrayData = objectToArray(jsonData);
              
              // Process the array data
              let processedData;
              if (flattenNested) {
                processedData = arrayData.map(item => flattenObject(item));
              } else {
                processedData = arrayData.map(item => deepFlattenObject(item));
              }

              const csv = Papa.unparse(processedData, {
                quotes: false,
                quoteChar: '"',
                escapeChar: '"',
                delimiter: ',',
                header: true,
                newline: '\n',
                skipEmptyLines: true
              });

              setOutput(csv);
              setLoading(false);
              return;
            }
          }
          
          let dataToConvert = jsonData;
          
          // Find arrays in the JSON
          const arrays = findArraysInJson(jsonData);
          
          if (arrays.length === 0) {
            // If no arrays found, treat the whole object as a single record
            const singleRecordArray = [jsonData];
            dataToConvert = singleRecordArray;
          } else if (arrays.length === 1) {
            dataToConvert = arrays[0].data;
          } else {
            // Show array selector for multiple arrays
            setAvailableArrays(arrays);
            setShowArraySelector(true);
            setLoading(false);
            return;
          }

          if (!dataToConvert || dataToConvert.length === 0) {
            throw new Error('No data to convert');
          }

          // Process each item to handle nested structures
          let processedData;
          
          if (flattenNested) {
            processedData = dataToConvert.map(item => flattenObject(item));
          } else {
            processedData = dataToConvert.map(item => deepFlattenObject(item));
          }

          // Convert to CSV
          const csv = Papa.unparse(processedData, {
            quotes: false,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ',',
            header: true,
            newline: '\n',
            skipEmptyLines: true
          });

          setOutput(csv);
          setLoading(false);
          
        } catch (err) {
          setLoading(false);
          setError(`JSON Error: ${err.message}`);
        }
      }
    } catch (err) {
      setLoading(false);
      setError(`Unexpected error: ${err.message}`);
    }
  };

  const handleArraySelect = (index) => {
    setSelectedArrayIndex(index);
  };

  const convertSelectedArray = () => {
    try {
      if (!availableArrays[selectedArrayIndex]) {
        throw new Error('No array selected');
      }
      
      const selectedData = availableArrays[selectedArrayIndex].data;
      
      if (!selectedData || selectedData.length === 0) {
        setError('Selected array is empty');
        return;
      }

      const processedData = flattenNested 
        ? selectedData.map(item => flattenObject(item))
        : selectedData.map(item => deepFlattenObject(item));

      const csv = Papa.unparse(processedData, {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        header: true,
        newline: '\n',
        skipEmptyLines: true
      });

      setOutput(csv);
      setShowArraySelector(false);
      setError('');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(`Conversion error: ${err.message}`);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    
    const extension = mode === 'csv2json' ? 'json' : 'csv';
    const mimeType = mode === 'csv2json' ? 'application/json' : 'text/csv';
    const filename = `converted.${extension}`;
    
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = () => {
    if (output && mode === 'csv2json') {
      onLoadJson(output);
      onClose();
    }
  };

  const getExample = () => {
    if (mode === 'csv2json') {
      return 'name,age,metadata\nJohn,30,"{\"city\":\"NYC\",\"tags\":[\"admin\",\"user\"]}"\nJane,25,"{\"city\":\"LDN\",\"tags\":[\"user\"]}"';
    } else {
      return '[\n  {\n    "name": "John",\n    "age": 30,\n    "metadata": {\n      "city": "NYC",\n      "tags": ["admin", "user"]\n    }\n  },\n  {\n    "name": "Jane",\n    "age": 25,\n    "metadata": {\n      "city": "LDN",\n      "tags": ["user"]\n    }\n  }\n]';
    }
  };

  const loadExample = () => {
    setInput(getExample());
    setOutput('');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>CSV ↔ JSON Converter</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {/* Mode selection */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                value="csv2json"
                checked={mode === 'csv2json'}
                onChange={() => {
                  setMode('csv2json');
                  setInput('');
                  setOutput('');
                  setError('');
                  setShowArraySelector(false);
                }}
              />
              <span>CSV → JSON</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                value="json2csv"
                checked={mode === 'json2csv'}
                onChange={() => {
                  setMode('json2csv');
                  setInput('');
                  setOutput('');
                  setError('');
                  setShowArraySelector(false);
                }}
              />
              <span>JSON → CSV</span>
            </label>
            
            {/* Nested data handling option */}
            {mode === 'json2csv' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <input
                  type="checkbox"
                  checked={flattenNested}
                  onChange={(e) => setFlattenNested(e.target.checked)}
                />
                <span>Flatten nested data (JSON strings)</span>
              </label>
            )}
          </div>
  
          {/* Input area */}
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {mode === 'csv2json' ? 'CSV Input:' : 'JSON Input:'}
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
          
          <textarea
            placeholder={mode === 'csv2json' 
              ? 'Paste CSV data here...\n\nFormat with nested JSON:\nname,age,metadata\nJohn,30,"{\"city\":\"NYC\",\"tags\":[\"admin\"]}"' 
              : 'Paste JSON here...\n\nNested objects/arrays will be preserved as JSON strings in CSV'
            }
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput('');
              setError('');
              setShowArraySelector(false);
            }}
            style={{
              width: '100%',
              height: '200px',
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
  
          {/* Array selector for multiple arrays */}
          {showArraySelector && availableArrays.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>
                Multiple arrays found. Select which one to convert:
              </h4>
              {availableArrays.map((arr, index) => {
                const preview = arr.data && arr.data[0] ? getPreviewString(arr.data[0]) : 'Empty array';
                return (
                  <label
                    key={index}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      marginBottom: '4px',
                      background: selectedArrayIndex === index ? 'var(--accent-light)' : 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="arraySelect"
                      checked={selectedArrayIndex === index}
                      onChange={() => handleArraySelect(index)}
                      style={{ marginRight: '8px' }}
                    />
                    <strong style={{ color: 'var(--text-primary)' }}>
                      Path: {arr.path}
                    </strong>
                    <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                      ({arr.data?.length || 0} items)
                    </span>
                    <div style={{ fontSize: '12px', marginTop: '4px', marginLeft: '24px', color: 'var(--text-tertiary)' }}>
                      Preview: {preview}
                    </div>
                  </label>
                );
              })}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  className="primary"
                  onClick={convertSelectedArray}
                >
                  Convert Selected Array
                </button>
                <button onClick={() => setShowArraySelector(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
  
          {/* Error display */}
          {error && (
            <div style={{ 
              color: '#dc3545', 
              margin: '10px 0',
              padding: '10px',
              background: 'var(--error-bg)',
              borderRadius: '6px',
              fontSize: '13px',
              border: '1px solid var(--error-border)'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
  
          {/* Convert button */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            <button 
              className="primary" 
              onClick={handleConvert}
              disabled={!input.trim() || loading || showArraySelector}
              style={{
                opacity: (!input.trim() || loading || showArraySelector) ? 0.6 : 1,
                cursor: (!input.trim() || loading || showArraySelector) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Converting...' : 'Convert'}
            </button>
          </div>
  
          {/* Output area */}
          {output && (
            <>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {mode === 'csv2json' ? 'JSON Output:' : 'CSV Output:'}
                </span>
                {mode === 'json2csv' && (
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Nested data preserved as JSON strings
                  </span>
                )}
              </div>
              
              <textarea 
                readOnly 
                value={output} 
                style={{
                  width: '100%',
                  height: '200px',
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
  
              {/* Action buttons */}
              <div className="modal-actions">
                <button onClick={handleCopy} disabled={!output}>
                  Copy to Clipboard
                </button>
                <button onClick={handleDownload} disabled={!output}>
                  Download {mode === 'csv2json' ? 'JSON' : 'CSV'}
                </button>
                {mode === 'csv2json' && (
                  <button className="primary" onClick={handleLoadJson} disabled={!output}>
                    Load JSON into Editor
                  </button>
                )}
                <button onClick={onClose}>Close</button>
              </div>
  
              {/* Info about nested data */}
              {mode === 'json2csv' && output.includes('"{') && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  <strong>ℹ️ Note:</strong> Nested objects/arrays have been preserved as JSON strings in the CSV. 
                  When converting back to JSON, they will be automatically parsed.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVConverter;

