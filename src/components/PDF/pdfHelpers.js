// src/components/pdf/pdfHelpers.js
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';

/**
 * Load PDF from File object
 */
export async function loadPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  return await PDFDocument.load(arrayBuffer);
}

/**
 * Save PDFDocument and trigger download with custom filename
 */
export async function downloadPdf(pdfDoc, baseFilename = 'output') {
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `${baseFilename}.pdf`);
}

/**
 * Merge multiple PDFs
 */
export async function mergePdfs(fileList) {
  const mergedPdf = await PDFDocument.create();
  for (const file of fileList) {
    const pdf = await loadPdf(file);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  return mergedPdf;
}

/**
 * Split PDF by page ranges (e.g., "1-3,5,7-9")
 * Returns object with success status, message, and PDF document
 */
export async function splitPdf(file, rangeString) {
  try {
    const pdf = await loadPdf(file);
    const totalPages = pdf.getPageCount();
    
    // Parse ranges
    const ranges = parsePageRanges(rangeString, totalPages);
    const indicesToKeep = ranges.flatMap(([start, end]) => {
      const arr = [];
      for (let i = start; i <= end; i++) arr.push(i - 1);
      return arr;
    });

    if (indicesToKeep.length === 0) {
      throw new Error('No valid pages selected');
    }

    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, indicesToKeep);
    pages.forEach(page => newPdf.addPage(page));
    
    return {
      success: true,
      pdf: newPdf,
      message: `Successfully extracted ${indicesToKeep.length} page${indicesToKeep.length > 1 ? 's' : ''}`,
      pageCount: indicesToKeep.length
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Parse page range string
 */
function parsePageRanges(str, totalPages) {
  const parts = str.split(',').map(s => s.trim()).filter(s => s);
  const ranges = [];
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid range: ${part}. Pages must be between 1 and ${totalPages}`);
      }
      ranges.push([start, end]);
    } else {
      const page = Number(part);
      if (isNaN(page) || page < 1 || page > totalPages) {
        throw new Error(`Invalid page: ${part}. Pages must be between 1 and ${totalPages}`);
      }
      ranges.push([page, page]);
    }
  }
  
  return ranges;
}

/**
 * Remove pages from PDF
 */
export async function removePages(file, pageIndicesToRemove) {
  try {
    const pdf = await loadPdf(file);
    const totalPages = pdf.getPageCount();
    
    if (pageIndicesToRemove.length === 0) {
      throw new Error('No pages selected for removal');
    }
    
    if (pageIndicesToRemove.length === totalPages) {
      throw new Error('Cannot remove all pages. PDF must have at least one page.');
    }

    const indicesToKeep = pdf.getPageIndices().filter(idx => !pageIndicesToRemove.includes(idx));
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, indicesToKeep);
    pages.forEach(page => newPdf.addPage(page));
    
    return {
      success: true,
      pdf: newPdf,
      message: `Successfully removed ${pageIndicesToRemove.length} page${pageIndicesToRemove.length > 1 ? 's' : ''}`,
      pageCount: indicesToKeep.length
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Rotate PDF pages
 */
export async function rotatePdf(file, pageIndices, angle) {
  try {
    const pdf = await loadPdf(file);
    const rotationMap = {
      90: degrees(90),
      180: degrees(180),
      270: degrees(270)
    };
    const rotation = rotationMap[angle] || degrees(0);
    
    let rotatedCount = 0;
    if (pageIndices === 'all') {
      pdf.getPages().forEach(page => {
        page.setRotation(rotation);
        rotatedCount++;
      });
    } else {
      pageIndices.forEach(idx => {
        const page = pdf.getPage(idx);
        page.setRotation(rotation);
        rotatedCount++;
      });
    }
    
    return {
      success: true,
      pdf,
      message: `Successfully rotated ${rotatedCount} page${rotatedCount > 1 ? 's' : ''}`,
      pageCount: pdf.getPageCount()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Add text watermark to PDF
 */
export async function addTextWatermark(file, text, options = {}) {
  try {
    const pdf = await loadPdf(file);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    
    const {
      opacity = 0.3,
      rotation = 45,
      fontSize = 60,
      position = 'center'
    } = options;

    pages.forEach(page => {
      const { width, height } = page.getSize();
      
      // Calculate position based on option
      let x = width / 2;
      let y = height / 2;
      
      if (position === 'top') y = height - 100;
      if (position === 'bottom') y = 100;
      if (position === 'left') x = 100;
      if (position === 'right') x = width - 100;
      
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        opacity,
        rotate: degrees(rotation),
        lineHeight: fontSize,
        maxWidth: width - 100,
        textAlign: 'center',
      });
    });
    
    return {
      success: true,
      pdf,
      message: `Watermark "${text}" added successfully`,
      pageCount: pdf.getPageCount()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Add image watermark to PDF
 */
export async function addImageWatermark(file, imageFile, options = {}) {
  try {
    const pdf = await loadPdf(file);
    const pages = pdf.getPages();
    
    const {
      opacity = 0.3,
      rotation = 45,
      scale = 0.5,
      position = 'center'
    } = options;

    // Embed image
    const arrayBuffer = await imageFile.arrayBuffer();
    let image;
    if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      image = await pdf.embedJpg(arrayBuffer);
    } else if (imageFile.type === 'image/png') {
      image = await pdf.embedPng(arrayBuffer);
    } else {
      throw new Error('Unsupported image format. Please use JPG or PNG.');
    }

    const { width: imgWidth, height: imgHeight } = image.scale(1);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    pages.forEach(page => {
      const { width, height } = page.getSize();
      
      // Calculate position
      let x = (width - scaledWidth) / 2;
      let y = (height - scaledHeight) / 2;
      
      if (position === 'top') y = height - scaledHeight - 50;
      if (position === 'bottom') y = 50;
      if (position === 'left') x = 50;
      if (position === 'right') x = width - scaledWidth - 50;
      
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
        opacity,
        rotate: degrees(rotation),
      });
    });
    
    return {
      success: true,
      pdf,
      message: `Image watermark added successfully`,
      pageCount: pdf.getPageCount()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Add page numbers to PDF
 */
export async function addPageNumbers(file, options = {}) {
  try {
    const pdf = await loadPdf(file);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    
    const {
      position = 'bottom-right',
      fontSize = 12,
      startNumber = 1
    } = options;

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNum = startNumber + index;
      const text = `Page ${pageNum}`;
      
      let x, y;
      switch (position) {
        case 'top-right':
          x = width - 100;
          y = height - 30;
          break;
        case 'top-left':
          x = 50;
          y = height - 30;
          break;
        case 'bottom-center':
          x = width / 2;
          y = 30;
          break;
        case 'bottom-left':
          x = 50;
          y = 30;
          break;
        case 'bottom-right':
        default:
          x = width - 100;
          y = 30;
          break;
      }
      
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
    
    return {
      success: true,
      pdf,
      message: `Page numbers added successfully`,
      pageCount: pdf.getPageCount()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Convert images to PDF
 */
export async function imagesToPdf(imageFiles) {
  try {
    const pdf = await PDFDocument.create();
    
    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer();
      let image;
      
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdf.embedJpg(arrayBuffer);
      } else if (file.type === 'image/png') {
        image = await pdf.embedPng(arrayBuffer);
      } else {
        throw new Error(`Unsupported image type: ${file.type}`);
      }
      
      const { width, height } = image.scale(1);
      const page = pdf.addPage([width, height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });
    }
    
    return {
      success: true,
      pdf,
      message: `Successfully converted ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} to PDF`,
      pageCount: pdf.getPageCount()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Add signature to PDF (from canvas or uploaded image)
 */
export async function addSignature(file, signatureData, options = {}) {
  try {
    const pdf = await loadPdf(file);
    const pages = pdf.getPages();
    
    const {
      pageIndex = 0,
      position = { x: 100, y: 100 },
      width = 150,
      height = 75
    } = options;

    // Handle both canvas data URL and uploaded image file
    let signatureImage;
    
    if (typeof signatureData === 'string' && signatureData.startsWith('data:image')) {
      // Canvas signature
      const base64Data = signatureData.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      signatureImage = await pdf.embedPng(imageBytes);
    } else if (signatureData instanceof File) {
      // Uploaded image
      const arrayBuffer = await signatureData.arrayBuffer();
      if (signatureData.type === 'image/png') {
        signatureImage = await pdf.embedPng(arrayBuffer);
      } else if (signatureData.type === 'image/jpeg' || signatureData.type === 'image/jpg') {
        signatureImage = await pdf.embedJpg(arrayBuffer);
      } else {
        throw new Error('Signature image must be PNG or JPG');
      }
    } else {
      throw new Error('Invalid signature data');
    }

    const page = pages[pageIndex];
    page.drawImage(signatureImage, {
      x: position.x,
      y: position.y,
      width,
      height,
    });
    
    return {
      success: true,
      pdf,
      message: `Signature added successfully`,
      pageCount: pdf.getPageCount()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Get page count of PDF
 */
export async function getPageCount(file) {
  const pdf = await loadPdf(file);
  return pdf.getPageCount();
}