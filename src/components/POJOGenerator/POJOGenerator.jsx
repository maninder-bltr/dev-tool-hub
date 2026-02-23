// POJOGenerator.jsx
import React, { useState, useMemo } from 'react';
import {
  FaTimes,
  FaCopy,
  FaEraser,
  FaExclamationCircle,
  FaJava,
  FaCode,
  FaCog,
  FaDownload
} from 'react-icons/fa';

const POJOGenerator = ({ onClose, onLoadJson }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [inputType, setInputType] = useState('json'); // 'json' or 'json-schema'
  const [className, setClassName] = useState('GeneratedClass');
  const [packageName, setPackageName] = useState('com.example.model');
  const [options, setOptions] = useState({
    useLombok: false,
    useJackson: true,
    generateGettersSetters: true,
    generateToString: false,
    generateEqualsHashCode: false,
    usePrimitives: false,
    generateBuilder: false,
    useSingularForCollections: false
  });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Detect if input is JSON Schema
  const detectInputType = (content) => {
    try {
      const parsed = JSON.parse(content);
      // Check for JSON Schema indicators
      if (parsed.$schema || parsed.type === 'object' || parsed.properties) {
        return 'json-schema';
      }
      return 'json';
    } catch {
      return null;
    }
  };

  // Convert type to Java type
  const getJavaType = (type, format, isArray = false) => {
    if (isArray) return `List<${getJavaType(type, format)}>`;
    
    switch (type) {
      case 'string':
        if (format === 'date' || format === 'date-time') return 'Date';
        if (format === 'email') return 'String';
        if (format === 'uuid') return 'UUID';
        return 'String';
      case 'integer':
        return options.usePrimitives ? 'int' : 'Integer';
      case 'number':
        return options.usePrimitives ? 'double' : 'Double';
      case 'boolean':
        return options.usePrimitives ? 'boolean' : 'Boolean';
      case 'array':
        return 'List';
      case 'object':
        return className; // Will be replaced with actual class name
      default:
        return 'Object';
    }
  };

  // Generate Java class from JSON
  const generateFromJSON = (json, className) => {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    
    // If it's an array, take the first item as template
    const template = Array.isArray(obj) && obj.length > 0 ? obj[0] : obj;
    
    return generateClassFromObject(template, className);
  };

  // Generate Java class from JSON Schema
  const generateFromJSONSchema = (schema, className) => {
    const parsed = typeof schema === 'string' ? JSON.parse(schema) : schema;
    
    if (parsed.type !== 'object' && !parsed.properties) {
      throw new Error('JSON Schema must be of type "object" and have properties');
    }
    
    return generateClassFromSchema(parsed, className);
  };

  // Generate class from object
  const generateClassFromObject = (obj, className) => {
    const fields = [];
    const imports = new Set(['java.util.*']);
    
    if (options.useJackson) {
      imports.add('com.fasterxml.jackson.annotation.*');
    }
    
    if (options.useLombok) {
      imports.add('lombok.*');
    }

    Object.entries(obj).forEach(([key, value]) => {
      const fieldName = toCamelCase(key);
      let fieldType = 'Object';
      
      if (value === null) {
        fieldType = 'Object';
      } else if (Array.isArray(value)) {
        fieldType = `List<${value.length > 0 ? getJavaTypeFromValue(value[0]) : 'Object'}>`;
        imports.add('java.util.List');
      } else if (typeof value === 'object') {
        // For nested objects, we'll create inner classes
        fieldType = toPascalCase(key);
        imports.add('java.util.*');
      } else {
        fieldType = getJavaTypeFromValue(value);
      }
      
      fields.push({
        name: fieldName,
        type: fieldType,
        value: value,
        isNested: typeof value === 'object' && value !== null && !Array.isArray(value)
      });
    });

    return buildClass(className, fields, imports, obj);
  };

  // Generate class from schema
  const generateClassFromSchema = (schema, className) => {
    const fields = [];
    const imports = new Set(['java.util.*']);
    const required = schema.required || [];
    
    if (options.useJackson) {
      imports.add('com.fasterxml.jackson.annotation.*');
    }
    
    if (options.useLombok) {
      imports.add('lombok.*');
    }

    Object.entries(schema.properties || {}).forEach(([key, prop]) => {
      const fieldName = toCamelCase(key);
      const isRequired = required.includes(key);
      const isArray = prop.type === 'array';
      const javaType = getJavaType(prop.type, prop.format, isArray);
      
      let fieldType = javaType;
      
      // Handle nested objects
      if (prop.type === 'object' && prop.properties) {
        fieldType = toPascalCase(key);
      }
      
      // Handle arrays of objects
      if (isArray && prop.items && prop.items.type === 'object' && prop.items.properties) {
        fieldType = `List<${toPascalCase(key)}>`;
      }
      
      fields.push({
        name: fieldName,
        type: fieldType,
        required: isRequired,
        isNested: prop.type === 'object' && prop.properties,
        isArray: isArray,
        schema: prop
      });
    });

    return buildClass(className, fields, imports, schema);
  };

  // Helper to get Java type from value
  const getJavaTypeFromValue = (value) => {
    if (value === null) return 'Object';
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return options.usePrimitives ? 'int' : 'Integer';
      }
      return options.usePrimitives ? 'double' : 'Double';
    }
    if (typeof value === 'boolean') return options.usePrimitives ? 'boolean' : 'Boolean';
    if (Array.isArray(value)) return 'List';
    if (typeof value === 'object') return 'Object';
    return 'String';
  };

  // Build the complete Java class
  const buildClass = (className, fields, imports, sourceObj) => {
    const pascalClassName = toPascalCase(className);
    const classParts = [];
    
    // Package
    classParts.push(`package ${packageName};`);
    classParts.push('');
    
    // Imports
    if (options.useLombok) {
      classParts.push('import lombok.Data;');
      if (options.generateBuilder) classParts.push('import lombok.Builder;');
      if (options.useSingularForCollections) classParts.push('import lombok.Singular;');
      if (options.generateToString) classParts.push('import lombok.ToString;');
      if (options.generateEqualsHashCode) classParts.push('import lombok.EqualsAndHashCode;');
    }
    
    imports.forEach(imp => classParts.push(imp));
    classParts.push('');
    
    // Class annotations
    if (options.useLombok) {
      classParts.push('@Data');
      if (options.generateBuilder) classParts.push('@Builder');
      if (options.generateToString) classParts.push('@ToString');
      if (options.generateEqualsHashCode) classParts.push('@EqualsAndHashCode');
    }
    
    if (options.useJackson) {
      classParts.push('@JsonIgnoreProperties(ignoreUnknown = true)');
      classParts.push('@JsonPropertyOrder(alphabetic = true)');
    }
    
    // Class declaration
    classParts.push(`public class ${pascalClassName} {`);
    
    // Fields
    fields.forEach(field => {
      if (options.useJackson && field.name !== toCamelCase(field.name)) {
        classParts.push(`    @JsonProperty("${field.name}")`);
      }
      
      if (options.useLombok && options.useSingularForCollections && field.type.startsWith('List<')) {
        classParts.push(`    @Singular`);
      }
      
      if (field.required && options.useJackson) {
        classParts.push(`    @JsonProperty(required = true)`);
      }
      
      classParts.push(`    private ${field.type} ${field.name};`);
    });
    
    // Getters and setters (if not using Lombok)
    if (!options.useLombok && options.generateGettersSetters) {
      fields.forEach(field => {
        const pascalName = toPascalCase(field.name);
        
        // Getter
        classParts.push('');
        classParts.push(`    public ${field.type} get${pascalName}() {`);
        classParts.push(`        return ${field.name};`);
        classParts.push(`    }`);
        
        // Setter
        classParts.push('');
        classParts.push(`    public void set${pascalName}(${field.type} ${field.name}) {`);
        classParts.push(`        this.${field.name} = ${field.name};`);
        classParts.push(`    }`);
      });
    }
    
    // Nested classes for complex objects
    fields.forEach(field => {
      if (field.isNested && sourceObj[field.name] && typeof sourceObj[field.name] === 'object') {
        classParts.push('');
        classParts.push(`    public static class ${field.type} {`);
        
        Object.entries(sourceObj[field.name]).forEach(([nestedKey, nestedValue]) => {
          const nestedType = getJavaTypeFromValue(nestedValue);
          classParts.push(`        private ${nestedType} ${toCamelCase(nestedKey)};`);
        });
        
        if (!options.useLombok) {
          classParts.push(`    }`);
        } else {
          classParts.push(`    }`);
        }
      }
    });
    
    classParts.push('}');
    
    return classParts.join('\n');
  };

  // String utilities
  const toPascalCase = (str) => {
    return str.replace(/(^\w|_\w)/g, (match) => 
      match.replace('_', '').toUpperCase()
    );
  };

  const toCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  };

  const handleConvert = () => {
    setError(null);
    setCopied(false);

    if (!input.trim()) {
      setError('Please enter JSON or JSON Schema');
      return;
    }

    try {
      const detectedType = detectInputType(input);
      if (!detectedType) {
        throw new Error('Invalid JSON or JSON Schema');
      }

      let result;
      if (inputType === 'json-schema' || (inputType === 'auto' && detectedType === 'json-schema')) {
        result = generateFromJSONSchema(input, className);
      } else {
        result = generateFromJSON(input, className);
      }
      
      setOutput(result);
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

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setCopied(false);
  };

  const getExample = () => {
    if (inputType === 'json-schema') {
      return `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "minimum": 0
    },
    "isActive": {
      "type": "boolean"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {"type": "string"},
        "city": {"type": "string"},
        "zipCode": {"type": "string"}
      }
    }
  },
  "required": ["id", "name", "email"]
}`;
    } else {
      return `{
  "id": 12345,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "isActive": true,
  "tags": ["admin", "user"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  }
}`;
    }
  };

  const loadExample = () => {
    setInput(getExample());
    setOutput('');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
        <div className="modal-header">
          <h2><FaJava /> POJO Generator</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Input Type Selection */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                value="json"
                checked={inputType === 'json'}
                onChange={() => setInputType('json')}
              />
              <span>JSON → POJO</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                value="json-schema"
                checked={inputType === 'json-schema'}
                onChange={() => setInputType('json-schema')}
              />
              <span>JSON Schema → POJO</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                value="auto"
                checked={inputType === 'auto'}
                onChange={() => setInputType('auto')}
              />
              <span>Auto-detect</span>
            </label>
          </div>

          {/* Configuration Row */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '20px',
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Class Name:</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                style={{
                  padding: '4px 8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Package:</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                style={{
                  padding: '4px 8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              />
            </div>
            <button
              onClick={() => setShowOptions(!showOptions)}
              style={{
                padding: '4px 12px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: 'auto'
              }}
            >
              <FaCog /> Options
            </button>
          </div>

          {/* Advanced Options */}
          {showOptions && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={options.useLombok}
                  onChange={(e) => setOptions({...options, useLombok: e.target.checked})}
                />
                <span>Use Lombok (@Data)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={options.useJackson}
                  onChange={(e) => setOptions({...options, useJackson: e.target.checked})}
                />
                <span>Use Jackson annotations</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={options.generateGettersSetters}
                  onChange={(e) => setOptions({...options, generateGettersSetters: e.target.checked})}
                  disabled={options.useLombok}
                />
                <span>Generate getters/setters</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={options.generateBuilder}
                  onChange={(e) => setOptions({...options, generateBuilder: e.target.checked})}
                  disabled={!options.useLombok}
                />
                <span>Generate Builder (@Builder)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={options.usePrimitives}
                  onChange={(e) => setOptions({...options, usePrimitives: e.target.checked})}
                />
                <span>Use primitives (int, double, boolean)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={options.generateToString}
                  onChange={(e) => setOptions({...options, generateToString: e.target.checked})}
                  disabled={!options.useLombok}
                />
                <span>Generate @ToString</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={options.generateEqualsHashCode}
                  onChange={(e) => setOptions({...options, generateEqualsHashCode: e.target.checked})}
                  disabled={!options.useLombok}
                />
                <span>Generate @EqualsAndHashCode</span>
              </label>
            </div>
          )}

          {/* Input/Output Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Input Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h3>Input {inputType === 'json' ? 'JSON' : inputType === 'json-schema' ? 'JSON Schema' : '(Auto)'}</h3>
                </div>
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
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setOutput('');
                  setError('');
                }}
                placeholder={`Paste ${inputType === 'json' ? 'JSON' : 'JSON Schema'} here...`}
                style={{
                  width: '100%',
                  height: '400px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0 0 8px 8px',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            {/* Output Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h3>Generated POJO</h3>
                </div>
                {output && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCopy} title="Copy to clipboard">
                      <FaCopy />
                    </button>
                    <button onClick={handleDownload} title="Download Java file">
                      <FaDownload />
                    </button>
                  </div>
                )}
              </div>
              <textarea
                readOnly
                value={output}
                placeholder="Generated Java class will appear here..."
                style={{
                  width: '100%',
                  height: '400px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0 0 8px 8px',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>
          </div>

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

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button
              onClick={handleConvert}
              disabled={!input.trim()}
              style={{
                padding: '10px 32px',
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
              <FaCode /> Generate POJO
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: '10px 32px',
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
        </div>
      </div>
    </div>
  );
};

export default POJOGenerator;