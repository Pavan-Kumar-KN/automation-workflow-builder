import React, { memo, useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { NodeResizeControl } from '@xyflow/react';

interface StickyNoteData {
    text: string;
    color: string;
    isVisible: boolean;
    width?: number;
    height?: number;
    onChange: (id: string, text: string) => void;
    onDelete: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onResize?: (id: string, dimensions: { width: number; height: number }) => void;
}

interface StickyNoteNodeProps {
    data: StickyNoteData;
    id: string;
    selected?: boolean;
}

const StickyNoteNode = memo<StickyNoteNodeProps>(({ data, id, selected = false, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(data?.text || '');
    const [dimensions, setDimensions] = useState({
        width: data?.width || 250,
        height: data?.height || 150
    });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update local text when data changes (from external updates)
    useEffect(() => {
        if (data?.text !== undefined && data.text !== localText && !isEditing) {
            setLocalText(data.text);
        }
    }, [data?.text, localText, isEditing]);

    // Update dimensions when data changes
    useEffect(() => {
        if (data?.width && data?.height) {
            setDimensions({
                width: data.width,
                height: data.height
            });
        }
    }, [data?.width, data?.height]);

    // Calculate minimum height based on content
    const calculateMinHeight = () => {
        if (!localText) return 120;
        const lines = localText.split('\n').length;
        const estimatedHeight = Math.max(120, lines * 20 + 50); // 50px for padding and margins
        return estimatedHeight;
    };

    // Debug logging (only on mount)
    useEffect(() => {
        console.log('🔍 StickyNoteNode mounted:', { id, color: data?.color });
    }, [id, data?.color]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Auto-focus when editing starts
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;

        // Update local state immediately for responsive typing
        setLocalText(newText);

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce the graph store update (500ms delay)
        debounceTimeoutRef.current = setTimeout(() => {
            if (data?.onChange) {
                data.onChange(id, newText);
            }
        }, 500);
    };

    // Update graph store immediately when user stops editing
    const updateGraphStore = (text: string) => {
        console.log('🔍 Immediate update for note:', id, 'Text:', text);
        if (data?.onChange) {
            data.onChange(id, text);
        }
        // Clear any pending debounced update
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
    };

    const handleDoubleClick = () => {
        console.log('🔍 Double click on note:', id, 'Setting editing to true');
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        updateGraphStore(localText);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
            updateGraphStore(localText);
        }
        if (e.key === 'Enter' && e.ctrlKey) {
            updateGraphStore(localText);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        // If clicking directly on the textarea, let it handle naturally
        if (e.target === textareaRef.current) {
            setIsEditing(true);
            e.stopPropagation();
            return;
        }

        // If clicking on the note body, start editing and focus at end
        setIsEditing(true);
        e.stopPropagation();
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Place cursor at end of text instead of selecting all
                const length = textareaRef.current.value.length;
                textareaRef.current.setSelectionRange(length, length);
            }
        }, 10);
    };

    const handleFocus = () => {
        setIsEditing(true);
        // Prevent auto-selection of all text on focus
        setTimeout(() => {
            if (textareaRef.current) {
                const length = textareaRef.current.value.length;
                textareaRef.current.setSelectionRange(length, length);
            }
        }, 0);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent dragging when clicking on textarea or when editing
        if (isEditing || e.target === textareaRef.current) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    if (data?.isVisible === false) {
        return null;
    }

    return (
        <div
            className="sticky-note-node"
            style={{
                backgroundColor: data?.color || '#FEF3C7',
                border: `1px solid rgba(0,0,0,0.1)`,
                borderRadius: '8px',
                width: dimensions.width,
                height: Math.max(dimensions.height, calculateMinHeight()),
                position: 'relative',
                boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
                cursor: isEditing ? 'text' : 'grab',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'box-shadow 0.2s ease',
                padding: '16px',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            {/* Delete button - only show on hover, positioned at top center */}
            {isHovered && data?.onDelete && (
                <button
                    onClick={() => data.onDelete(id)}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 text-white rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    title="Delete note"
                >
                    <Trash2 size={12} />
                </button>
            )}

            {/* Note Content */}
            <div className="flex-1" style={{ position: 'relative', minHeight: 0 }}>
                <TextareaAutosize
                    ref={textareaRef}
                    value={localText}
                    onChange={handleTextChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onMouseDown={(e) => {
                        // Prevent text selection when clicking to edit
                        e.stopPropagation();
                    }}
                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-sm text-gray-800 placeholder-gray-500 leading-relaxed nodrag"
                    placeholder="Click to add note..."
                    minRows={3}
                    style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: '1.5',
                        cursor: 'text',
                        overflow: 'auto',
                        padding: '0',
                        margin: '0',
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>

            {/* Resize instruction text */}
            {isHovered && !isEditing && (
                <div className="absolute bottom-2 left-2 text-xs text-gray-500 opacity-70 font-medium">
                    Drag corner to resize
                </div>
            )}

            {/* NodeResizeControl with custom resize handle */}
            <NodeResizeControl
                style={{
                    background: 'transparent',
                    border: 'none',
                }}
                minWidth={200}
                minHeight={calculateMinHeight()}
                maxWidth={800}
                maxHeight={600}
                position="bottom-right"
                onResize={(event, params) => {
                    console.log('🔍 Resizing:', params);
                    if (params) {
                        const newDimensions = {
                            width: params.width,
                            height: Math.max(params.height, calculateMinHeight())
                        };
                        setDimensions(newDimensions);

                        // Persist dimensions when user resizes
                        if (data?.onResize) {
                            data.onResize(id, newDimensions);
                        }
                    }
                }}
            >
                {/* Custom resize handle that's always visible on hover */}
                {isHovered && (
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            width: '20px',
                            height: '20px',
                            cursor: 'se-resize',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                    >
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0.8,
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="8"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <polyline points="16 20 20 20 20 16" />
                                <line x1="14" y1="14" x2="20" y2="20" />
                                <polyline points="8 4 4 4 4 8" />
                                <line x1="4" y1="4" x2="10" y2="10" />
                            </svg>
                        </div>
                    </div>
                )}
            </NodeResizeControl>
        </div>
    );
});

StickyNoteNode.displayName = 'StickyNoteNode';

export default StickyNoteNode;