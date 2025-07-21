import React, { useState } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';

interface StickyNotesPanelProps {
  onAddNote: (color: string) => void;
  onToggleVisibility: () => void;
  isVisible: boolean;
  isOpen: boolean;
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
  isVisible,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 left-4 w-28 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-40">
      {/* Header */}
      <div className="text-xs font-medium text-gray-700 mb-3 text-center">
        Sticky Notes
      </div>

      {/* Color Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {STICKY_COLORS.map((colorOption) => (
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
      <div className="border-t border-gray-200 pt-3 space-y-2">
        {/* Hide/Show Notes */}
        <button
          onClick={onToggleVisibility}
          className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title={isVisible ? "Hide Notes" : "Show Notes"}
        >
          {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          <span className="text-xs">{isVisible ? "Hide" : "Show"}</span>
        </button>

        {/* Add Note Button */}
        <button
          onClick={() => onAddNote(STICKY_COLORS[0].color)}
          className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Add Note"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
