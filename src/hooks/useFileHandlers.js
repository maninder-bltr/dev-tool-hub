import { LARGE_FILE_THRESHOLD } from '../utils/constants';

export const useFileHandlers = () => {
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > LARGE_FILE_THRESHOLD) {
        if (!window.confirm('File is large (>5MB). Performance may degrade. Continue?')) {
          reject(new Error('File too large'));
          return;
        }
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsText(file);
    });
  };

  const downloadFile = (content, filename, type = 'application/json') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { readFile, downloadFile };
};