import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react';

interface StickyNotesPanelProps {
  onAddNote: (color: string) => void;
  onToggleVisibility: () => void;
  isVisible: boolean;
}

const STICKY_COLORS = [
  { name: 'Yellow', color: '#FEF3C7', border: '#F59E0B' },
  { name: 'Blue', color: '#DBEAFE', border: '#3B82F6' },
  { name: 'Green', color: '#D1FAE5', border: '#10B981' },
  { name: 'Orange', color: '#FED7AA', border: '#F97316' },
  { name: 'Cyan', color: '#CFFAFE', border: '#06B6D4' },
  { name: 'Purple', color: '#E9D5FF', border: '#8B5CF6' },
  { name: 'Pink', color: '#FCE7F3', border: '#EC4899' },
  { name: 'Gray', color: '#F3F4F6', border: '#6B7280' },
  { name: 'Red', color: '#FEE2E2', border: '#EF4444' },
  { name: 'Indigo', color: '#E0E7FF', border: '#6366F1' },
  { name: 'Emerald', color: '#D1FAE5', border: '#059669' },
  { name: 'Amber', color: '#FEF3C7', border: '#D97706' },
];

export const StickyNotesPanel: React.FC<StickyNotesPanelProps> = ({
  onAddNote,
  onToggleVisibility,
  isVisible
}) => {
  // Default to expanded on desktop/tablet, collapsed on mobile
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 640);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      // Auto-expand on desktop, keep current state on mobile
      if (!mobile && !isExpanded) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  return (
    <div className="fixed top-16 sm:top-20 left-2 sm:left-4 z-40">
      {/* Toggle Button - Only visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors mb-2"
          title="Sticky Notes"
        >
          <StickyNote className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Panel - Always visible on desktop, toggleable on mobile */}
      {(isExpanded || !isMobile) && (
        <div className="w-20 sm:w-28 bg-white rounded-lg shadow-lg border border-gray-200 p-2 sm:p-3 animate-in slide-in-from-left-2 duration-200">
          {/* Header */}
          <div className="text-xs font-medium text-gray-700 mb-2 sm:mb-3 text-center">
            Notes
          </div>

          {/* Color Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3">
            {STICKY_COLORS.slice(0, 6).map((colorOption) => (
              <button
                key={colorOption.name}
                onClick={() => onAddNote(colorOption.color)}
                className="w-4 h-4 sm:w-6 sm:h-6 rounded border-2 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                style={{
                  backgroundColor: colorOption.color,
                  borderColor: colorOption.border,
                }}
                title={`Add ${colorOption.name} note`}
              />
            ))}
          </div>

          {/* More Colors - Hidden on mobile, shown on hover/desktop */}
          <div className="hidden sm:grid grid-cols-3 gap-2 mb-3">
            {STICKY_COLORS.slice(6).map((colorOption) => (
              <button
                key={colorOption.name}
                onClick={() => onAddNote(colorOption.color)}
                className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                style={{
                  backgroundColor: colorOption.color,
                  borderColor: colorOption.border,
                }}
                title={`Add ${colorOption.name} note`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="border-t border-gray-200 pt-2 sm:pt-3 space-y-1 sm:space-y-2">
            {/* Hide/Show Notes */}
            <button
              onClick={onToggleVisibility}
              className="w-full flex items-center justify-center gap-1 px-1 sm:px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title={isVisible ? "Hide Notes" : "Show Notes"}
            >
              {isVisible ? <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              <span className="text-xs hidden sm:inline">{isVisible ? "Hide" : "Show"}</span>
            </button>

            {/* Add Note Button */}
            <button
              onClick={() => onAddNote(STICKY_COLORS[0].color)}
              className="w-full flex items-center justify-center gap-1 px-1 sm:px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Add Note"
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-xs hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
