// src/components/pdf/pdfToImageService.js
import * as PDFJS from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// For pdfjs-dist v5+, the worker is not included by default
// We need to set the worker source to the CDN or local file
// Since we're going with local worker, we need to copy the worker file
PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'; // Note the .mjs extension for v5+

/**
 * Render PDF page to image
 */
export async function renderPageToImage(pdfDoc, pageNum, format = 'png', quality = 0.9, scale = 2) {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
      background: 'white'
    }).promise;
    
    // Convert canvas to image
    let imageData;
    if (format === 'png') {
      imageData = canvas.toDataURL('image/png');
    } else {
      imageData = canvas.toDataURL('image/jpeg', quality);
    }
    
    // Clean up
    canvas.remove();
    page.cleanup();
    
    return {
      pageNum,
      imageData,
      width: canvas.width,
      height: canvas.height
    };
  } catch (err) {
    throw new Error(`Failed to render page ${pageNum}: ${err.message}`);
  }
}

/**
 * Get PDF page count
 */
export async function getPdfPageCount(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = PDFJS.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true
    });
    
    const pdfDoc = await loadingTask.promise;
    const count = pdfDoc.numPages;
    
    // Clean up
    pdfDoc.destroy();
    
    return count;
  } catch (err) {
    throw new Error('Failed to read PDF: ' + err.message);
  }
}

/**
 * Convert PDF to images with progress tracking
 */
export async function convertPdfToImages(
  file, 
  options = { 
    pages: 'all', 
    format: 'png', 
    quality: 0.9,
    scale: 2 
  },
  onProgress = (current, total) => {},
  signal // AbortSignal for cancellation
) {
  const {
    pages = 'all',
    format = 'png',
    quality = 0.9,
    scale = 2
  } = options;
  
  let pdfDoc = null;
  
  try {
    // Load PDF document
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF with proper configuration
    const loadingTask = PDFJS.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true
    });
    
    pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;
    
    // Check for cancellation
    if (signal?.aborted) {
      throw new Error('Conversion cancelled');
    }
    
    // Determine which pages to convert
    let pageIndices = [];
    if (pages === 'all') {
      pageIndices = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pageIndices = parsePageRanges(pages, totalPages);
    }
    
    if (pageIndices.length === 0) {
      throw new Error('No valid pages selected');
    }
    
    const images = [];
    
    // Render each page sequentially to avoid memory issues
    for (let i = 0; i < pageIndices.length; i++) {
      // Check for cancellation
      if (signal?.aborted) {
        throw new Error('Conversion cancelled');
      }
      
      const pageNum = pageIndices[i];
      const image = await renderPageToImage(pdfDoc, pageNum, format, quality, scale);
      images.push(image);
      
      // Report progress
      onProgress(i + 1, pageIndices.length);
    }
    
    return {
      success: true,
      images,
      pageCount: images.length,
      format,
      filename: file.name.replace('.pdf', '')
    };
  } catch (err) {
    console.error('PDF conversion error:', err);
    return {
      success: false,
      error: err.message || 'Failed to convert PDF'
    };
  } finally {
    // Clean up
    if (pdfDoc) {
      pdfDoc.destroy();
    }
  }
}

/**
 * Parse page range string
 */
export function parsePageRanges(str, totalPages) {
  const parts = str.split(',').map(s => s.trim()).filter(s => s);
  const pages = new Set();
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid range: ${part}. Pages must be between 1 and ${totalPages}`);
      }
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const page = Number(part);
      if (isNaN(page) || page < 1 || page > totalPages) {
        throw new Error(`Invalid page: ${part}. Pages must be between 1 and ${totalPages}`);
      }
      pages.add(page);
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Create ZIP file from images
 */
export async function createImageZip(images, baseFilename, format) {
  const zip = new JSZip();
  
  images.forEach((img) => {
    const pageNum = img.pageNum;
    const filename = `${baseFilename}-page-${pageNum}.${format}`;
    const base64Data = img.imageData.split(',')[1];
    zip.file(filename, base64Data, { base64: true });
  });
  
  const content = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  return content;
}

/**
 * Download single image
 */
export function downloadImage(imageData, filename) {
  const link = document.createElement('a');
  link.href = imageData;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}