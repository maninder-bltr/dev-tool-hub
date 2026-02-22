export const validateJSON = (text) => {
    try {
      JSON.parse(text);
      return { isValid: true, error: null };
    } catch (err) {
      // Extract line and column from error message
      const match = err.message.match(/at position (\d+)/);
      let line = 1, column = 1;
      if (match) {
        const pos = parseInt(match[1], 10);
        const lines = text.slice(0, pos).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
      return {
        isValid: false,
        error: {
          message: err.message,
          line,
          column
        }
      };
    }
  };
  
  export const formatJSON = (text) => {
    try {
      const obj = JSON.parse(text);
      return JSON.stringify(obj, null, 2);
    } catch {
      return text;
    }
  };
  
  export const minifyJSON = (text) => {
    try {
      const obj = JSON.parse(text);
      return JSON.stringify(obj);
    } catch {
      return text;
    }
  };
  
  export const parseJSONSafe = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };