// src/components/pdf/SignTool.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    FaFilePdf, FaTrash, FaPen, FaEraser, FaUpload,
    FaImage, FaExclamationCircle, FaCheckCircle,
    FaArrowsAlt, FaMousePointer, FaCopy
} from 'react-icons/fa';
import { addSignature } from './pdfHelpers';

const SignTool = ({ files, setFiles, onResultReady, setLoading }) => {
    const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' or 'upload'
    const [signature, setSignature] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showSignatureWarning, setShowSignatureWarning] = useState(false);

    // Page selection
    const [pageSelection, setPageSelection] = useState('all'); // 'all', 'first', 'last', 'range', 'specific'
    const [pageRange, setPageRange] = useState('');
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [pageCount, setPageCount] = useState(0);
    const [pages, setPages] = useState([]);

    // Signature placement
    const [placementMode, setPlacementMode] = useState('preset'); // 'preset' or 'drag'
    const [presetPosition, setPresetPosition] = useState('bottom-right'); // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'
    const [customPosition, setCustomPosition] = useState({ x: 100, y: 100 });
    const [signatureSize, setSignatureSize] = useState({ width: 150, height: 75 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    const canvasRef = useRef(null);
    const previewRef = useRef(null);
    const lastX = useRef(0);
    const lastY = useRef(0);

    const onDrop = useCallback((acceptedFiles) => {
        const pdf = acceptedFiles.filter(f => f.type === 'application/pdf')[0];
        if (pdf) {
            setFiles([pdf]);
            setError('');
            setSuccess('');
        }
    }, [setFiles]);

    // Helper to check if signature is the missing piece
    const isSignatureMissing = signatureMethod === 'draw' ? !signature : !signatureFile;

    const onSignatureImageDrop = useCallback((acceptedFiles) => {
        const image = acceptedFiles[0];
        if (image) {
            // Check file size (max 2MB)
            if (image.size > 2 * 1024 * 1024) {
                setError('Signature image must be less than 2MB');
                return;
            }

            // Check dimensions
            const img = new Image();
            img.onload = () => {
                if (img.width > 500 || img.height > 300) {
                    setError('Signature image dimensions too large. Max 500x300 pixels.');
                    return;
                }
                setSignatureFile(image);
                setPreviewImage(URL.createObjectURL(image));
                setSignature(null);
                setError('');
                setSuccess('Signature image loaded successfully');
            };
            img.src = URL.createObjectURL(image);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const {
        getRootProps: getSignatureRootProps,
        getInputProps: getSignatureInputProps
    } = useDropzone({
        onDrop: onSignatureImageDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxFiles: 1,
    });

    // Load page count when PDF is uploaded
    useEffect(() => {
        const loadPageInfo = async () => {
            if (files[0]) {
                try {
                    const { getPageCount } = await import('./pdfHelpers');
                    const count = await getPageCount(files[0]);
                    setPageCount(count);
                    setPages(Array.from({ length: count }, (_, i) => i + 1));
                } catch (err) {
                    setError('Failed to load PDF page count');
                }
            }
        };
        loadPageInfo();
    }, [files]);

    // Initialize canvas
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    // Start drawing
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        setIsDrawing(true);
        lastX.current = x;
        lastY.current = y;
    };

    // Draw
    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX.current = x;
        lastY.current = y;
    };

    // Stop drawing
    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // Clear signature
    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
        setSignatureFile(null);
        setPreviewImage(null);
        setSuccess('');
    };

    // Save signature
    const saveSignature = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        setSignature(dataUrl);
        setPreviewImage(dataUrl);
        setSignatureFile(null);
        setSuccess('Signature saved successfully');
    };

    // Handle page selection
    const togglePage = (pageNum) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(pageNum)) {
            newSelected.delete(pageNum);
        } else {
            newSelected.add(pageNum);
        }
        setSelectedPages(newSelected);
    };

    const selectAllPages = () => {
        setSelectedPages(new Set(pages));
        setPageSelection('all');
    };

    const clearPageSelection = () => {
        setSelectedPages(new Set());
        setPageRange('');
    };

    // Handle preset position
    const applyPresetPosition = (preset) => {
        setPresetPosition(preset);

        // Map preset to coordinates (assuming page size 612x792 for preview)
        const positions = {
            'top-left': { x: 50, y: 650 },
            'top-right': { x: 400, y: 650 },
            'bottom-left': { x: 50, y: 50 },
            'bottom-right': { x: 400, y: 50 },
            'center': { x: 225, y: 350 }
        };

        setCustomPosition(positions[preset] || positions['bottom-right']);
    };

    // Handle drag start
    const handleDragStart = (e) => {
        if (placementMode !== 'drag' || !previewImage) return;

        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setDragOffset({ x: offsetX, y: offsetY });
        setIsDragging(true);
    };

    // Handle drag
    const handleDrag = (e) => {
        if (!isDragging || !previewRef.current) return;

        const rect = previewRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;

        // Constrain to preview area
        const constrainedX = Math.max(0, Math.min(rect.width - signatureSize.width, x));
        const constrainedY = Math.max(0, Math.min(rect.height - signatureSize.height, y));

        setCustomPosition({ x: constrainedX, y: constrainedY });
    };

    // Handle drag end
    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Get target page indices
    const getTargetPageIndices = () => {
        if (pageSelection === 'all') {
            return 'all';
        } else if (pageSelection === 'first') {
            return [0];
        } else if (pageSelection === 'last') {
            return [pageCount - 1];
        } else if (pageSelection === 'specific') {
            return Array.from(selectedPages).map(p => p - 1);
        }
        return 'all';
    };

    // Handle sign
    const handleSign = async () => {
        if (!files[0]) return;

        const signatureData = signatureMethod === 'draw' ? signature : signatureFile;
        if (!signatureData) {
            setError('Please provide a signature');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const targetPages = getTargetPageIndices();
            const result = await addSignature(files[0], signatureData, {
                pages: targetPages,
                position: customPosition,
                width: signatureSize.width,
                height: signatureSize.height
            });

            onResultReady(result);
            setSuccess('PDF signed successfully!');
        } catch (err) {
            setError('Failed to sign PDF: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFile = () => {
        setFiles([]);
        setSignature(null);
        setSignatureFile(null);
        setPreviewImage(null);
        clearSignature();
        setError('');
        setSuccess('');
        setPageCount(0);
        setPages([]);
        setSelectedPages(new Set());
    };

    // Helper function to check if canvas is blank
    const isCanvasBlank = (canvas) => {
        if (!canvas) return true;
        const context = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        return !pixelBuffer.some(color => color !== 0xffffffff);
    };

    return (
        <div>
            {files.length === 0 ? (
                <div {...getRootProps()} className="upload-area">
                    <input {...getInputProps()} />
                    <FaFilePdf size={32} />
                    {isDragActive ? (
                        <p>Drop PDF here ...</p>
                    ) : (
                        <p>Drag & drop a PDF file to sign</p>
                    )}
                </div>
            ) : (
                <>
                    <div className="file-item">
                        <div className="file-info">
                            <FaFilePdf />
                            <span>{files[0].name}</span>
                            <span className="file-size">
                                {(files[0].size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                        <button className="remove-file" onClick={removeFile} title="Remove file">
                            <FaTrash />
                        </button>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="status-message success">
                            <FaCheckCircle />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Signature Method Toggle */}
                    <div className="options-panel">
                        <h4>1. Create Signature</h4>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <button
                                className={`btn ${signatureMethod === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSignatureMethod('draw')}
                                style={{ flex: 1 }}
                            >
                                <FaPen /> Draw Signature
                            </button>
                            <button
                                className={`btn ${signatureMethod === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSignatureMethod('upload')}
                                style={{ flex: 1 }}
                            >
                                <FaUpload /> Upload Image
                            </button>
                        </div>

                        {signatureMethod === 'draw' ? (
                            /* Draw Signature */
                            <div className="signature-area">
                                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        Draw your signature:
                                    </span>
                                    <button
                                        onClick={clearSignature}
                                        className="btn-secondary"
                                        style={{ padding: '4px 12px', fontSize: 11 }}
                                    >
                                        <FaEraser /> Clear
                                    </button>
                                </div>
                                <div className="canvas-container">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={150}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        className="signature-canvas"
                                    />
                                </div>
                                <button
                                    onClick={saveSignature}
                                    className="btn-primary"
                                    style={{ marginTop: 8, padding: '6px 12px', fontSize: 12 }}
                                    disabled={isCanvasBlank(canvasRef.current)}
                                >
                                    <FaPen /> Save Signature
                                </button>
                            </div>
                        ) : (
                            /* Upload Signature Image */
                            <div {...getSignatureRootProps()} className="upload-area" style={{ padding: 16 }}>
                                <input {...getSignatureInputProps()} />
                                <FaImage size={24} />
                                {signatureFile ? (
                                    <div>
                                        <p>{signatureFile.name}</p>
                                        <img
                                            src={URL.createObjectURL(signatureFile)}
                                            alt="Signature"
                                            style={{ maxWidth: '100%', maxHeight: 100, marginTop: 8 }}
                                        />
                                    </div>
                                ) : (
                                    <p>Click or drag signature image (PNG/JPG, max 2MB, 500x300px)</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Page Selection */}
                    <div className="options-panel">
                        <h4>2. Select Pages to Sign</h4>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                            <button
                                className={`btn-small ${pageSelection === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => {
                                    setPageSelection('all');
                                    setSelectedPages(new Set(pages));
                                }}
                            >
                                All Pages ({pageCount})
                            </button>
                            <button
                                className={`btn-small ${pageSelection === 'first' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPageSelection('first')}
                            >
                                First Page
                            </button>
                            <button
                                className={`btn-small ${pageSelection === 'last' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPageSelection('last')}
                            >
                                Last Page
                            </button>
                            <button
                                className={`btn-small ${pageSelection === 'specific' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPageSelection('specific')}
                            >
                                Specific Pages
                            </button>
                        </div>

                        {pageSelection === 'specific' && pages.length > 0 && (
                            <>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <button
                                        onClick={selectAllPages}
                                        className="btn-secondary"
                                        style={{ padding: '4px 12px', fontSize: 11 }}
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={clearPageSelection}
                                        className="btn-secondary"
                                        style={{ padding: '4px 12px', fontSize: 11 }}
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                                    gap: 8,
                                    maxHeight: 150,
                                    overflowY: 'auto',
                                    padding: 8,
                                    background: 'var(--bg-primary)',
                                    borderRadius: 6
                                }}>
                                    {pages.map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => togglePage(pageNum)}
                                            style={{
                                                padding: '6px 4px',
                                                background: selectedPages.has(pageNum) ? 'var(--accent)' : 'var(--bg-secondary)',
                                                color: selectedPages.has(pageNum) ? 'white' : 'var(--text-primary)',
                                                border: `1px solid ${selectedPages.has(pageNum) ? 'var(--accent)' : 'var(--border-color)'}`,
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                fontSize: 11
                                            }}
                                        >
                                            Page {pageNum}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Signature Placement */}
                    <div className="options-panel">
                        <h4>3. Place Signature</h4>

                        {/* Placement Mode Toggle */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <button
                                className={`btn-small ${placementMode === 'preset' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPlacementMode('preset')}
                                style={{ flex: 1 }}
                            >
                                <FaMousePointer /> Preset Position
                            </button>
                            <button
                                className={`btn-small ${placementMode === 'drag' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPlacementMode('drag')}
                                style={{ flex: 1 }}
                            >
                                <FaArrowsAlt /> Drag to Place
                            </button>
                        </div>

                        {placementMode === 'preset' ? (
                            /* Preset Positions */
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                                    <button
                                        className={`btn-small ${presetPosition === 'top-left' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => applyPresetPosition('top-left')}
                                    >
                                        Top Left
                                    </button>
                                    <button
                                        className={`btn-small ${presetPosition === 'top-right' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => applyPresetPosition('top-right')}
                                    >
                                        Top Right
                                    </button>
                                    <button
                                        className={`btn-small ${presetPosition === 'center' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => applyPresetPosition('center')}
                                    >
                                        Center
                                    </button>
                                    <button
                                        className={`btn-small ${presetPosition === 'bottom-left' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => applyPresetPosition('bottom-left')}
                                    >
                                        Bottom Left
                                    </button>
                                    <button
                                        className={`btn-small ${presetPosition === 'bottom-right' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => applyPresetPosition('bottom-right')}
                                    >
                                        Bottom Right
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Drag to Place Instructions */
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                Drag the signature preview below to position it exactly where you want it.
                            </p>
                        )}

                        {/* Signature Preview with Drag */}
                        {previewImage && (
                            <div
                                ref={previewRef}
                                className="preview-box"
                                style={{
                                    position: 'relative',
                                    height: 300,
                                    background: '#f0f0f0',
                                    cursor: placementMode === 'drag' ? 'grab' : 'default',
                                    userSelect: 'none',
                                    overflow: 'hidden'
                                }}
                                onMouseMove={handleDrag}
                                onMouseUp={handleDragEnd}
                                onMouseLeave={handleDragEnd}
                            >
                                {/* Page Preview Background */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'white',
                                    border: '1px solid #ccc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                    fontSize: 12
                                }}>
                                    PDF Page Preview
                                </div>

                                {/* Signature Image */}
                                <img
                                    src={previewImage}
                                    alt="Signature"
                                    style={{
                                        position: 'absolute',
                                        left: customPosition.x,
                                        top: customPosition.y,
                                        width: signatureSize.width,
                                        height: signatureSize.height,
                                        cursor: placementMode === 'drag' ? 'grabbing' : 'pointer',
                                        border: placementMode === 'drag' ? '2px dashed var(--accent)' : 'none',
                                        padding: 2,
                                        pointerEvents: placementMode === 'drag' ? 'auto' : 'none'
                                    }}
                                    onMouseDown={placementMode === 'drag' ? handleDragStart : undefined}
                                    draggable={false}
                                />
                            </div>
                        )}

                        {/* Size Controls */}
                        <div style={{ marginTop: 16 }}>
                            <h4 style={{ fontSize: 13, marginBottom: 8 }}>Signature Size</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                        Width: {signatureSize.width}px
                                    </label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="400"
                                        value={signatureSize.width}
                                        onChange={(e) => setSignatureSize({ ...signatureSize, width: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                        Height: {signatureSize.height}px
                                    </label>
                                    <input
                                        type="range"
                                        min="30"
                                        max="200"
                                        value={signatureSize.height}
                                        onChange={(e) => setSignatureSize({ ...signatureSize, height: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <FaExclamationCircle /> {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="workspace-actions" style={{ position: 'relative' }}>
                        {/* Wrapper div to capture hover events on disabled button */}
                        <div
                            onMouseEnter={() => isSignatureMissing && setShowSignatureWarning(true)}
                            onMouseLeave={() => setShowSignatureWarning(false)}
                            style={{ display: 'inline-block' }}
                        >
                            <button
                                className="btn btn-primary"
                                onClick={handleSign}
                                disabled={
                                    !files[0] ||
                                    (signatureMethod === 'draw' ? !signature : !signatureFile) ||
                                    (pageSelection === 'specific' && selectedPages.size === 0)
                                }
                            >
                                <FaPen /> Sign PDF
                            </button>
                        </div>

                        {/* Tooltip: Show when hovering and signature is not saved */}
                        {showSignatureWarning && isSignatureMissing && (
                            <div className="button-tooltip">
                                <FaExclamationCircle className="tooltip-icon" />
                                <span>Save your signature first</span>
                                <div className="tooltip-arrow"></div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SignTool;