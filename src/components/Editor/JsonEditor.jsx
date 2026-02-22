import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import { debounce } from 'lodash';
import { validateJSON } from '../../utils/jsonUtils';
import { DEBOUNCE_DELAY } from '../../utils/constants';

const JsonEditor = forwardRef(({ theme, value, onChange, onValidate }, ref) => {
  const editorRef = useRef(null);

  // Expose editor instance to parent
  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current?.editor
  }));

  // Debounced validation
  const validate = debounce((content) => {
    const result = validateJSON(content);
    onValidate(result);
  }, DEBOUNCE_DELAY);

  const handleChange = (newValue) => {
    onChange(newValue);
    validate(newValue);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => validate.cancel();
  }, [validate]);

  return (
    <AceEditor
      ref={editorRef}
      mode="json"
      theme={theme === 'dark' ? 'monokai' : 'github'}
      value={value}
      onChange={handleChange}
      name="json-editor"
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        useWorker: false,
        showLineNumbers: true,
        tabSize: 2,
        useSoftTabs: true,
        wrap: true,
        autoScrollEditorIntoView: true,
        highlightActiveLine: true,
        showPrintMargin: false
      }}
      width="100%"
      height="100%"
      className="ace-editor"
    />
  );
});

export default JsonEditor;