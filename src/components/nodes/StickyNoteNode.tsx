import React, { memo, useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface StickyNoteData {
  text: string;
  color: string;
  isVisible: boolean;
  onChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

interface StickyNoteNodeProps {
  data: StickyNoteData;
  id: string;
}

const StickyNoteNode = memo<StickyNoteNodeProps>(({ data, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(data?.text || '');
  const [dimensions, setDimensions] = useState({ width: 200, height: 120 });
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Update local text when data changes (from external updates)
  useEffect(() => {
    if (data?.text !== undefined && data.text !== localText && !isEditing) {
      setLocalText(data.text);
    }
  }, [data?.text, localText, isEditing]);

  // Auto-adjust height when text changes or component mounts
  useEffect(() => {
    adjustTextareaHeight();
  }, [localText]);

  // Initial height adjustment when component mounts
  useEffect(() => {
    setTimeout(() => adjustTextareaHeight(), 100);
  }, []);

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

  // Auto-resize textarea and note based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minTextHeight = 60;
      const padding = 32; // 16px top + 16px bottom padding
      const deleteButtonSpace = 20; // Space for delete button

      const textHeight = Math.max(minTextHeight, scrollHeight);
      const totalHeight = Math.max(120, textHeight + padding + deleteButtonSpace);

      // Update both textarea and note dimensions
      textareaRef.current.style.height = `${textHeight}px`;
      setDimensions(prev => ({
        ...prev,
        height: totalHeight
      }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    // Update local state immediately for responsive typing
    setLocalText(newText);
    adjustTextareaHeight();

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
    console.log('🔍 Blur on note:', id, 'Setting editing to false, updating store');
    setIsEditing(false);
    updateGraphStore(localText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      console.log('🔍 Escape pressed on note:', id, 'Setting editing to false, updating store');
      setIsEditing(false);
      updateGraphStore(localText);
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      console.log('🔍 Ctrl+Enter pressed on note:', id, 'Updating store');
      updateGraphStore(localText);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Single click should also enable editing
    console.log('🔍 Click on note:', id, 'Setting editing to true');
    setIsEditing(true);
    e.stopPropagation(); // Prevent event bubbling
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging when clicking on textarea or when editing
    if (isEditing || e.target === textareaRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      const newWidth = Math.max(150, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(100, resizeStartRef.current.height + deltaY);

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
        position: 'relative',
        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
        cursor: isEditing ? 'text' : isResizing ? 'nw-resize' : 'grab',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: isResizing ? 'none' : 'box-shadow 0.2s ease',
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
      <div className="p-4 flex-1">
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none resize-none focus:outline-none text-sm text-gray-800 placeholder-gray-500 leading-relaxed nodrag"
          placeholder="Click to add note..."
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.5',
            cursor: 'text',
            minHeight: '60px',
            overflow: 'hidden',
          }}
        />
      </div>

      {/* Drag handle indicator */}
      {isHovered && !isEditing && (
        <div className="absolute bottom-2 right-2 text-gray-400 opacity-60">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="4" cy="4" r="1.5"/>
            <circle cx="8" cy="4" r="1.5"/>
            <circle cx="12" cy="4" r="1.5"/>
            <circle cx="4" cy="8" r="1.5"/>
            <circle cx="8" cy="8" r="1.5"/>
            <circle cx="12" cy="8" r="1.5"/>
            <circle cx="4" cy="12" r="1.5"/>
            <circle cx="8" cy="12" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
          </svg>
        </div>
      )}

      {/* Drag instruction text */}
      {isHovered && !isEditing && !data?.text && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 opacity-60">
          Drag to move
        </div>
      )}

      {/* Resize handle */}
      {isHovered && !isEditing && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-60 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(-45deg, transparent 30%, #666 30%, #666 40%, transparent 40%, transparent 60%, #666 60%, #666 70%, transparent 70%)',
          }}
          title="Drag to resize"
        />
      )}
    </div>
  );
});

StickyNoteNode.displayName = 'StickyNoteNode';

export default StickyNoteNode;
